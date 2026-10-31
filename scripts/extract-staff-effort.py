"""Extract the AISHA Grant Agreement effort table; reconcile every row and column.
Usage: python scripts/extract-staff-effort.py /path/to/agreement.pdf
No source PDF is copied into the public site.
"""
import json, sys
from decimal import Decimal
from pathlib import Path
import pdfplumber
root = Path(__file__).resolve().parents[1]
rows = []
with pdfplumber.open(sys.argv[1]) as pdf:
    for n in (89, 90):
        table = pdf.pages[n-1].extract_tables()[0]
        assert table[1] == ['Participant'] + [f'WP{i}' for i in range(1,11)] + ['Total Person-Months']
        rows.extend(table[2:])
total = rows.pop()
assert total[0] == 'Total Person-Months' and len(rows) == 30
partners = []
for row in rows:
    number, code = row[0].split(' - ', 1)
    wps = {f'WP{i}': str(Decimal(value or '0').quantize(Decimal('.00'))) for i,value in enumerate(row[1:11],1)}
    assert sum(map(Decimal,wps.values())) == Decimal(row[11]), code
    partners.append({'number':int(number),'code':code,'wps':wps,'total':row[11]})
wp_totals = {f'WP{i}': total[i] for i in range(1,11)}
for wp,value in wp_totals.items():
    assert sum(Decimal(p['wps'][wp]) for p in partners) == Decimal(value), wp
assert sum(Decimal(p['total']) for p in partners) == Decimal(total[11]) == Decimal('1197.50')
data = {'version':'equal-task-month-v1','unit':'PM','source':'AISHA Grant Agreement 101299070, Part A pp. 28–29 (PDF pp. 89–90)', 'source_pages':[89,90],'printed_pages':[28,29], 'planning_method':'Internal planning estimate: divide each partner’s Work Package allocation equally among its assigned Tasks, then equally across each Task’s active months. Official allocations remain at partner/Work Package level.', 'partners':partners,'wp_totals':wp_totals,'total':total[11]}
(root/'assets/staff-effort-data.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print(f'Reconciled {len(partners)} participants × {len(wp_totals)} Work Packages: {data["total"]} PM')
