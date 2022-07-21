import runner from "@babel/helper-plugin-test-runner";

runner(import.meta.url, { onlyTasks: ["array methods"] });
