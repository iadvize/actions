"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
jest.mock('./action');
const action_1 = require("./action");
describe('main', () => {
    it('should run action', () => {
        require('./main');
        expect(action_1.run).toHaveBeenCalledWith();
    });
});
