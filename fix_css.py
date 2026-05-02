import re

with open('public/assets/css/workout-tracker.css', 'r') as f:
    css = f.read()

# Typography
css = re.sub(r"font-family:.*?;", "", css)

# Backgrounds
# I already replaced #000 with var(--bg) using sed earlier, but let's be sure.
css = css.replace('#000', 'var(--bg)')
css = css.replace('var(--bg)0000', 'var(--bg)') # in case of double replacement
css = css.replace('#1c1c1e', 'var(--panel)')
css = css.replace('rgba(28, 28, 30, 0.92)', 'var(--panel)')
css = css.replace('#2c2c2e', 'rgba(255, 255, 255, 0.08)')
css = css.replace('#3a3a3c', 'rgba(255, 255, 255, 0.12)')
css = css.replace('rgba(0,0,0,0.92)', 'var(--panel)')

# Primary accents
css = css.replace('#0066cc', 'var(--accent)')
css = css.replace('#30d158', 'var(--success)')
css = css.replace('#ff9f0a', 'var(--warning)')
css = css.replace('#ff453a', 'var(--danger)')
css = css.replace('#5e5ce6', 'var(--accent)') # replace mon icon color with accent
css = css.replace('#bf5af2', 'var(--accent-strong)') # fri icon color

# Text colors
css = css.replace('color: #fff;', 'color: var(--text);')

# Day Card & Action Buttons enhancements (Adding glassmorphism/shadows)
css = css.replace('border-radius: 16px;', 'border-radius: var(--radius-lg);')
css = css.replace('border-radius: 14px;', 'border-radius: var(--radius-md);')

with open('public/assets/css/workout-tracker.css', 'w') as f:
    f.write(css)
