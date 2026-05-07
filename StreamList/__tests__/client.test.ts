import { isRequestAborted } from '../src/api/client';

describe('isRequestAborted', () => {
  it('returns true for AbortError', () => {
    expect(isRequestAborted(Object.assign(new Error('aborted'), { name: 'AbortError' }))).toBe(true);
  });

  it('returns true for ERR_CANCELED', () => {
    expect(isRequestAborted({ code: 'ERR_CANCELED' })).toBe(true);
  });

  it('returns false for normal errors', () => {
    expect(isRequestAborted(new Error('network'))).toBe(false);
  });
});
