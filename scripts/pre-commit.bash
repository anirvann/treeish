#!/usr/bin/env bash

echo "Running pre-commit hook"
./scripts/run-tests.bash

# 0 stores exit value of the last command
if [ 0 -ne 0 ]; then
 echo "Tests must pass before commit!"
 exit 1
fi
