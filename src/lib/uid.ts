export function uid(prefix = "i"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
