import { buildImageUrl } from '../src/utils/image';

describe('buildImageUrl', () => {
  it('returns null for null path', () => {
    expect(buildImageUrl(null, 'w500')).toBeNull();
  });

  it('builds poster url with size', () => {
    expect(buildImageUrl('/abc.jpg', 'w342')).toBe('https://image.tmdb.org/t/p/w342/abc.jpg');
  });
});
