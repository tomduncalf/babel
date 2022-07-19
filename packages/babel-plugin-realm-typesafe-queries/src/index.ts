import { declare } from "@babel/helper-plugin-utils";
import { PluginPass, types as t } from "@babel/core";
import { Visitor } from "@babel/traverse";
import { exit } from "process";
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
        let capture;
        if (path.node.right.type === "Identifier") {
          value = `$${result.captures.length}`;
          capture = path.node.right.name;
        } else {
          value = path.node.right.value;
        }

        path.replaceWith(
          t.arrayExpression(
            [
              t.stringLiteral(
                path.node.left.property.name + " " + operator + " " + value,
              ),
              capture ? t.identifier(capture) : undefined,
            ].filter(x => !!x),
          ),
        );
      },

      UnaryExpression(path) {
        if (path.node.operator !== "!") {
          throw new Error(
            `Unsupported operator ${path.node.operator} for UnaryExpression`,
          );
        }

        path.replaceWith(
          t.arrayExpression([
            t.stringLiteral(`${path.node.argument.property.name} == false`),
          ]),
        );
      },

      LogicalExpression: {
        exit(path) {
          console.log(path.toString());
        },
      },
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
        const visitor = makeFilterVisitor();
        path.traverse(visitor.visitor);
        // console.log(path.node.body); //.forEach(x => console.log(x))); // .get("body"));
        const body = path.node.body;
        // debugger;
        // path.node.params = [body.elements[0], body.elements[1]
        path.parentPath.node.arguments = body.elements;
        debugger;
        // debugger;
        // path.replaceWith(t.argumentPlaceholder());
        // path.replaceWith(t.nullLiteral);
        // path.parentPath.node.arguments = [
        //   t.stringLiteral(visitor.result.value),
        //   ...visitor.result.captures.map(capture => t.identifier(capture)),
        // ];
      },
    },
  };
});
