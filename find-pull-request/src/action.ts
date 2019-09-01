import * as core from '@actions/core';
import { PullsGetResponse } from '@octokit/rest';
import { GitHub } from '@actions/github';

// incomplete type for issuesAndPullRequests response that returns any
type SearchPRResponse = {
  id: PullsGetResponse['id'];
  number: PullsGetResponse['number'];
};

export async function run() {
  try {
    const githubToken = core.getInput('token', {
      required: true,
    });

    const defaultRepository = process.env.GITHUB_REPOSITORY || null;
    if (!defaultRepository) {
      throw new Error('Missing GITHUB_REPOSITORY env var');
    }

    const repository = core.getInput('repository') || defaultRepository;

    const currentRef = process.env.GITHUB_REF || null;

    const ref = core.getInput('branch') || currentRef;
    if (!ref) {
      throw new Error(
        'Missing GITHUB_REF and branch input. Cannot get branch info'
      );
    }

    // ref looks like refs/heads/my-branch
    // TODO could also be a tag (https://help.github.com/en/articles/virtual-environments-for-github-actions)
    // should we handle it here ?
    const branch = ref.replace('refs/heads/', '');

    const github = new GitHub(githubToken);

    const query = `repo:${repository} is:pr head:${branch}`;

    const {
      data: { items },
    } = await github.search.issuesAndPullRequests({
      q: query,
      sort: 'updated',
      order: 'desc',
      // eslint-disable-next-line @typescript-eslint/camelcase
      per_page: 1,
    });

    const pulls = items as SearchPRResponse[];

    if (pulls.length === 0) {
      core.setOutput('pullExists', 'false');
      core.setOutput('pullNumber', '-1');
      return;
    }

    const pull = pulls[0];

    core.setOutput('pullExists', 'true');
    core.setOutput('pullNumber', `${pull.number}`);
  } catch (error) {
    console.error(error);
    core.setFailed(error.message);
  }
}
