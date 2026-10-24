// 주택연금 엔진 시험 — 기대값은 한국주택금융공사 월지급금 예시표(2026.03.01. 기준)와 손계산.
const T = require('./hf_table.json');
const { hpMonthly, hpCompare } = require('./engine.js');
const M = 1e4, E = 1e8;
let fail = 0, n = 0;
const eq = (name, got, want) => { n++; if (got !== want) { fail++; console.log(`✗ ${name}: ${got} (기대 ${want})`); } };
const mo = (a, p, t = 'general') => hpMonthly(a, p, t, T).monthly;

// 공사 예시 문구와 같은 값(70세·3억원)
eq('일반주택 70세 3억 = 92만 3천', mo(70, 3 * E), 923000);
eq('노인복지주택 70세 3억 = 78만 9천', mo(70, 3 * E, 'senior'), 789000);
eq('주거목적 오피스텔 70세 3억 = 74만 6천', mo(70, 3 * E, 'officetel'), 746000);
// 보간
eq('72세 4억: 1,231 + (1,525−1,231)×2/5 천원', mo(72, 4 * E), 1348600);
eq('70세 3.5억: (923+1,231)/2 천원', mo(70, 3.5 * E), 1077000);
eq('1억 미만은 비례: 70세 5천만 = 307천 × 0.5', mo(70, 0.5 * E), 153500);
// 범위 밖
eq('55세 미만 가입 불가', hpMonthly(54, 3 * E, 'general', T).eligible, false);
eq('85세는 80세 값', mo(85, 3 * E), 1449000);
eq('85세 표시 플래그', hpMonthly(85, 3 * E, 'general', T).ageCapped, true);
eq('13억은 12억 값', mo(70, 13 * E), 3414000);
eq('12억 넘음 플래그', hpMonthly(70, 13 * E, 'general', T).priceCapped, true);
// 가입 나이 비교: 65세·3억·90세까지
const c = hpCompare(65, 3 * E, 'general', 90, T);
eq('65~80세 16줄', c.rows.length, 16);
eq('65세 가입 합계 = 758천 × 12 × 25', c.rows[0].total, 758000 * 12 * 25);
eq('70세 가입 합계 = 923천 × 12 × 20', c.rows[5].total, 923000 * 12 * 20);
eq('가장 많이 받는 나이(90세까지)는 합계가 최대인 줄', c.best.total, Math.max(...c.rows.map(r => r.total)));

console.log(fail ? `실패 ${fail}/${n}` : `ALL PASS (${n}개)`);
process.exit(fail ? 1 : 0);
