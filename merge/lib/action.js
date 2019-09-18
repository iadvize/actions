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
const label_1 = require("./label");
const comment_1 = require("./comment");
const delay_1 = require("./delay");
const RETRY_DELAY = 5000;
const hasLabel = (label, pull) => {
    const { labels } = pull;
    return labels.find(currentLanel => currentLanel.name === label);
};
function merge(github, pullNumber, label) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield github.pulls.get({
            owner: github_1.context.repo.owner,
            repo: github_1.context.repo.repo,
            // eslint-disable-next-line @typescript-eslint/camelcase
            pull_number: pullNumber,
        });
        if (response.status !== 200) {
            throw new Error(`Cannot get pull request #${pullNumber}. Status ${response.status}.`);
        }
        const pull = response.data;
        if (label && !hasLabel(label, pull)) {
            console.log(`Pull request has no ${label} label. Stopping.`);
            return 'skip';
        }
        if (pull.state !== 'open') {
            console.log(`Pull request is not open. Stopping.`);
            return 'skip';
        }
        console.log(`Mergeable is ${pull.mergeable}`);
        console.log(`Mergeable state is ${pull.mergeable_state}`);
        if (pull.mergeable === null) {
            console.log('Need retry');
            return 'need retry';
        }
        if (pull.mergeable !== true) {
            return 'impossible';
        }
        if (pull.mergeable_state === 'blocked' || pull.mergeable_state === 'draft') {
            console.log(`Mergeable state is ${pull.mergeable_state}. Stopping`);
            return 'skip';
        }
        const mergeResponse = yield github.pulls.merge({
            owner: github_1.context.repo.owner,
            repo: github_1.context.repo.repo,
            // eslint-disable-next-line @typescript-eslint/camelcase
            pull_number: pullNumber,
        });
        if (mergeResponse.status === 200) {
            return 'done';
        }
        else {
            throw new Error(`Failed to merge #${pullNumber}. Status ${mergeResponse.status}`);
        }
    });
}
function deleteBranch(github, ref) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Deleting ref', ref);
        return github.git.deleteRef({
            owner: github_1.context.repo.owner,
            repo: github_1.context.repo.repo,
            ref,
        });
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (github_1.context.eventName !== 'check_suite') {
                throw new Error('Should only run on check_suite');
            }
            const event = github_1.context.payload;
            if (event.action !== 'completed') {
                console.log('Check Suite is not completed. Nothing to do. Stopping.');
                return;
            }
            if (event.check_suite.conclusion !== 'success') {
                console.log('Check Suite is not completed. Nothing to do. Stopping.');
                return;
            }
            const pulls = event.check_suite.pull_requests;
            if (pulls.length === 0) {
                console.log('No PR for this check_suite. Stopping.');
                return;
            }
            console.log(`${pulls.length} pull request for this check_suite`);
            const pullInfos = pulls[0];
            const githubToken = core.getInput('token', {
                required: true,
            });
            const label = core.getInput('label') || null;
            const shouldDeleteBranch = core.getInput('shouldDeleteBranch') === 'true';
            const github = new github_1.GitHub(githubToken);
            let numberRetries = 1;
            let result = 'need retry';
            do {
                console.log(`Will try to merge pull request #${pullInfos.number}`);
                result = yield merge(github, pullInfos.number, label);
                console.log(`Merge result is ${result}`);
                numberRetries++;
                yield delay_1.delay(RETRY_DELAY);
            } while (numberRetries < 21 && result === 'need retry');
            if (result !== 'done' && result !== 'skip') {
                console.log(`Failed to merge pull request #${pullInfos.number}`);
                if (label) {
                    yield label_1.removePRLabel(github, pullInfos.number, label);
                    yield comment_1.sendPRComment(github, pullInfos.number, `Removing label ${label} because pull request is not mergeable `);
                }
                return;
            }
            else if (result === 'done' && shouldDeleteBranch) {
                yield deleteBranch(github, `heads/${pullInfos.head.ref}`);
            }
            if (result === 'done') {
                console.log(`Pull request #${pullInfos.number} merged`);
            }
        }
        catch (error) {
            console.error(error);
            core.setFailed(error.message);
        }
    });
}
exports.run = run;
