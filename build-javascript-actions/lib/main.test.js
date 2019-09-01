"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const action_1 = require("./action");
jest.mock('./action');
describe('main', () => {
    it('should run action', () => {
        require('./main');
        expect(action_1.run).toHaveBeenCalledWith();
    });
});
