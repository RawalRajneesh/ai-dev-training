import { HOME_GENRE_CHIPS } from '../src/constants/homeGenres';

describe('HOME_GENRE_CHIPS', () => {
  it('uses TMDB v3 ids for named genres', () => {
    expect(HOME_GENRE_CHIPS.find(c => c.label === 'Action')?.id).toBe(28);
    expect(HOME_GENRE_CHIPS.find(c => c.label === 'Drama')?.id).toBe(18);
    expect(HOME_GENRE_CHIPS.find(c => c.label === 'Comedy')?.id).toBe(35);
    expect(HOME_GENRE_CHIPS.find(c => c.label === 'Sci-Fi')?.id).toBe(878);
    expect(HOME_GENRE_CHIPS.find(c => c.label === 'Horror')?.id).toBe(27);
    expect(HOME_GENRE_CHIPS.find(c => c.label === 'Documentary')?.id).toBe(99);
  });

  it('starts with All (null id)', () => {
    expect(HOME_GENRE_CHIPS[0]).toEqual({ id: null, label: 'All' });
  });
});
