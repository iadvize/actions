const fakeChangelog = `
# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Something

## [1.0.0] - 2017-06-20
### Added
- New visual identity by [@tylerfortune8](https://github.com/tylerfortune8).

### Changed
- Start using "changelog" over "change log" since it's the common usage.

### Removed
- Section about "changelog" vs "CHANGELOG".

## [0.3.0] - 2015-12-03
### Added
- RU translation from [@aishek](https://github.com/aishek).

## [0.2.0] - 2015-10-06
### Changed
- Remove exclusionary mentions of "open source" since this project can
benefit both "open" and "closed" source projects equally.


[Unreleased]: https://github.com/olivierlacan/keep-a-changelog/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/olivierlacan/keep-a-changelog/compare/v0.3.0...v1.0.0
[0.3.0]: https://github.com/olivierlacan/keep-a-changelog/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/olivierlacan/keep-a-changelog/compare/v0.1.0...v0.2.0
`;

describe('action', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should write new CHANGELOG', async () => {
    jest.mock('fs', () => {
      return {
        __esModule: true,
        readFileSync: jest.fn().mockReturnValue(fakeChangelog),
        writeFileSync: jest.fn(),
      };
    });

    jest.mock('@actions/core');

    const { getInput, setFailed } = await import('@actions/core');

    (getInput as jest.Mock).mockImplementation((input: string): string => {
      switch (input) {
        case 'path':
          return 'dir/CHANGELOG.md';

        case 'version':
          return '1.0.1';

        default:
          throw new Error('should not go here in getInput mock');
      }
    });

    const { readFileSync, writeFileSync } = await import('fs');

    const { run } = await import('./action');

    await expect(run()).resolves.toBeUndefined();

    expect(setFailed).not.toHaveBeenCalled();

    expect(readFileSync).toHaveBeenCalledWith('dir/CHANGELOG.md', {
      encoding: 'utf8',
    });

    expect((writeFileSync as jest.Mock).mock.calls).toMatchSnapshot();
  });

  it('should fail if readFileSync fail', async () => {
    jest.mock('fs', () => {
      return {
        __esModule: true,
        readFileSync: () => {
          throw new Error('file error');
        },
        writeFileSync: jest.fn(),
      };
    });

    jest.mock('@actions/core');

    const { getInput, setFailed } = await import('@actions/core');

    (getInput as jest.Mock).mockImplementation((input: string): string => {
      switch (input) {
        case 'path':
          return 'dir/CHANGELOG.md';

        case 'version':
          return '1.0.1';

        default:
          throw new Error('should not go here in getInput mock');
      }
    });

    const { run } = await import('./action');

    await expect(run()).resolves.toBeUndefined();

    expect(setFailed).toHaveBeenCalledWith('file error');
  });

  it('should fail if remark fail', async () => {
    jest.mock('fs', () => {
      return {
        __esModule: true,
        readFileSync: jest.fn().mockReturnValue(fakeChangelog),
        writeFileSync: () => {
          throw new Error('write error');
        },
      };
    });

    jest.mock('@actions/core');

    const { getInput, setFailed } = await import('@actions/core');

    (getInput as jest.Mock).mockImplementation((input: string): string => {
      switch (input) {
        case 'path':
          return 'dir/CHANGELOG.md';

        case 'version':
          return '1.0.1';

        default:
          throw new Error('should not go here in getInput mock');
      }
    });

    const { run } = await import('./action');

    await expect(run()).resolves.toBeUndefined();

    expect(setFailed).toHaveBeenCalledWith('write error');
  });

  it('should fail if remark fail', async () => {
    jest.mock('remark', () => {
      return {
        __esModule: true,
        default: () => ({
          use: () => ({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            process: (_, callback: any) => {
              callback(new Error('ooops'));
            },
          }),
        }),
      };
    });

    jest.mock('fs', () => {
      return {
        __esModule: true,
        readFileSync: jest.fn().mockReturnValue(fakeChangelog),
        writeFileSync: jest.fn(),
      };
    });

    jest.mock('@actions/core');

    const { getInput, setFailed } = await import('@actions/core');

    (getInput as jest.Mock).mockImplementation((input: string): string => {
      switch (input) {
        case 'path':
          return 'dir/CHANGELOG.md';

        case 'version':
          return '1.0.1';

        default:
          throw new Error('should not go here in getInput mock');
      }
    });

    const { run } = await import('./action');

    await expect(run()).resolves.toBeUndefined();

    expect(setFailed).toHaveBeenCalledWith('ooops');
  });
});
