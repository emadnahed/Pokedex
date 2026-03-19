const createMMKV = () => ({
  set: jest.fn(),
  getString: jest.fn(() => undefined),
  getNumber: jest.fn(() => undefined),
  getBoolean: jest.fn(() => undefined),
  remove: jest.fn(() => true),
  contains: jest.fn(() => false),
  getAllKeys: jest.fn(() => []),
  clearAll: jest.fn(),
  addOnValueChangedListener: jest.fn(() => ({ remove: jest.fn() })),
});

module.exports = { createMMKV };
