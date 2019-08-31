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
const child_process_1 = __importDefault(require("child_process"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const util_1 = require("util");
const core = __importStar(require("@actions/core"));
const exec = util_1.promisify(child_process_1.default.exec);
function findJavascriptActions(rootDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const contents = yield fs_extra_1.default.readdir(rootDir);
        const buildPath = (fileOrDirectoryName) => path_1.default.join(rootDir, fileOrDirectoryName);
        const isDirectory = (path) => fs_extra_1.default.statSync(path).isDirectory();
        const isAction = (directoryPath) => fs_extra_1.default.existsSync(path_1.default.join(directoryPath, 'action.yml'));
        const hasJavascript = (directoryPath) => fs_extra_1.default.existsSync(path_1.default.join(directoryPath, 'package.json'));
        const javascriptActionDirectoryPaths = contents
            .map(buildPath)
            .filter(isDirectory)
            .filter(isAction)
            .filter(hasJavascript);
        return javascriptActionDirectoryPaths;
    });
}
function cleanActionGitignore(actionDirectory, buildDirectory) {
    return __awaiter(this, void 0, void 0, function* () {
        const gitignorePath = path_1.default.join(actionDirectory, '.gitignore');
        const gitignoreExists = fs_extra_1.default.existsSync(gitignorePath);
        if (!gitignoreExists) { // nothing to do
            return;
        }
        yield exec(`sed -i '/node_modules/d' ${gitignorePath}`);
        if (buildDirectory) {
            yield exec(`sed -i '/${buildDirectory}/d' ${gitignorePath}`);
        }
    });
}
function buildAction(actionDirectory, installCommand, buildCommand) {
    return __awaiter(this, void 0, void 0, function* () {
        const context = {
            cwd: actionDirectory,
        };
        yield exec(installCommand, context);
        yield exec(buildCommand, context);
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const actionsDirectory = core.getInput('actions_directory', { required: true });
            // directory where javascript build output is stored. null means no build
            const buildDirectory = core.getInput('build_directory') || null;
            const installCommand = core.getInput('install_command', { required: true });
            const buildCommand = core.getInput('build_command', { required: true });
            const actionDirectories = yield findJavascriptActions(actionsDirectory);
            for (const actionDirectory of actionDirectories) {
                console.log(`Found ${actionDirectory} javascript action`);
                console.log(`Cleaning ${actionDirectory} .gitignore`);
                yield cleanActionGitignore(actionDirectory, buildDirectory);
                console.log(`Building ${actionDirectory}`);
                yield buildAction(actionDirectory, installCommand, buildCommand);
                console.log(`${actionDirectory} done`);
            }
        }
        catch (error) {
            console.error(error);
            core.setFailed(error.message);
        }
    });
}
run();