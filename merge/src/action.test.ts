import * as core from '@actions/core';
import * as github from '@actions/github';

import { run } from './action';

jest.mock('@actions/core');
jest.mock('@actions/github');

const githubInstance = {
  pulls: {
    get: jest.fn(),
    merge: jest.fn(),
  },
};

((github.GitHub as unknown) as jest.Mock).mockImplementation(function() {
  return githubInstance;
});

// const pullNumber = 134;
const githubToken = '13443245412324';
// const owner = 'my-owner';
// const repo = 'my-repo';

const repository = {
  owner: {
    login: 'org',
  },
  name: 'repoo-name',
};

describe('action', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log');
  });

  afterAll(() => {
    (console.log as jest.Mock).mockRestore();
  });

  afterEach(() => {
    githubInstance.pulls.get.mockRestore();
    githubInstance.pulls.merge.mockRestore();

    ((core.setFailed as unknown) as jest.Mock).mockReset();

    (console.log as jest.Mock).mockReset();
  });

  it('should fail if not called on a check_suite event', async () => {
    github.context.eventName = 'toto';

    await expect(run()).resolves.toBeUndefined();

    expect(core.setFailed).toHaveBeenCalledWith(
      'Should only run on check_suite'
    );
  });

  it('should stop early if check_suite is not completed', async () => {
    const event = {
      action: 'toto',
    };

    github.context.eventName = 'check_suite';
    github.context.payload = event;

    await expect(run()).resolves.toBeUndefined();
    expect(core.setFailed).not.toHaveBeenCalled();
    expect(github.GitHub).not.toHaveBeenCalled();
  });

  it('should stop early if check_suite conclusion is not success', async () => {
    const event = {
      action: 'completed',
      // eslint-disable-next-line @typescript-eslint/camelcase
      check_suite: {
        conclusion: 'toto',
      },
    };

    github.context.eventName = 'check_suite';
    github.context.payload = event;

    await expect(run()).resolves.toBeUndefined();
    expect(core.setFailed).not.toHaveBeenCalled();
    expect(github.GitHub).not.toHaveBeenCalled();
  });

  it('should stop early if no prs for this check_suite', async () => {
    const event = {
      action: 'completed',
      // eslint-disable-next-line @typescript-eslint/camelcase
      check_suite: {
        conclusion: 'success',

        // eslint-disable-next-line @typescript-eslint/camelcase
        pull_requests: [],
      },
    };

    github.context.eventName = 'check_suite';
    github.context.payload = event;

    await expect(run()).resolves.toBeUndefined();
    expect(core.setFailed).not.toHaveBeenCalled();
    expect(github.GitHub).not.toHaveBeenCalled();
  });

  it('should fail if cannot get PR', async () => {
    (core.getInput as jest.Mock).mockImplementation((input: string): string => {
      switch (input) {
        case 'token':
          return githubToken;

        case 'label':
          return '';

        default:
          throw new Error('should not go here in getInput mock');
      }
    });

    const pullInfos = {
      number: 12,
      head: {
        ref: 'branch',
      },
    };

    const event = {
      repository,
      action: 'completed',
      // eslint-disable-next-line @typescript-eslint/camelcase
      check_suite: {
        conclusion: 'success',

        // eslint-disable-next-line @typescript-eslint/camelcase
        pull_requests: [pullInfos],
      },
    };

    github.context.eventName = 'check_suite';
    github.context.payload = event;

    const response = {
      status: '400',
    };

    githubInstance.pulls.get.mockResolvedValue(response);

    await expect(run()).resolves.toBeUndefined();

    expect(core.setFailed).toHaveBeenCalledWith(
      `Cannot get pull request #${pullInfos.number}. Status ${response.status}.`
    );

    expect(githubInstance.pulls.get).toHaveBeenCalled();
    expect(githubInstance.pulls.merge).not.toHaveBeenCalled();
  });

  it('should stop if pr is not mergeable', async () => {
    (core.getInput as jest.Mock).mockImplementation((input: string): string => {
      switch (input) {
        case 'token':
          return githubToken;

        case 'label':
          return '';

        default:
          throw new Error('should not go here in getInput mock');
      }
    });

    const pullInfos = {
      number: 12,
      head: {
        ref: 'branch',
      },
    };

    const event = {
      repository,
      action: 'completed',
      // eslint-disable-next-line @typescript-eslint/camelcase
      check_suite: {
        conclusion: 'success',

        // eslint-disable-next-line @typescript-eslint/camelcase
        pull_requests: [pullInfos],
      },
    };

    github.context.eventName = 'check_suite';
    github.context.payload = event;

    const pull = {
      // eslint-disable-next-line @typescript-eslint/camelcase
      mergeable_state: 'dirty',
    };

    const response = {
      status: 200,
      data: pull,
    };

    githubInstance.pulls.get.mockResolvedValue(response);

    await expect(run()).resolves.toBeUndefined();
    expect(core.setFailed).not.toHaveBeenCalled();

    expect(githubInstance.pulls.get).toHaveBeenCalled();
    expect(githubInstance.pulls.merge).not.toHaveBeenCalled();
  });

  it('should stop if pr has not the required label', async () => {
    const label = 'my-label';

    (core.getInput as jest.Mock).mockImplementation((input: string): string => {
      switch (input) {
        case 'token':
          return githubToken;

        case 'label':
          return label;

        default:
          throw new Error('should not go here in getInput mock');
      }
    });

    const pullInfos = {
      number: 12,
      head: {
        ref: 'branch',
      },
    };

    const event = {
      repository,
      action: 'completed',
      // eslint-disable-next-line @typescript-eslint/camelcase
      check_suite: {
        conclusion: 'success',

        // eslint-disable-next-line @typescript-eslint/camelcase
        pull_requests: [pullInfos],
      },
    };

    github.context.eventName = 'check_suite';
    github.context.payload = event;

    const pull = {
      // eslint-disable-next-line @typescript-eslint/camelcase
      mergeable_state: 'clean',
      labels: [
        {
          name: 'not-my-label',
        },
      ],
    };

    const response = {
      status: 200,
      data: pull,
    };

    githubInstance.pulls.get.mockResolvedValue(response);

    await expect(run()).resolves.toBeUndefined();
    expect(core.setFailed).not.toHaveBeenCalled();

    expect(githubInstance.pulls.get).toHaveBeenCalled();

    expect(console.log).toHaveBeenCalledWith(
      `Pull request has no ${label} label. Stopping.`
    );

    expect(githubInstance.pulls.merge).not.toHaveBeenCalled();
  });

  it('should continue if pr has the required label', async () => {
    const label = 'my-label';

    (core.getInput as jest.Mock).mockImplementation((input: string): string => {
      switch (input) {
        case 'token':
          return githubToken;

        case 'label':
          return label;

        default:
          throw new Error('should not go here in getInput mock');
      }
    });

    const pullInfos = {
      number: 12,
      head: {
        ref: 'branch',
      },
    };

    const event = {
      repository,
      action: 'completed',
      // eslint-disable-next-line @typescript-eslint/camelcase
      check_suite: {
        conclusion: 'success',

        // eslint-disable-next-line @typescript-eslint/camelcase
        pull_requests: [pullInfos],
      },
    };

    github.context.eventName = 'check_suite';
    github.context.payload = event;

    const pull = {
      // eslint-disable-next-line @typescript-eslint/camelcase
      mergeable_state: 'clean',
      labels: [
        {
          name: label,
        },
      ],
    };

    const response = {
      status: 200,
      data: pull,
    };

    githubInstance.pulls.get.mockResolvedValue(response);

    const mergeResponse = {
      status: 405,
    };

    githubInstance.pulls.merge.mockResolvedValue(mergeResponse);

    await expect(run()).resolves.toBeUndefined();
    expect(core.setFailed).not.toHaveBeenCalled();

    expect(githubInstance.pulls.get).toHaveBeenCalled();
    expect(githubInstance.pulls.merge).toHaveBeenCalled();
  });

  it('should handle impossible merge', async () => {
    (core.getInput as jest.Mock).mockImplementation((input: string): string => {
      switch (input) {
        case 'token':
          return githubToken;

        case 'label':
          return '';

        default:
          throw new Error('should not go here in getInput mock');
      }
    });

    const pullInfos = {
      number: 12,
      head: {
        ref: 'branch',
      },
    };

    const event = {
      repository,
      action: 'completed',
      // eslint-disable-next-line @typescript-eslint/camelcase
      check_suite: {
        conclusion: 'success',

        // eslint-disable-next-line @typescript-eslint/camelcase
        pull_requests: [pullInfos],
      },
    };

    github.context.eventName = 'check_suite';
    github.context.payload = event;

    const pull = {
      // eslint-disable-next-line @typescript-eslint/camelcase
      mergeable_state: 'clean',
    };

    const response = {
      status: 200,
      data: pull,
    };

    githubInstance.pulls.get.mockResolvedValue(response);

    const mergeResponse = {
      status: 405,
    };

    githubInstance.pulls.merge.mockResolvedValue(mergeResponse);

    await expect(run()).resolves.toBeUndefined();
    expect(core.setFailed).not.toHaveBeenCalled();

    expect(githubInstance.pulls.get).toHaveBeenCalled();
    expect(githubInstance.pulls.merge).toHaveBeenCalled();

    expect(console.log).toHaveBeenCalledWith(
      `Failed to merge #${pullInfos.number} (${pullInfos.head.ref}). Status ${mergeResponse.status}`
    );
  });

  it('should log successful merge', async () => {
    (core.getInput as jest.Mock).mockImplementation((input: string): string => {
      switch (input) {
        case 'token':
          return githubToken;

        case 'label':
          return '';

        default:
          throw new Error('should not go here in getInput mock');
      }
    });

    const pullInfos = {
      number: 12,
      head: {
        ref: 'branch',
      },
    };

    const event = {
      repository,
      action: 'completed',
      // eslint-disable-next-line @typescript-eslint/camelcase
      check_suite: {
        conclusion: 'success',

        // eslint-disable-next-line @typescript-eslint/camelcase
        pull_requests: [pullInfos],
      },
    };

    github.context.eventName = 'check_suite';
    github.context.payload = event;

    const pull = {
      // eslint-disable-next-line @typescript-eslint/camelcase
      mergeable_state: 'clean',
    };

    const response = {
      status: 200,
      data: pull,
    };

    githubInstance.pulls.get.mockResolvedValue(response);

    const mergeResponse = {
      status: 200,
    };

    githubInstance.pulls.merge.mockResolvedValue(mergeResponse);

    await expect(run()).resolves.toBeUndefined();
    expect(core.setFailed).not.toHaveBeenCalled();

    expect(githubInstance.pulls.get).toHaveBeenCalled();
    expect(githubInstance.pulls.merge).toHaveBeenCalled();

    expect(console.log).toHaveBeenCalledWith(
      `Pull requeqst #${pullInfos.number} (${pullInfos.head.ref}) merged`
    );
  });
});
