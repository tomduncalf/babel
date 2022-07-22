import runner from "@babel/helper-plugin-test-runner";

runner(import.meta.url, {
  onlyTasks: ["collection operators"],
  // [
  //   "react",
  //   "array methods",
  //   "string methods",
  //   "unary operators",
  // ],
});
