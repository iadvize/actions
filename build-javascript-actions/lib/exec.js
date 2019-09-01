"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
/**
 * Spawn the process with inherited stdin/out/error to redirect outputs
 * Wait until process end
 */
function exec(command, options = {}) {
    return new Promise((resolve, reject) => {
        const commandParts = command.split(' ');
        const [bin, ...args] = commandParts;
        const process = child_process_1.spawn(bin, args, Object.assign(Object.assign({}, options), { stdio: 'inherit' }));
        process.on('close', (code) => {
            if (code === 0) {
                resolve();
            }
            else {
                reject(new Error(`${command} failed with code ${code}`));
            }
        });
    });
}
exports.exec = exec;
