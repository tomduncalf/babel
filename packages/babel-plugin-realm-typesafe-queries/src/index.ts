import { declare } from "@babel/helper-plugin-utils";
import { PluginPass, types as t } from "@babel/core";
// import { Visitor } from "babel-traverse";
// import syntaxTypeScript from "@babel/plugin-syntax-typescript";
const fs = require("fs");
const util = require("util");

type FilterVisitorResult = {
  value: "";
  captures: string[];
};

type FilterVisitorReturn = {
  visitor: Visitor<PluginPass>;
  result: FilterVisitorResult;
};

const OPERATOR_MAP = {
  "===": "==",
  "!==": "!=",
};

const makeFilterVisitor = (): FilterVisitorReturn => {
  const result: FilterVisitorResult = { value: "", captures: [] };

  return {
    visitor: {
      BinaryExpression(path) {
        const operator = OPERATOR_MAP[path.node.operator] || path.node.operator;

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

      UnaryExpression(path) {
        if (path.node.operator !== "!") {
          throw new Error(
            `Unsupported operator ${path.node.operator} for UnaryExpression`,
          );
        }

        result.value += `${path.node.argument.property.name} == false`;
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
