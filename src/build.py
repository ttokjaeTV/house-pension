"""src/ → index.html 빌드:  python src/build.py"""
import json
from pathlib import Path
S = Path(__file__).parent
t = (S / 'template.html').read_text(encoding='utf-8')
eng = (S / 'engine.js').read_text(encoding='utf-8').replace("if (typeof module !== 'undefined') module.exports = { hpInterp, hpMonthly, hpCompare };\n", '')
table = json.loads((S / 'hf_table.json').read_text(encoding='utf-8'))
t = t.replace('/*__BASE_CSS__*/\n', (S / 'base.css').read_text(encoding='utf-8'))
t = t.replace('/*__ENGINE__*/', eng)
t = t.replace('/*__HF_TABLE__*/', 'const HF_TABLE = ' + json.dumps(table, ensure_ascii=False) + ';  // rules-ok: 한국주택금융공사 지급표 데이터(집값 칸 1억~12억원)')
assert '/*__' not in t and 'module.exports' not in t
(S.parent / 'index.html').write_text(t, encoding='utf-8')
print('index.html', len(t))
