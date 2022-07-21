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

const STRING_FN_MAP = {
  startsWith: "BEGINSWITH",
  endsWidth: "ENDSWITH",
  contains: "CONTAINS",
  like: "LIKE",
};

const ARRAY_FN_MAP = {
  any: "ANY",
  all: "ALL",
};

const makeFilterVisitor = (): FilterVisitorReturn => {
  const result: FilterVisitorResult = { value: "", captures: [] };
  let captures = 0;

  return {
    visitor: {
      BinaryExpression(path) {
        const operator = OPERATOR_MAP[path.node.operator] || path.node.operator;

        let value;
        let capture;
        if (path.node.right.type === "Identifier") {
          value = `$${captures}`;
          capture = path.node.right.name;
          captures++;
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
            ].filter(x => x !== undefined),
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
          const els = [
            t.stringLiteral(
              `${path.node.left.elements[0].value} ${path.node.operator} ${path.node.right.elements[0].value}`,
            ),
            path.node.left.elements[1],
            path.node.right.elements[1],
          ].filter(x => x !== undefined);

          // console.log({ els });
          path.replaceWith(t.arrayExpression(els));

          // console.log(path.toString());
        },
      },

      CallExpression: {
        enter(path) {
          // debugger;
          // path.skip();
          path.replaceWith(path.node.callee);
        },

        // handle array method calls like .any(x => x.y === z)
        exit(path) {
          debugger;
          // get the string value out of the expression and prefix it with the operator
          path.replaceWith(
            //${ARRAY_FN_MAP[path.]
            t.stringLiteral(path.node.arguments[0].body.elements[0]),
          );
        },
      },

      MemberExpression(path) {
        // debugger;
        // handle calls to string methods

        const stringFn = STRING_FN_MAP[path.node.property?.name];
        if (stringFn) {
          // TODO duplicated logic
          let value;
          let capture;
          const valueNode = path.parentPath.node.arguments[0];
          if (valueNode.type === "Identifier") {
            value = `$${captures}`;
            capture = valueNode.name;
            captures++;
          } else {
            value = `"${valueNode.value}"`;
          }

          const property = path.node.object.property.name;
          const modifier = path.parentPath.node.arguments[1]?.value
            ? "[c]"
            : "";

          path.parentPath.replaceWith(
            t.arrayExpression(
              [
                t.stringLiteral(`${property} ${stringFn}${modifier} ${value}`),
                capture ? t.identifier(capture) : undefined,
              ].filter(x => x !== undefined),
            ),
          );
        } else {
          const { name } = path.node.property;
          // TODO hack
          if (name === "any" || name === "all") return;

          // unary true operator
          path.replaceWith(
            t.arrayExpression([t.stringLiteral(`${name} == true`)]),
          );
        }
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
      ArrowFunctionExpression: {
        enter(path) {
          const caller = path.parent?.callee?.property?.name;

          if (caller !== "filtered") {
            return;
          }
          const visitor = makeFilterVisitor();
          path.traverse(visitor.visitor);
          // console.log(path.node.body); //.forEach(x => console.log(x))); // .get("body"));
          const body = path.node.body;
          // debugger;
          // path.node.params = [body.elements[0], body.elements[1]
          path.parentPath.node.arguments = body.elements;
          // debugger;
          // debugger;
          // path.replaceWith(t.argumentPlaceholder());
          // path.replaceWith(t.nullLiteral);
          // path.parentPath.node.arguments = [
          //   t.stringLiteral(visitor.result.value),
          //   ...visitor.result.captures.map(capture => t.identifier(capture)),
          // ];
        },
      },
    },
  };
});
