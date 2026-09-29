// Permite que JSON.stringify serialice BigInt en los tests, igual que en main.ts.
(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
  return this.toString();
};
