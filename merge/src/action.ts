import { WebhookPayloadCheckSuite } from '@octokit/webhooks';
import * as core from '@actions/core';
import { GitHub, context } from '@actions/github';
import { PullsGetResponse } from '@octokit/rest';

import { removePRLabel } from './label';
import { sendPRComment } from './comment';
import { delay } from './delay';

const RETRY_DELAY = 5000;

const hasLabel = (label: string, pull: PullsGetResponse) => {
  const { labels } = pull;

  return labels.find(currentLanel => currentLanel.name === label);
};

type MergeResult = 'done' | 'impossible' | 'need retry';
async function merge(
  github: GitHub,
  pullNumber: PullsGetResponse['number'],
  label: string | null
): Promise<MergeResult> {
  const response = await github.pulls.get({
    owner: context.repo.owner,
    repo: context.repo.repo,

    // eslint-disable-next-line @typescript-eslint/camelcase
    pull_number: pullNumber,
  });

  if (response.status !== 200) {
    throw new Error(
      `Cannot get pull request #${pullNumber}. Status ${response.status}.`
    );
  }

  const pull = response.data;

  if (label && !hasLabel(label, pull)) {
    console.log(`Pull request has no ${label} label. Stopping.`);
    return 'done';
  }

  console.log(`Mergeable is ${pull.mergeable}`);
  if (pull.mergeable === null) {
    console.log('Need retry');
    return 'need retry';
  }

  if (pull.mergeable !== true) {
    return 'impossible';
  }

  const mergeResponse = await github.pulls.merge({
    owner: context.repo.owner,
    repo: context.repo.repo,

    // eslint-disable-next-line @typescript-eslint/camelcase
    pull_number: pullNumber,
  });

  if (mergeResponse.status === 200) {
    return 'done';
  } else {
    throw new Error(
      `Failed to merge #${pullNumber}. Status ${mergeResponse.status}`
    );
  }
}

export async function run() {
  try {
    if (context.eventName !== 'check_suite') {
      throw new Error('Should only run on check_suite');
    }

    const event = context.payload as WebhookPayloadCheckSuite;

    if (event.action !== 'completed') {
      console.log('Check Suite is not completed. Nothing to do. Stopping.');
      return;
    }

    if (event.check_suite.conclusion !== 'success') {
      console.log('Check Suite is not completed. Nothing to do. Stopping.');
      return;
    }

    const pulls = event.check_suite.pull_requests;

    if (pulls.length === 0) {
      console.log('No PR for this check_suite. Stopping.');
      return;
    }

    console.log(`${pulls.length} pull request for this check_suite`);

    const pullInfos = pulls[0];

    const githubToken = core.getInput('token', {
      required: true,
    });

    const label = core.getInput('label') || null;

    const github = new GitHub(githubToken);

    let numberRetries = 1;
    let result: MergeResult = 'need retry';
    do {
      console.log(`Will try to merge pull requeqst #${pullInfos.number}`);

      result = await merge(github, pullInfos.number, label);
      console.log(`Merge result is ${result}`);

      numberRetries++;

      await delay(RETRY_DELAY);
    } while (numberRetries < 21 && result !== 'done');

    if (result !== 'done') {
      console.log(`Failed to merge pull request #${pullInfos.number}`);

      if (label) {
        await removePRLabel(github, pullInfos.number, label);
        await sendPRComment(
          github,
          pullInfos.number,
          `Removing label ${label} because pull request is not mergeable `
        );
      }

      return;
    }

    console.log(`Pull request #${pullInfos.number} merged`);
  } catch (error) {
    console.error(error);
    core.setFailed(error.message);
  }
}
