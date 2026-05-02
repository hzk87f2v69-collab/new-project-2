with open('public/assets/js/dashboard.js', 'r') as f:
    js = f.read()

# Replace This Week (cyan -> accent blue)
js = js.replace('rgba(32,199,255', 'rgba(0,102,204')
# Replace Last Week (purple -> success green)
js = js.replace('rgba(168,85,247', 'rgba(48,209,88')
# Replace tooltips/grid lines
js = js.replace('rgba(159,178,203,0.55)', 'rgba(255,255,255,0.55)')
js = js.replace('rgba(7,12,23,0.94)', 'rgba(28,28,30,0.94)')

with open('public/assets/js/dashboard.js', 'w') as f:
    f.write(js)
