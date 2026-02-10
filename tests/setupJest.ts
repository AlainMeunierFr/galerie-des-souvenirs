import '@testing-library/jest-dom';

// jsdom n'a pas fetch : mock global pour les composants qui appellent /api/*
if (typeof globalThis.fetch === 'undefined') {
  globalThis.fetch = () =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
      status: 200,
    } as Response);
}
