import {
  formatPokemonId,
  formatPokemonName,
  formatHeight,
  formatWeight,
  extractIdFromUrl,
  getSpriteUrl,
  getStatLabel,
  getStatMax,
} from '@/utils/pokemonHelpers';

describe('formatPokemonId', () => {
  it('pads single-digit ids to 3 digits with # prefix', () => {
    expect(formatPokemonId(1)).toBe('#001');
  });

  it('pads two-digit ids to 3 digits', () => {
    expect(formatPokemonId(25)).toBe('#025');
  });

  it('does not pad 3-digit ids', () => {
    expect(formatPokemonId(150)).toBe('#150');
  });

  it('does not pad 4-digit ids — no truncation', () => {
    expect(formatPokemonId(1000)).toBe('#1000');
  });
});

describe('formatPokemonName', () => {
  it('capitalises a single-word name', () => {
    expect(formatPokemonName('bulbasaur')).toBe('Bulbasaur');
  });

  it('capitalises and joins hyphenated names with spaces', () => {
    expect(formatPokemonName('mr-mime')).toBe('Mr Mime');
  });

  it('handles multiple hyphens', () => {
    expect(formatPokemonName('tapu-koko')).toBe('Tapu Koko');
  });

  it('leaves an already-capitalised name unchanged', () => {
    expect(formatPokemonName('Pikachu')).toBe('Pikachu');
  });
});

describe('formatHeight', () => {
  it('converts decimetres to metres and feet/inches', () => {
    // 7 dm → 0.7 m
    expect(formatHeight(7)).toBe('0.7 m (2\'4")');
  });

  it('handles whole-number metre heights', () => {
    // 20 dm → 2.0 m
    const result = formatHeight(20);
    expect(result).toMatch(/^2\.0 m/);
  });
});

describe('formatWeight', () => {
  it('converts hectograms to kg and lbs', () => {
    // 69 hg → 6.9 kg → 15.2 lbs
    expect(formatWeight(69)).toBe('6.9 kg (15.2 lbs)');
  });

  it('handles a heavier pokemon', () => {
    // 10000 hg → 1000.0 kg
    const result = formatWeight(10000);
    expect(result).toMatch(/^1000\.0 kg/);
  });
});

describe('extractIdFromUrl', () => {
  it('extracts the numeric id from a PokeAPI URL', () => {
    expect(extractIdFromUrl('https://pokeapi.co/api/v2/pokemon/25/')).toBe(25);
  });

  it('works without a trailing slash', () => {
    expect(extractIdFromUrl('https://pokeapi.co/api/v2/pokemon/1')).toBe(1);
  });

  it('works for evolution-chain URLs', () => {
    expect(extractIdFromUrl('https://pokeapi.co/api/v2/evolution-chain/3/')).toBe(3);
  });
});

describe('getSpriteUrl', () => {
  it('returns the official-artwork sprite URL for a given id', () => {
    const url = getSpriteUrl(1);
    expect(url).toBe(
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
    );
  });
});

describe('getStatLabel', () => {
  it('returns the short label for known stats', () => {
    expect(getStatLabel('hp')).toBe('HP');
    expect(getStatLabel('attack')).toBe('ATK');
    expect(getStatLabel('defense')).toBe('DEF');
    expect(getStatLabel('special-attack')).toBe('SP.ATK');
    expect(getStatLabel('special-defense')).toBe('SP.DEF');
    expect(getStatLabel('speed')).toBe('SPD');
  });

  it('falls back to an uppercased version of the raw stat name', () => {
    expect(getStatLabel('accuracy')).toBe('ACCURACY');
  });
});

describe('getStatMax', () => {
  it('returns known maximums for each base stat', () => {
    expect(getStatMax('hp')).toBe(255);
    expect(getStatMax('attack')).toBe(190);
    expect(getStatMax('defense')).toBe(230);
    expect(getStatMax('special-attack')).toBe(194);
    expect(getStatMax('special-defense')).toBe(230);
    expect(getStatMax('speed')).toBe(200);
  });

  it('falls back to 255 for unknown stats', () => {
    expect(getStatMax('accuracy')).toBe(255);
  });
});
