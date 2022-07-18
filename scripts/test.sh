#!/bin/bash
set -e

# node="yarn node"
node="replay-node"
jestArgs=()

if [ "$TEST_DEBUG" ]; then
  node="$node --inspect-brk"
  jestArgs+=("--runInBand")
fi

if [ -n "$CI" ]; then
  jestArgs+=("--maxWorkers=4")
  jestArgs+=("--ci")
fi

if [ -n "$TEST_GREP" ]; then
  jestArgs+=("-t")
  jestArgs+=("$TEST_GREP")
fi

if [ -n "$TEST_ONLY" ]; then
  jestArgs+=("(packages|codemods|eslint)/.*$TEST_ONLY.*/test")
fi

$node "$(yarn bin jest)" "${jestArgs[@]}"
