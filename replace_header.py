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
          <a href="/"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>Home</a>
          <a href="/programs"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M7 7h10"></path><path d="M7 12h10"></path><path d="M7 17h10"></path></svg>Programs</a>
          <a href="/my-courses"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 6 8-4 8 4"></path><path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2"></path><path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4"></path><path d="M18 5v17"></path><path d="M6 5v17"></path><circle cx="12" cy="9" r="2"></circle></svg>My Courses</a>
          <a href="/dashboard"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>Dashboard</a>
          <a href="/workout-tracker"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H14.76a2 2 0 0 1 1.79 1.1L18 14"></path><path d="M6 14h12"></path><path d="M6 14v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4"></path><path d="M14 22v-4"></path><path d="M10 22v-4"></path><path d="M4 6h16"></path><path d="M4 10h16"></path></svg>Workout Tracker</a>
          <a href="/ai"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path><path d="M12 8V4"></path><circle cx="12" cy="4" r="1"></circle></svg>AI Coach</a>
          <div class="nav-mega-divider"></div>
          <a href="/contact"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>Contact</a>
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

