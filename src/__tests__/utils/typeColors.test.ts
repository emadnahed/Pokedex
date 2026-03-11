import {
  getTypeColor,
  getTypeData,
  POKEMON_TYPE_DATA,
  POKEMON_TYPES,
  TYPE_COLORS,
} from '@/utils/typeColors';

describe('getTypeColor', () => {
  it('returns the correct primary colour for known types', () => {
    expect(getTypeColor('fire')).toBe('#E8622A');
    expect(getTypeColor('water')).toBe('#3B8FD4');
    expect(getTypeColor('grass')).toBe('#3BAD5C');
    expect(getTypeColor('electric')).toBe('#DDB321');
    expect(getTypeColor('normal')).toBe('#888870');
  });

  it('is case-insensitive', () => {
    expect(getTypeColor('FIRE')).toBe('#E8622A');
    expect(getTypeColor('Water')).toBe('#3B8FD4');
  });

  it('falls back to the normal colour (#888870) for unknown types', () => {
    expect(getTypeColor('shadow')).toBe('#888870');
    expect(getTypeColor('')).toBe('#888870');
  });
});

describe('getTypeData', () => {
  it('returns the full data object for a known type', () => {
    const data = getTypeData('fire');
    expect(data).toEqual(POKEMON_TYPE_DATA.fire);
    expect(data.c).toBe('#E8622A');
    expect(data.bg).toBeDefined();
    expect(data.soft).toBeDefined();
    expect(data.label).toBe('Fire');
  });

  it('is case-insensitive', () => {
    expect(getTypeData('FIRE')).toEqual(POKEMON_TYPE_DATA.fire);
  });

  it('falls back to normal type data for unknown types', () => {
    expect(getTypeData('shadow')).toEqual(POKEMON_TYPE_DATA.normal);
    expect(getTypeData('')).toEqual(POKEMON_TYPE_DATA.normal);
  });
});

describe('POKEMON_TYPES', () => {
  it('contains all 18 standard types', () => {
    expect(POKEMON_TYPES).toHaveLength(18);
    expect(POKEMON_TYPES).toContain('fire');
    expect(POKEMON_TYPES).toContain('water');
    expect(POKEMON_TYPES).toContain('normal');
    expect(POKEMON_TYPES).toContain('dragon');
  });
});

describe('TYPE_COLORS', () => {
  it('maps every type to its primary colour', () => {
    expect(TYPE_COLORS.fire).toBe('#E8622A');
    expect(TYPE_COLORS.water).toBe('#3B8FD4');
  });

  it('has the same set of keys as POKEMON_TYPE_DATA', () => {
    expect(Object.keys(TYPE_COLORS).sort()).toEqual(
      Object.keys(POKEMON_TYPE_DATA).sort(),
    );
  });
});
