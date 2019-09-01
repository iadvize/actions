"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
jest.mock('child_process');
const exec_1 = require("./exec");
const child_process_1 = __importDefault(require("child_process"));
describe('exec', () => {
    it('should spawn the command with arguments splited correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        child_process_1.default.spawn.mockReturnValue({
            on: jest.fn().mockImplementation((event, callback) => {
                if (event === 'close') {
                    callback(0);
                }
            }),
        });
        yield exec_1.exec('ls -a -l', { cwd: './toto' });
        expect(child_process_1.default.spawn).toHaveBeenCalledWith('ls', [
            '-a',
            '-l',
        ], {
            cwd: './toto',
            stdio: 'inherit',
        });
    }));
    it('should fail if error', () => __awaiter(void 0, void 0, void 0, function* () {
        child_process_1.default.spawn.mockReturnValue({
            on: jest.fn().mockImplementation((event, callback) => {
                if (event === 'close') {
                    callback(1);
                }
            }),
        });
        yield expect(exec_1.exec('ls -a -l', { cwd: './toto' }))
            .rejects.toMatchObject(new Error('ls -a -l failed with code 1'));
    }));
});
