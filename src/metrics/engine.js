// Layer 2: normalized metrics -> the 12 stable surface parameters.
// One weighted sum per parameter, normalized by the absolute weights actually
// present, then a per-turn EMA. No extra cap: values may reach 0 and 1.

const clamp01 = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return n < 0 ? 0 : n > 1 ? 1 : n;
};

export function createParameterEngine({ catalog, alpha = 0.35 } = {}) {
  if (!catalog || !Array.isArray(catalog.parameters) || !Array.isArray(catalog.metrics)) {
    throw new TypeError('createParameterEngine needs a catalog with parameters and metrics');
  }

  const ids = catalog.parameters.slice();
  const metricsById = new Map(catalog.metrics.map((metric) => [metric.id, metric]));
  const values = Object.fromEntries(ids.map((id) => [id, 0.5]));

  function targetFor(id, metrics) {
    let weighted = 0;
    let magnitude = 0;
    for (const [metricId, raw] of Object.entries(metrics)) {
      const metric = metricsById.get(metricId);
      const weight = metric?.weights?.[id];
      if (!weight) continue;
      const value = Number(raw);
      if (!Number.isFinite(value)) continue;
      weighted += weight * (clamp01(value) - 0.5);
      magnitude += Math.abs(weight);
    }
    if (!magnitude) return 0.5;
    return clamp01(0.5 + weighted / magnitude);
  }

  function update(metrics = {}) {
    for (const id of ids) {
      const target = targetFor(id, metrics);
      values[id] = clamp01(values[id] + alpha * (target - values[id]));
    }
    return get();
  }

  function get() {
    return { ...values };
  }

  return { update, get };
}
