import { readFileSync, writeFileSync } from 'fs';
import * as core from '@actions/core';

import remark from 'remark';
import bumpVersionPlugin from '@jarrodldavis/remark-changelog-version-bump';

export async function run() {
  try {
    const path = core.getInput('path', {
      required: true,
    });

    const version = core.getInput('version', {
      required: true,
    });

    const content = readFileSync(path, { encoding: 'utf8' });

    remark()
      .use(bumpVersionPlugin, { version })
      .process(content, function(error, file) {
        if (error) {
          throw error;
        }

        const finalContent = String(file);
        writeFileSync(path, finalContent, { encoding: 'utf8' });
      });
  } catch (error) {
    console.error(error);
    core.setFailed(error.message);
  }
}
