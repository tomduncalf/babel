import { declare } from "@babel/helper-plugin-utils";
import { types as t } from "@babel/core";
// import syntaxTypeScript from "@babel/plugin-syntax-typescript";
const fs = require("fs");
const util = require("util");

const makeFilterVisitor = () => {
  let result = "";

  return {
    visitor: {
      BinaryExpression(path) {
        result += "lalal"; //path.node.left.name;
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
        path.replaceWith(t.stringLiteral(visitor.result));
        // path.replaceWith(t.stringLiteral("asd"));
        // path.replaceWith(path.traverse(filterVisitor)); //;//t.stringLiteral("asd"));
      },

      // MemberExpression(path) {
      //   fs.writeFileSync("/tmp/asd", util.inspect(path));
      //   if (path.node.property && path.node.property.name === "filtered") {
      //     // path.node.arguments[0].replaceWith(t.stringLiteral("asd"));
      //   }
      // },

      BinaryExpression(path) {
        // console.log(path);
        // path.remove();

        const { node } = path;
        if (node.operator === "===" && isFilterExpression(node)) {
          path.replaceWith(
            t.callExpression(
              t.memberExpression(node.left, t.identifier("gt")),
              [node.right],
            ),
          );
        }
      },
    },
  };
});

function isFilterExpression(node: any) {
  return true;
}
