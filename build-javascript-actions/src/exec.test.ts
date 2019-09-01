jest.mock('child_process');

import { exec } from './exec';

import child_process from 'child_process';

describe('exec', () => {
  it('should spawn the command with arguments splited correctly', async () => {
    (child_process.spawn as jest.Mock).mockReturnValue({
      on: jest.fn().mockImplementation(
        (
          event: string,
          callback: (...args: any[]) => void,
        ) => {
          if (event === 'close') {
            callback(0);
          }
        }
      ),
    });

    await exec('ls -a -l', { cwd: './toto' });

    expect(child_process.spawn).toHaveBeenCalledWith(
      'ls',
      [
        '-a',
        '-l',
      ],
      {
        cwd: './toto',
        stdio: 'inherit',
      }
    );
  });

  it('should fail if error', async () => {
    (child_process.spawn as jest.Mock).mockReturnValue({
      on: jest.fn().mockImplementation(
        (
          event: string,
          callback: (...args: any[]) => void,
        ) => {
          if (event === 'close') {
            callback(1);
          }
        }
      ),
    });

    await expect(exec('ls -a -l', { cwd: './toto' }))
      .rejects.toMatchObject(new Error('ls -a -l failed with code 1'));
  });
});
