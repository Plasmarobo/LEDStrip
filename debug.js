function assert(condition, message) {
  if (!condition) {
    debugger;
    throw message || "Assertion failed";
  }
}