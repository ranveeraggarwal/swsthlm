import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// firestore/rules.test.mjs needs a running Firestore emulator (see
// firebase.json and the `test:rules` npm script) and must never be swept up
// by the plain `npm test` run — that run has to stay emulator-free. It's
// only added to `include` when VITEST_RULES is set, which `test:rules` does
// after starting the emulator via `firebase emulators:exec`.
const rulesTests = process.env.VITEST_RULES ? ['firestore/rules.test.mjs'] : [];

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: [
      'src/**/*.test.ts',
      'scripts/**/*.test.mjs',
      'eslint-rules/**/*.test.mjs',
      ...rulesTests,
    ],
  },
});
