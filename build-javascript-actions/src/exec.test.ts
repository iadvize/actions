import { exec } from './exec';

import childProcess from 'child_process';

jest.mock('child_process');

describe('exec', () => {
  it('should spawn the command with arguments splited correctly', async () => {
    (childProcess.spawn as jest.Mock).mockReturnValue({
      on: jest.fn().mockImplementation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (event: string, callback: (...args: any[]) => void) => {
          if (event === 'close') {
            // eslint-disable-next-line standard/no-callback-literal
            callback(0);
          }
        }
      ),
    });

    await exec('ls -a -l', { cwd: './toto' });

    expect(childProcess.spawn).toHaveBeenCalledWith('ls', ['-a', '-l'], {
      cwd: './toto',
      stdio: 'inherit',
    });
  });

  it('should fail if error', async () => {
    (childProcess.spawn as jest.Mock).mockReturnValue({
      on: jest.fn().mockImplementation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (event: string, callback: (...args: any[]) => void) => {
          if (event === 'close') {
            // eslint-disable-next-line standard/no-callback-literal
            callback(1);
          }
        }
      ),
    });

    await expect(exec('ls -a -l', { cwd: './toto' })).rejects.toMatchObject(
      new Error('ls -a -l failed with code 1')
    );
  });
});
