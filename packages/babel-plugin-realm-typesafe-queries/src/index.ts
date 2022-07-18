import { declare } from "@babel/helper-plugin-utils";
import { types as t } from "@babel/core";
// import syntaxTypeScript from "@babel/plugin-syntax-typescript";
// const fs = require("fs");

export default declare(api => {
  api.assertVersion(7);

  return {
    name: "realm-typesafe-queries",
    // inherits: syntaxTypeScript,

    visitor: {
      BinaryExpression(path) {
        // fs.writeFileSync("/tmp/asd", JSON.stringify(path));
        // console.log(path);
        // path.remove();

        const { node } = path;
        if (node.operator === ">") {
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
