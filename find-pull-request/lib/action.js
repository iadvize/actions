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
            const githubToken = core.getInput('token', {
                required: true,
            });
            const defaultRepository = process.env.GITHUB_REPOSITORY || null;
            if (!defaultRepository) {
                throw new Error('Missing GITHUB_REPOSITORY env var');
            }
            const repository = core.getInput('repository') || defaultRepository;
            const currentRef = process.env.GITHUB_REF || null;
            const ref = core.getInput('branch') || currentRef;
            if (!ref) {
                throw new Error('Missing GITHUB_REF and branch input. Cannot get branch info');
            }
            // ref looks like refs/heads/my-branch
            // TODO could also be a tag (https://help.github.com/en/articles/virtual-environments-for-github-actions)
            // should we handle it here ?
            const branch = ref.replace('refs/heads/', '');
            console.log(`Trying to find pull request for branch ${branch}`);
            const github = new github_1.GitHub(githubToken);
            const query = `repo:${repository} is:pr head:${branch}`;
            const { status, data } = yield github.search.issuesAndPullRequests({
                q: query,
                sort: 'updated',
                order: 'desc',
                // eslint-disable-next-line @typescript-eslint/camelcase
                per_page: 1,
            });
            if (status !== 200) {
                throw Error(`Search request error. Status ${status}`);
            }
            const { items } = data;
            const pulls = items;
            if (pulls.length === 0) {
                console.log('Found 0 pull request');
                core.setOutput('pullExists', 'false');
                core.setOutput('pullNumber', '-1');
                return;
            }
            const pullNumbers = pulls.map(pull => pull.number);
            console.log(`Found ${pullNumbers.length} pull requests: ${pullNumbers.join(', ')}`);
            const pullNumber = pullNumbers[0];
            core.setOutput('pullExists', 'true');
            core.setOutput('pullNumber', `${pullNumber}`);
        }
        catch (error) {
            console.error(error);
            core.setFailed(error.message);
        }
    });
}
exports.run = run;
