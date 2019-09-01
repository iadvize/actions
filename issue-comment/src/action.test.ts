import * as core from '@actions/core';
import { GitHub } from '@actions/github';

import { run } from './action';

jest.mock('@actions/core');
jest.mock('@actions/github');

const githubInstance = {
  issues: {
    createComment: jest.fn(),
  },
};

((GitHub as unknown) as jest.Mock).mockImplementation(function() {
  return githubInstance;
});

const issueNumber = 134;
const githubToken = '13443245412324';
const comment = 'A comment';
const owner = 'my-owner';
const repo = 'my-repo';
const fullRepo = `${owner}/${repo}`;

describe('action', () => {
  afterEach(() => {
    githubInstance.issues.createComment.mockRestore();
  });

  it('should send message to GITHUB_REPOSITORY', async () => {
    (core.getInput as jest.Mock).mockImplementation((input: string): string => {
      switch (input) {
        case 'issue_number':
          return `${issueNumber}`;

        case 'token':
          return githubToken;

        case 'comment':
          return comment;

        case 'repository':
          return '';

        default:
          throw new Error('should not go here in getInput mock');
      }
    });

    process.env.GITHUB_REPOSITORY = fullRepo;

    await expect(run()).resolves.toBeUndefined();

    expect(githubInstance.issues.createComment).toHaveBeenCalledWith({
      owner,
      repo,

      // eslint-disable-next-line @typescript-eslint/camelcase
      issue_number: issueNumber,

      body: comment,
    });
  });

  it('should send message to repository input', async () => {
    (core.getInput as jest.Mock).mockImplementation((input: string): string => {
      switch (input) {
        case 'issue_number':
          return `${issueNumber}`;

        case 'token':
          return githubToken;

        case 'comment':
          return comment;

        case 'repository':
          return fullRepo;

        default:
          throw new Error('should not go here in getInput mock');
      }
    });

    process.env.GITHUB_REPOSITORY = 'other/repo';

    await expect(run()).resolves.toBeUndefined();

    expect(githubInstance.issues.createComment).toHaveBeenCalledWith({
      owner,
      repo,

      // eslint-disable-next-line @typescript-eslint/camelcase
      issue_number: issueNumber,

      body: comment,
    });
  });

  it('should fail if no GITHUB_REPOSITORY', async () => {
    (core.getInput as jest.Mock).mockImplementation((input: string): string => {
      switch (input) {
        case 'issue_number':
          return `${issueNumber}`;

        case 'token':
          return githubToken;

        case 'comment':
          return comment;

        case 'repository':
          return fullRepo;

        default:
          throw new Error('should not go here in getInput mock');
      }
    });

    process.env.GITHUB_REPOSITORY = '';

    await expect(run()).resolves.toBeUndefined();

    expect(core.setFailed).toHaveBeenCalledWith(
      'Missing GITHUB_REPOSITORY env var'
    );
  });
});
