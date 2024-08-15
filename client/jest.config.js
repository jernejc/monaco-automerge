export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  
  transform: {
    "^.+\\.[jt]s?$": ["ts-jest"],
  },

  transformIgnorePatterns: [
    "/node_modules/(?!(monaco-editor)).+\\.js$"
  ],

  moduleNameMapper: {
    "\\.(css|less|sass|scss)$": "<rootDir>/src/helpers/monaco/__mocks__/styleMock.ts",
    "^monaco-editor$": "<rootDir>/node_modules/monaco-editor/esm/vs/editor/editor.api",
    "^@/(.*)$": [
      "<rootDir>/src/$1"
    ]
  }
};