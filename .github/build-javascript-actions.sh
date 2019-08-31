#!/usr/bin/env bash

isJavascriptAction() {
  path=$1
  # if not directory
  if [ ! -d "$path" ]; then
    return 1;
  fi

  # if not an action
  if [ ! -f "$path/action.yml" ]; then
    return 1;
  fi

  # if no javascript
  if [ ! -f "$path/package.json" ]; then
    return 1;
  fi

  # ok no failure
  return 0;
}

cleanActionGitIgnore() {
  file=$1/.gitignore

  # if no .gitignore, it's ok
  if [ ! -f "$file" ]; then
    return 0;
  fi

  # remove node_modules and lib lines
  sed -i '/node_modules/d' $file
  sed -i '/lib/d' $file
}

buildAction() {
  directory=$1

  (cd $directory && npm install)
  (cd $directory && npm run build)
}

for directory in $(find . -maxdepth 1 -mindepth 1 -type d -not -path '*/\.*'); do
  echo Found directory $directory

  if ! isJavascriptAction $directory; then
    echo $directory is not a Javascript action. Skipping.
    continue;
  fi

  echo Cleaning action .gitignore
  cleanActionGitIgnore $directory

  echo Building action
  buildAction $directory

  echo $directory done.
done
