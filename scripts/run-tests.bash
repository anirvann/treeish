#!/usr/bin/env bash

set -e

cd "${0%/*}/.."

echo "Running tests"
# Change below line "npm test" according to your npm script
npm test
