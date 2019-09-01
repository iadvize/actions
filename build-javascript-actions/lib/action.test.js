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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const core = __importStar(require("@actions/core"));
const exec_1 = require("./exec");
const action_1 = require("./action");
jest.mock('./exec', () => ({
    exec: jest.fn().mockImplementation(() => {
        return Promise.resolve();
    }),
}));
jest.mock('fs-extra');
jest.mock('@actions/core');
describe('action', () => {
    beforeAll(() => {
        console.log = jest.fn();
    });
    afterAll(() => {
        console.log.mockRestore();
    });
    fs_extra_1.default.readdir.mockImplementation(() => Promise.resolve(['action1/', 'action2/', 'file.json']));
    fs_extra_1.default.statSync.mockImplementation((path) => ({
        isDirectory: () => path.indexOf('.') < 0,
    }));
    afterEach(() => {
        exec_1.exec.mockReset();
    });
    describe('without build directory and without .gitignore', () => {
        it('should clean .gitignore and install', () => __awaiter(void 0, void 0, void 0, function* () {
            fs_extra_1.default.existsSync.mockImplementation((file) => {
                if (file.indexOf('gitignore') > 0) {
                    return false;
                }
                return true;
            });
            core.getInput.mockImplementation((input) => {
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
            });
            yield expect(action_1.run()).resolves.toBeUndefined();
            expect(exec_1.exec).toHaveBeenCalledTimes(2);
            expect(exec_1.exec).toHaveBeenNthCalledWith(1, 'yarn install', expect.anything());
            expect(exec_1.exec).toHaveBeenNthCalledWith(2, 'yarn install', expect.anything());
        }));
    });
    describe('without build directory', () => {
        it('should clean .gitignore and install', () => __awaiter(void 0, void 0, void 0, function* () {
            fs_extra_1.default.existsSync.mockReturnValue(true);
            core.getInput.mockImplementation((input) => {
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
            });
            yield expect(action_1.run()).resolves.toBeUndefined();
            expect(exec_1.exec).toHaveBeenCalledTimes(4);
            expect(exec_1.exec).toHaveBeenNthCalledWith(1, 'sed -i /node_modules/d actions/action1/.gitignore');
            expect(exec_1.exec).toHaveBeenNthCalledWith(2, 'yarn install', expect.anything());
            expect(exec_1.exec).toHaveBeenNthCalledWith(3, 'sed -i /node_modules/d actions/action2/.gitignore');
            expect(exec_1.exec).toHaveBeenNthCalledWith(4, 'yarn install', expect.anything());
        }));
    });
    describe('with build directory', () => {
        it('should clean .gitignore, install and build actions', () => __awaiter(void 0, void 0, void 0, function* () {
            fs_extra_1.default.existsSync.mockReturnValue(true);
            core.getInput.mockImplementation((input) => {
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
            });
            yield expect(action_1.run()).resolves.toBeUndefined();
            expect(exec_1.exec).toHaveBeenCalledTimes(8);
            expect(exec_1.exec).toHaveBeenNthCalledWith(1, 'sed -i /node_modules/d actions/action1/.gitignore');
            expect(exec_1.exec).toHaveBeenNthCalledWith(2, 'sed -i /build/d actions/action1/.gitignore');
            expect(exec_1.exec).toHaveBeenNthCalledWith(3, 'yarn install', expect.anything());
            expect(exec_1.exec).toHaveBeenNthCalledWith(4, 'yarn run build', expect.anything());
            expect(exec_1.exec).toHaveBeenNthCalledWith(5, 'sed -i /node_modules/d actions/action2/.gitignore');
            expect(exec_1.exec).toHaveBeenNthCalledWith(6, 'sed -i /build/d actions/action2/.gitignore');
            expect(exec_1.exec).toHaveBeenNthCalledWith(7, 'yarn install', expect.anything());
            expect(exec_1.exec).toHaveBeenNthCalledWith(8, 'yarn run build', expect.anything());
        }));
    });
});
