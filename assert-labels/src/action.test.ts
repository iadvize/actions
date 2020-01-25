describe('action', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should fail if event is not pull_request', async () => {
    jest.mock('@actions/github', () => {
      return {
        __esModule: true,
        context: {
          eventName: 'toto',
        },
      };
    });

    jest.mock('@actions/core');

    const { run } = await import('./action');
    const { setFailed } = await import('@actions/core');

    await expect(run()).resolves.toBeUndefined();

    expect(setFailed).toHaveBeenCalledWith(
      'Action should only be used on pull_request event'
    );
  });

  it('should fail if no required label is present', async () => {
    const pullRequestPayload = {
      // eslint-disable-next-line @typescript-eslint/camelcase
      pull_request: {
        labels: [
          {
            name: 'label-c',
          },
        ],
      },
    };

    jest.mock('@actions/github', () => {
      return {
        __esModule: true,
        context: {
          eventName: 'pull_request',
          payload: pullRequestPayload,
        },
      };
    });

    jest.mock('@actions/core');

    const { getInput, setOutput, setFailed } = await import('@actions/core');

    (getInput as jest.Mock).mockImplementation((input: string): string => {
      switch (input) {
        case 'only-one-of':
          return 'label-a, label-b';

        default:
          throw new Error('should not go here in getInput mock');
      }
    });

    const { run } = await import('./action');

    await expect(run()).resolves.toBeUndefined();

    expect(setFailed).not.toHaveBeenCalled();
    expect(setOutput).toHaveBeenNthCalledWith(1, 'valid', 'false');
  });

  it('should fail if more than one required label are present', async () => {
    const pullRequestPayload = {
      // eslint-disable-next-line @typescript-eslint/camelcase
      pull_request: {
        labels: [
          {
            name: 'label-a',
          },
          {
            name: 'label-b',
          },
        ],
      },
    };

    jest.mock('@actions/github', () => {
      return {
        __esModule: true,
        context: {
          eventName: 'pull_request',
          payload: pullRequestPayload,
        },
      };
    });

    jest.mock('@actions/core');

    const { getInput, setOutput, setFailed } = await import('@actions/core');

    (getInput as jest.Mock).mockImplementation((input: string): string => {
      switch (input) {
        case 'only-one-of':
          return 'label-a, label-b';

        default:
          throw new Error('should not go here in getInput mock');
      }
    });

    const { run } = await import('./action');

    await expect(run()).resolves.toBeUndefined();

    expect(setFailed).not.toHaveBeenCalled();
    expect(setOutput).toHaveBeenNthCalledWith(1, 'valid', 'false');
  });

  it('should succeed if one required label is present', async () => {
    const pullRequestPayload = {
      // eslint-disable-next-line @typescript-eslint/camelcase
      pull_request: {
        labels: [
          {
            name: 'label-c',
          },
          {
            name: 'label-a',
          },
        ],
      },
    };

    jest.mock('@actions/github', () => {
      return {
        __esModule: true,
        context: {
          eventName: 'pull_request',
          payload: pullRequestPayload,
        },
      };
    });

    jest.mock('@actions/core');

    const { getInput, setOutput, setFailed } = await import('@actions/core');

    (getInput as jest.Mock).mockImplementation((input: string): string => {
      switch (input) {
        case 'only-one-of':
          return 'label-a, label-b';

        default:
          throw new Error('should not go here in getInput mock');
      }
    });

    const { run } = await import('./action');

    await expect(run()).resolves.toBeUndefined();

    expect(setFailed).not.toHaveBeenCalled();
    expect(setOutput).toHaveBeenNthCalledWith(1, 'valid', 'true');
    expect(setOutput).toHaveBeenNthCalledWith(2, 'label', 'label-a');
  });
});
