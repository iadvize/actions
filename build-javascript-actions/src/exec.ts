import { spawn, SpawnOptions } from 'child_process';

/**
 * Spawn the process with inherited stdin/out/error to redirect outputs
 * Wait until process end
 */
export function exec(command: string, options: SpawnOptions = {}) {
  return new Promise((resolve, reject) => {
    const commandParts = command.split(' ');

    const [bin, ...args] = commandParts;

    const process = spawn(bin, args, { ...options, stdio: 'inherit' });

    process.on('close', (code: number) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} failed with code ${code}`));
      }
    });
  });
}
