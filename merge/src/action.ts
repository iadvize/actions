import { WebhookPayloadCheckSuite } from '@octokit/webhooks';
import * as core from '@actions/core';
import { GitHub, context } from '@actions/github';
import { PullsGetResponse } from '@octokit/rest';

const hasLabel = (label: string, pull: PullsGetResponse) => {
  const { labels } = pull;

  return labels.find(currentLanel => currentLanel.name === label);
};

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

    console.log(
      `Will try to merge pull requeqst #${pullInfos.number} (${pullInfos.head.ref})`
    );

    const githubToken = core.getInput('token', {
      required: true,
    });

    const label = core.getInput('label') || null;

    const github = new GitHub(githubToken);

    const response = await github.pulls.get({
      owner: event.repository.owner.login,
      repo: event.repository.name,

      // eslint-disable-next-line @typescript-eslint/camelcase
      pull_number: pullInfos.number,
    });

    if (response.status !== 200) {
      throw new Error(
        `Cannot get pull request #${pullInfos.number}. Status ${response.status}.`
      );
    }

    const pull = response.data;

    if (label && !hasLabel(label, pull)) {
      console.log(`Pull request has no ${label} label. Stopping.`);
      return;
    }

    console.log(`Mergeable state is ${pull.mergeable_state}`);
    if (pull.mergeable_state !== 'clean') {
      console.log('Mergeable state is not clean. Stopping.');
      return;
    }

    const mergeResponse = await github.pulls.merge({
      owner: event.repository.owner.login,
      repo: event.repository.name,

      // eslint-disable-next-line @typescript-eslint/camelcase
      pull_number: pullInfos.number,
    });

    if (mergeResponse.status === 200) {
      console.log(
        `Pull requeqst #${pullInfos.number} (${pullInfos.head.ref}) merged`
      );
    } else {
      console.log(
        `Failed to merge #${pullInfos.number} (${pullInfos.head.ref}). Status ${mergeResponse.status}`
      );
    }
  } catch (error) {
    console.error(error);
    core.setFailed(error.message);
  }
}
