import { declare } from "@babel/helper-plugin-utils";
import { PluginPass, types as t } from "@babel/core";
import { Visitor } from "@babel/traverse";
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
        console.log("filter BinaryExpression");
        const operator = OPERATOR_MAP[path.node.operator] || path.node.operator;

        let value;
        if (path.node.right.type === "Identifier") {
          value = `$${result.captures.length}`;
          result.captures.push(path.node.right.name);
        } else {
          value = path.node.right.value;
        }

        path.replaceWith(
          t.stringLiteral(
            path.node.left.property.name + " " + operator + " " + value,
          ),
        );
      },

      UnaryExpression(path) {
        console.log("filter UnaryExpression");

        if (path.node.operator !== "!") {
          throw new Error(
            `Unsupported operator ${path.node.operator} for UnaryExpression`,
          );
        }

        path.replaceWith(
          t.stringLiteral(`${path.node.argument.property.name} == false`),
        );
      },

      // LogicalExpression(path) {
      //   // result.value += "blah";
      //   const leftVisitor = makeFilterVisitor();
      //   const rightVisitor = makeFilterVisitor();

      //   path.get("left").traverse(leftVisitor.visitor);
      //   path.get("right").traverse(rightVisitor.visitor);
      //   // console.log(path.get("body"), leftVisitor.result);

      //   result.value += `(${leftVisitor.result.value} ${path.node.operator} ${rightVisitor.result.value})`;

      //   path.skip();
      // },
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
        console.log("ArroWfunction");

        const visitor = makeFilterVisitor();
        path.traverse(visitor.visitor);
        // console.log(path.node.body); //.forEach(x => console.log(x))); // .get("body"));
        path.replaceWith(path.node.body);
        // path.replaceWith(t.nullLiteral);
        // path.parentPath.node.arguments = [
        //   t.stringLiteral(visitor.result.value),
        //   ...visitor.result.captures.map(capture => t.identifier(capture)),
        // ];
      },
    },
  };
});
