#!/usr/bin/env python3
import os
import re

# Files to update
html_files = [
    'ko.html',
    'en.html',
    'publications.html',
    'articles/ai-apt-representative.html',
    'articles/ai-llm-passion.html',
    'articles/ai-llm-passion_en.html',
    'articles/ai-coding-frenzy.html',
    'articles/ai-coding-frenzy_en.html',
    'articles/serena-mcp-guide.html'
]

def update_profile_image(file_path):
    """Update profile image to be clickable link to homepage"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Determine the correct home link based on file location
    if 'articles/' in file_path:
        # Article pages need to go up one level
        if '_en.html' in file_path or 'en.html' in file_path:
            home_link = '../en.html'
        else:
            home_link = '../ko.html'
    else:
        # Root level pages
        if file_path == 'en.html':
            home_link = 'en.html'
        elif file_path == 'publications.html':
            home_link = 'ko.html'  # Korean version by default
        else:
            home_link = 'ko.html'
    
    # Pattern to match the profile image
    pattern = r'(<img\s+src="[^"]+"\s+alt="Sangdon Park"\s+class="profile-avatar">)'
    
    # Replace with clickable link
    replacement = f'<a href="{home_link}" style="text-decoration: none;">\n                \\1\n            </a>'
    
    # Check if already wrapped in anchor tag
    if not re.search(r'<a[^>]*>[\s\n]*<img[^>]+class="profile-avatar"', content):
        content = re.sub(pattern, replacement, content)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ Updated: {file_path}")
    else:
        print(f"⊙ Already has link: {file_path}")

# Update all files
for file in html_files:
    if os.path.exists(file):
        update_profile_image(file)
    else:
        print(f"✗ File not found: {file}")

print("\n✅ Profile image links update complete!")