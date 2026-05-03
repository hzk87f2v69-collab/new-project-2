import os
import re

files = [
    'frontend/ai.html',
    'frontend/auth.html',
    'frontend/dashboard.html',
    'frontend/map.html',
    'frontend/profile.html',
    'frontend/programs.html',
    'frontend/workout-tracker.html'
]

# Pattern to match the header toggle block
pattern = re.compile(r'<!-- Center \(Mobile\) / Right \(Desktop\): Toggle -->\s*<div class="header-toggle">.*?</div>', re.DOTALL)

for f in files:
    if os.path.exists(f):
        with open(f, 'r') as file:
            content = file.read()
        
        new_content = pattern.sub('', content)
        
        if new_content != content:
            with open(f, 'w') as file:
                file.write(new_content)
            print(f"Updated {f}")
        else:
            print(f"No match in {f}")
    else:
        print(f"File not found: {f}")
