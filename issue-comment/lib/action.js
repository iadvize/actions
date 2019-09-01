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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github_1 = require("@actions/github");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const issueNumber = core.getInput('issue_number', {
                required: true,
            });
            const githubToken = core.getInput('token', {
                required: true,
            });
            const comment = core.getInput('comment', {
                required: true,
            });
            const defaultRepository = process.env.GITHUB_REPOSITORY || null;
            if (!defaultRepository) {
                throw new Error('Missing GITHUB_REPOSITORY env var');
            }
            const repository = core.getInput('repository') || defaultRepository;
            const github = new github_1.GitHub(githubToken);
            const [owner, repo] = repository.split(/\/(.+)/); // split on first /
            yield github.issues.createComment({
                owner,
                repo,
                // eslint-disable-next-line @typescript-eslint/camelcase
                issue_number: parseInt(issueNumber, 10),
                body: comment,
            });
        }
        catch (error) {
            console.error(error);
            core.setFailed(error.message);
        }
    });
}
exports.run = run;
