import os
import glob

html_files = glob.glob('/Users/rahulkushwaha/Documents/New project 2/frontend/*.html')

new_header = """    <header class="site-header">
      <div class="nav">
        <!-- Left: Logo -->
        <a class="brand" href="/" aria-label="Ace Fitness Home">
          <span class="brand-mark">AF</span>
        </a>

        <!-- Center: Desktop Links -->
        <div class="nav-desktop-links">
          <a class="nav-link" href="/">Home</a>
          <a class="nav-link" href="/programs">Programs</a>
          <a class="nav-link" href="/dashboard">Dashboard</a>
          <a class="nav-link" href="/workout-tracker">Tracker</a>
          <a class="nav-link" href="/ai">AI Coach</a>
          <a class="nav-link" href="/contact">Contact</a>
        </div>

        <!-- Right: Icons & Mobile Toggle -->
        <div class="nav-icons">
          <!-- Search Icon -->
          <a class="nav-icon" href="#" aria-label="Search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </a>
          <!-- Profile Icon -->
          <a class="nav-icon" href="/profile.html" aria-label="Profile">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </a>
          <!-- Hamburger -->
          <button class="nav-dumbbell" id="navDumbbell" type="button" aria-label="Open menu">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>

        <!-- Mobile Mega Dropdown (Full Screen) -->
        <nav class="nav-mega-menu" id="navMegaMenu">
          <a href="/">Home</a>
          <a href="/programs">Programs</a>
          <a href="/my-courses">My Courses</a>
          <a href="/dashboard">Dashboard</a>
          <a href="/workout-tracker">Workout Tracker</a>
          <a href="/ai">AI Coach</a>
          <div class="nav-mega-divider"></div>
          <a href="/contact">Contact</a>
        </nav>
      </div>
    </header>"""

for filepath in html_files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    start_idx = content.find('<header class="site-header">')
    end_idx = content.find('</header>') + len('</header>')
    
    if start_idx != -1 and end_idx != -1:
        new_content = content[:start_idx] + new_header + content[end_idx:]
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")
    else:
        print(f"Header not found in {filepath}")

