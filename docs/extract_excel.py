#!/usr/bin/env python3
import zipfile
import re
import xml.etree.ElementTree as ET

xlsx = zipfile.ZipFile('悦和科技产品货架.xlsx')

def extract_sheet_data(content):
    ns = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'

    # Method 1: inline strings
    inline_pattern = r'<is><t[^>]*>([^<]*)</t></is>'
    inline_strings = re.findall(inline_pattern, content)

    # Method 2: regular values
    tree = ET.fromstring(content)
    values = []
    for v in tree.iter(f'{{{ns}}}v'):
        if v.text:
            values.append(v.text)

    return inline_strings, values

sheets = {
    'RFID温度传感器类': 'xl/worksheets/sheet2.xml',
    'RFID天线类': 'xl/worksheets/sheet3.xml',
    'RFID温度采集器类': 'xl/worksheets/sheet4.xml',
    'RFID射频线类': 'xl/worksheets/sheet5.xml',
    '融合测温类': 'xl/worksheets/sheet6.xml',
    '环境监测类': 'xl/worksheets/sheet7.xml',
    '局放监测类': 'xl/worksheets/sheet8.xml',
    '状态监测类': 'xl/worksheets/sheet9.xml',
}

for sheet_name, sheet_file in sheets.items():
    print(f"\n{'='*70}")
    print(f"Sheet: {sheet_name}")
    print('='*70)

    content = xlsx.read(sheet_file).decode('utf-8')
    inline_strings, values = extract_sheet_data(content)

    print(f"Found {len(inline_strings)} inline strings, {len(values)} values")

    # Print first 200 inline strings to understand structure
    for i, s in enumerate(inline_strings[:200]):
        if s.strip():
            print(f"{i}: {s}")