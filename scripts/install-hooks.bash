#!/usr/bin/env bash

GIT_DIR=$(git rev-parse --git-dir)

printf -- "[36m LOG:		[1mInstalling hooks [0m";
# this command creates symlink to our pre-commit script
ln -s ../../scripts/pre-commit.bash .git/hooks/pre-commit
