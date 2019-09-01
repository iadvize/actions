jest.mock('./action');

import { run } from './action';

describe('main', () => {
  it('should run action', () => {
    require('./main');

    expect(run).toHaveBeenCalledWith();
  });
})
