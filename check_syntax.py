import re
import subprocess
import os

with open('index.html', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

match = re.search(r'<script type="text/babel" data-presets="react">(.*?)</script>', content, re.DOTALL)
if match:
    script = match.group(1)
    with open('temp_check.js', 'w', encoding='utf-8') as f:
        f.write(script)
    
    result = subprocess.run(['node', '--check', 'temp_check.js'], capture_output=True, text=True)
    if result.returncode == 0:
        print("Syntax OK")
    else:
        print("Syntax Error:")
        print(result.stderr)
else:
    print("No script found")
