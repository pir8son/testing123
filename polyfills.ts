const globalScope = globalThis as typeof globalThis & {
  document?: { createElement?: () => null };
  window?: typeof globalThis;
};

// Polyfill for libraries that accidentally access 'document' or 'window'
if (typeof globalScope.document === 'undefined') {
  globalScope.document = { createElement: () => null };
}
if (typeof globalScope.window === 'undefined') {
  globalScope.window = globalScope;
}
