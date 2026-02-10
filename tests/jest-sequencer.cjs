'use strict';

/* eslint-disable @typescript-eslint/no-require-imports -- fichier .cjs pour Jest */
const Sequencer = require('@jest/test-sequencer').default;
const TEARDOWN = 'zzz-db-teardown.test';

class CustomSequencer extends Sequencer {
  sort(tests) {
    const copy = Array.from(tests);
    return copy.sort((a, b) => {
      const aTeardown = a.path.includes(TEARDOWN);
      const bTeardown = b.path.includes(TEARDOWN);
      if (aTeardown && !bTeardown) return 1;
      if (!aTeardown && bTeardown) return -1;
      return a.path.localeCompare(b.path);
    });
  }
}

module.exports = CustomSequencer;
