import { declare } from "@babel/helper-plugin-utils";
import { types as t } from "@babel/core";
// import syntaxTypeScript from "@babel/plugin-syntax-typescript";
const fs = require("fs");
const util = require("util");

const makeFilterVisitor = () => {
  const result = { value: "", captures: [] };

  return {
    visitor: {
      BinaryExpression(path) {
        const operator =
          path.node.operator === "===" ? "==" : path.node.operator;

        let value;
        if (path.node.right.type === "Identifier") {
          value = `$${result.captures.length}`;
          result.captures.push(path.node.right.name);
        } else {
          value = path.node.right.value;
        }

        result.value +=
          path.node.left.property.name + " " + operator + " " + value;
      },
    },
    result,
  };
};

export default declare(api => {
  api.assertVersion(7);

  return {
    name: "realm-typesafe-queries",
    // inherits: syntaxTypeScript,

    visitor: {
      ArrowFunctionExpression(path) {
        const visitor = makeFilterVisitor();
        path.traverse(visitor.visitor);
        // path.replaceWith(t.nullLiteral);
        path.parentPath.node.arguments = [
          t.stringLiteral(visitor.result.value),
          ...visitor.result.captures.map(capture => t.identifier(capture)),
        ];
      },
    },
  };
});
