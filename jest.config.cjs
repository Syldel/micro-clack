module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
  // Les specs se compilent avec tsconfig.eslint.json, qui déclare les types de
  // Jest : tsconfig.json ne charge que ceux de Node depuis que TypeScript 6 ne
  // charge plus aucun @types sans liste explicite.
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.eslint.json' }],
  },
};
