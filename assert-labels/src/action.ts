import * as core from '@actions/core';
import { context } from '@actions/github';
import {
  WebhookPayloadPullRequest,
  WebhookPayloadLabelLabel,
} from '@octokit/webhooks';

function isOneOfRequiredLabels(requiredLabelNames: string[]) {
  return (label: WebhookPayloadLabelLabel) =>
    requiredLabelNames.includes(label.name);
}

export async function run() {
  try {
    if (context.eventName !== 'pull_request') {
      throw new Error('Action should only be used on pull_request event');
    }

    const onlyOneOfLabelsString = core.getInput('only-one-of', {
      required: true,
    });

    core.debug(`Required labels are ${onlyOneOfLabelsString}`);

    const onlyOneOfLabels: string[] = onlyOneOfLabelsString
      .split(',')
      .map(text => text.trim());

    const event = context.payload as WebhookPayloadPullRequest;
    const pullLabels: WebhookPayloadLabelLabel[] = event.pull_request.labels;

    const matchingLabels = pullLabels.filter(
      isOneOfRequiredLabels(onlyOneOfLabels)
    );

    if (matchingLabels.length === 1) {
      core.setOutput('valid', 'true');
      core.setOutput('label', `${matchingLabels[0].name}`);

      return;
    }

    core.debug(`${matchingLabels.length} matching labels`);

    core.setOutput('valid', 'false');
  } catch (error) {
    console.error(error);
    core.setFailed(error.message);
  }
}
