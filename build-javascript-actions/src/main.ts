import childProcess from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import { promisify } from 'util';

import core from '@actions/core';

const exec = promisify(childProcess.exec);

async function findJavascriptActions(rootDir: string) {
  const contents = await fs.readdir(rootDir);

  const buildPath = (fileOrDirectoryName: string) => path.join(
    rootDir,
    fileOrDirectoryName
  );

  const isDirectory = (path: string) => fs.statSync(path).isDirectory();
  const isAction = (directoryPath: string) => fs.existsSync(
    path.join(directoryPath, 'action.yml')
  );
  const hasJavascript = (directoryPath: string) => fs.existsSync(
    path.join(directoryPath, 'package.json')
  );

  const javascriptActionDirectoryPaths = contents
    .map(buildPath)
    .filter(isDirectory)
    .filter(isAction)
    .filter(hasJavascript);

  return javascriptActionDirectoryPaths;
}

async function cleanActionGitignore(
  actionDirectory: string,
  buildDirectory: string | null,
) {
  const gitignorePath = path.join(actionDirectory, '.gitignore');
  const gitignoreExists = fs.existsSync(gitignorePath);

  if (!gitignoreExists) { // nothing to do
    return;
  }

  await exec(`sed -i '/node_modules/d' ${gitignorePath}`);
  if (buildDirectory) {
    await exec(`sed -i '/${buildDirectory}/d' ${gitignorePath}`);
  }
}

async function buildAction(
  actionDirectory: string,
  installCommand: string,
  buildCommand: string
) {
  const context = {
    cwd: actionDirectory,
  };

  await exec(installCommand, context);
  await exec(buildCommand, context);
}

async function run() {
  try {
    const actionsDirectory = core.getInput('actions_directory', { required: true });

    // directory where javascript build output is stored. null means no build
    const buildDirectory = core.getInput('build_directory') || null

    const installCommand = core.getInput('install_command', { required: true });
    const buildCommand = core.getInput('build_command', { required: true });

    const actionDirectories = await findJavascriptActions(actionsDirectory);

    for (const actionDirectory of actionDirectories) {
      console.log(`Found ${actionDirectory} javascript action`);

      console.log(`Cleaning ${actionDirectory} .gitignore`);
      await cleanActionGitignore(actionDirectory, buildDirectory);

      console.log(`Building ${actionDirectory}`);
      await buildAction(
        actionDirectory,
        installCommand,
        buildCommand
      );

      console.log(`${actionDirectory} done`);
    }
  } catch (error) {
    console.error(error);
    core.setFailed(error.message);
  }
}

run();
