/* 주택연금 월지급금 엔진 — 한국주택금융공사 월지급금 예시표(종신지급방식 정액형, HF_TABLE)를 나이·집값으로 보간한다. 금액 원.
 *   HF_TABLE.tables[유형][나이 행][집값 열]: 나이 55·60·65·70·75·80세(부부 중 연소자), 집값 1억~12억원(시세·감정가)
 *   나이·집값 사이는 직선 보간(공사 예상연금조회의 실제 산식과 조금 다를 수 있음). 1억원 미만은 1억원 값에 비례.
 *   55세 미만은 가입 불가, 80세 초과·12억원 초과는 표 끝 값(실제는 더 받거나 상한이 걸림 — 화면에서 안내).
 */
function hpInterp(xs, ys, x) {
  if (x <= xs[0]) return ys[0];
  for (let i = 1; i < xs.length; i++) if (x <= xs[i]) return ys[i - 1] + (ys[i] - ys[i - 1]) * (x - xs[i - 1]) / (xs[i] - xs[i - 1]);
  return ys[ys.length - 1];
}

/* 나이(만, 소수 가능)·집값·유형 → { monthly, eligible, ageCapped, priceCapped } */
function hpMonthly(age, price, type, T) {
  const tb = T.tables[type] || T.tables.general, A = T.ages, P = T.prices;
  if (!(age >= A[0]) || !(price > 0)) return { monthly: 0, eligible: age >= A[0], ageCapped: false, priceCapped: false };
  const a = Math.min(age, A[A.length - 1]), p = Math.min(price, P[P.length - 1]);
  const byAge = tb.map(row => p < P[0] ? row[0] * p / P[0] : hpInterp(P, row, p));
  const monthly = Math.round(hpInterp(A, byAge, a));
  return { monthly, eligible: true, ageCapped: age > A[A.length - 1], priceCapped: price > P[P.length - 1] };
}

/* 가입 나이별 비교: 지금 나이부터 표 마지막 나이까지 1살씩, until세까지 받은 합계 */
function hpCompare(ageNow, price, type, until, T) {
  const A = T.ages, rows = [];
  for (let a = Math.max(Math.ceil(ageNow), A[0]); a <= A[A.length - 1]; a++) {
    const m = hpMonthly(a, price, type, T).monthly, years = Math.max(0, until - a);
    rows.push({ age: a, monthly: m, years, total: m * 12 * years });
  }
  const best = rows.reduce((b, r) => (r.total > b.total ? r : b), rows[0] || { total: 0 });
  return { rows, best };
}

if (typeof module !== 'undefined') module.exports = { hpInterp, hpMonthly, hpCompare };
