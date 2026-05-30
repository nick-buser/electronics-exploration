/**
 * Dense Gaussian elimination with partial pivoting.
 *
 * Solves A·x = b where A is N×N and b is length N. Mutates A and b.
 * Returns the solution vector, or null if the system is singular.
 *
 * The MNA matrices we build are at most a few dozen rows, so the dense
 * O(N^3) cost is invisible — sparse code would only obscure the math.
 */
export function solveLinear(A: number[][], b: number[]): number[] | null {
  const n = b.length;
  if (A.length !== n) throw new Error("solveLinear: dimension mismatch");
  for (let i = 0; i < n; i++) {
    if (A[i].length !== n) throw new Error("solveLinear: non-square row");
  }

  for (let k = 0; k < n; k++) {
    // Partial pivot: find row with the largest |A[i][k]| at or below k
    let piv = k;
    let max = Math.abs(A[k][k]);
    for (let i = k + 1; i < n; i++) {
      const v = Math.abs(A[i][k]);
      if (v > max) {
        max = v;
        piv = i;
      }
    }
    if (max < 1e-15) return null;
    if (piv !== k) {
      [A[k], A[piv]] = [A[piv], A[k]];
      [b[k], b[piv]] = [b[piv], b[k]];
    }
    const akk = A[k][k];
    for (let i = k + 1; i < n; i++) {
      const factor = A[i][k] / akk;
      if (factor === 0) continue;
      for (let j = k; j < n; j++) A[i][j] -= factor * A[k][j];
      b[i] -= factor * b[k];
    }
  }

  const x = new Array<number>(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = b[i];
    for (let j = i + 1; j < n; j++) s -= A[i][j] * x[j];
    x[i] = s / A[i][i];
  }
  return x;
}

export function zeros(n: number, m = n): number[][] {
  const A: number[][] = new Array(n);
  for (let i = 0; i < n; i++) A[i] = new Array<number>(m).fill(0);
  return A;
}
