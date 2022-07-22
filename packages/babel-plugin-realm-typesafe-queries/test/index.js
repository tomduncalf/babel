import runner from "@babel/helper-plugin-test-runner";

runner(import.meta.url, {
  onlyTasks: ["react"],
  //   // "array methods",
  //   "string methods",
  //   // "unary operators",
  // ],
});
