jest.mock('./exec', () => ({
  exec: jest.fn().mockImplementation(() => {
    return Promise.resolve();
  }),
}));

jest.mock('fs-extra');

jest.mock('@actions/core');

import fs from 'fs-extra';
import * as core from '@actions/core';
import { exec } from './exec';

import { run } from './action';

describe('action', () => {
  beforeAll(() => {
    console.log = jest.fn();
  });

  afterAll(() => {
    (console.log as jest.Mock).mockRestore();
  });

  (fs.readdir as unknown as jest.Mock).mockImplementation(
    (_: string | Buffer) => Promise.resolve(['action1/', 'action2/', 'file.json'])
  );
  (fs.statSync as unknown as jest.Mock).mockImplementation(
    (path: string) => ({
      isDirectory: () => path.indexOf('.') < 0,
    })
  );

  afterEach(() => {
    (exec as jest.Mock).mockReset();
  });

  describe('without build directory and without .gitignore', () => {
    it('should clean .gitignore and install', async () => {
      (fs.existsSync as unknown as jest.Mock).mockImplementation((file: string) => {
        if (file.indexOf('gitignore') > 0) {
          return false;
        }

        return true;
      });

      (core.getInput as unknown as jest.Mock).mockImplementation(
        (input: string) => {
          switch (input) {
            case 'actions_directory':
              return 'actions/';

            case 'build_directory':
              return '';

            case 'install_command':
              return 'yarn install';

            case 'build_command':
              return 'yarn run build';

            default:
              throw new Error('Should not goes here in getInput mock');
          }
        }
      );

      await expect(run()).resolves.toBeUndefined();

      expect(exec).toHaveBeenCalledTimes(2);

      expect(exec).toHaveBeenNthCalledWith(
        1,
        'yarn install',
        expect.anything(),
      );

      expect(exec).toHaveBeenNthCalledWith(
        2,
        'yarn install',
        expect.anything(),
      );
    });
  });

  describe('without build directory', () => {
    it('should clean .gitignore and install', async () => {
      (fs.existsSync as unknown as jest.Mock).mockReturnValue(true);

      (core.getInput as unknown as jest.Mock).mockImplementation(
        (input: string) => {
          switch (input) {
            case 'actions_directory':
              return 'actions/';

            case 'build_directory':
              return '';

            case 'install_command':
              return 'yarn install';

            case 'build_command':
              return 'yarn run build';

            default:
              throw new Error('Should not goes here in getInput mock');
          }
        }
      );

      await expect(run()).resolves.toBeUndefined();

      expect(exec).toHaveBeenCalledTimes(4);

      expect(exec).toHaveBeenNthCalledWith(
        1,
        'sed -i /node_modules/d actions/action1/.gitignore',
      );

      expect(exec).toHaveBeenNthCalledWith(
        2,
        'yarn install',
        expect.anything(),
      );

      expect(exec).toHaveBeenNthCalledWith(
        3,
        'sed -i /node_modules/d actions/action2/.gitignore',
      );

      expect(exec).toHaveBeenNthCalledWith(
        4,
        'yarn install',
        expect.anything(),
      );
    });
  });

  describe('with build directory', () => {
    it('should clean .gitignore, install and build actions', async () => {
      (fs.existsSync as unknown as jest.Mock).mockReturnValue(true);

      (core.getInput as unknown as jest.Mock).mockImplementation(
        (input: string) => {
          switch (input) {
            case 'actions_directory':
              return 'actions/';

            case 'build_directory':
              return 'build';

            case 'install_command':
              return 'yarn install';

            case 'build_command':
              return 'yarn run build';

            default:
              throw new Error('Should not goes here in getInput mock');
          }
        }
      );

      await expect(run()).resolves.toBeUndefined();

      expect(exec).toHaveBeenCalledTimes(8);

      expect(exec).toHaveBeenNthCalledWith(
        1,
        'sed -i /node_modules/d actions/action1/.gitignore',
      );

      expect(exec).toHaveBeenNthCalledWith(
        2,
        'sed -i /build/d actions/action1/.gitignore',
      );

      expect(exec).toHaveBeenNthCalledWith(
        3,
        'yarn install',
        expect.anything(),
      );

      expect(exec).toHaveBeenNthCalledWith(
        4,
        'yarn run build',
        expect.anything(),
      );

      expect(exec).toHaveBeenNthCalledWith(
        5,
        'sed -i /node_modules/d actions/action2/.gitignore',
      );

      expect(exec).toHaveBeenNthCalledWith(
        6,
        'sed -i /build/d actions/action2/.gitignore',
      );

      expect(exec).toHaveBeenNthCalledWith(
        7,
        'yarn install',
        expect.anything(),
      );

      expect(exec).toHaveBeenNthCalledWith(
        8,
        'yarn run build',
        expect.anything(),
      );
    });
  });
});
