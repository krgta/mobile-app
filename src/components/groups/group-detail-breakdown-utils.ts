type AmountMatrix = Record<string, Record<string, string | number>>;

function toPositiveAmount(amount: string | number) {
  const n = Number(amount);
  return Number.isFinite(n) ? n : 0;
}

export function matrixToRows(matrix?: AmountMatrix | null) {
  if (!matrix) return [];
  return Object.entries(matrix)
    .map(([sourceId, targets]) => {
      const entries = Object.entries(targets)
        .map(([targetId, amount]) => ({
          sourceId,
          targetId,
          amount: toPositiveAmount(amount),
        }))
        .filter((e) => e.amount > 0.01)
        .sort((a, b) => b.amount - a.amount);
      return {
        sourceId,
        entries,
        total: entries.reduce((s, e) => s + e.amount, 0),
      };
    })
    .filter(({ entries }) => entries.length > 0)
    .sort((a, b) => b.total - a.total);
}

export function invertMatrix(matrix?: AmountMatrix | null) {
  const inverted: AmountMatrix = {};
  if (!matrix) return inverted;
  for (const [sourceId, targets] of Object.entries(matrix)) {
    for (const [targetId, amount] of Object.entries(targets)) {
      const n = toPositiveAmount(amount);
      if (n <= 0.01) continue;
      if (!inverted[targetId]) inverted[targetId] = {};
      inverted[targetId][sourceId] = n;
    }
  }
  return inverted;
}
