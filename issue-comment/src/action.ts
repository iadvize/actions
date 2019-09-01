import * as core from '@actions/core';
import { GitHub } from '@actions/github';

export async function run() {
  try {
    const issueNumber = core.getInput('issue_number', {
      required: true,
    });

    const githubToken = core.getInput('token', {
      required: true,
    });

    const comment = core.getInput('comment', {
      required: true,
    });

    const defaultRepository = process.env.GITHUB_REPOSITORY || null;
    if (!defaultRepository) {
      throw new Error('Missing GITHUB_REPOSITORY env var');
    }

    const repository = core.getInput('repository') || defaultRepository;

    const github = new GitHub(githubToken);

    const [owner, repo] = repository.split(/\/(.+)/); // split on first /

    await github.issues.createComment({
      owner,
      repo,

      // eslint-disable-next-line @typescript-eslint/camelcase
      issue_number: parseInt(issueNumber, 10),

      body: comment,
    });
  } catch (error) {
    console.error(error);
    core.setFailed(error.message);
  }
}
