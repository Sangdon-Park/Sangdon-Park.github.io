---
layout: default
title: Publications
permalink: /publications/
show_back_to_top: true
---

<!-- Page Header -->
<header class="page-header">
    <h1 class="page-title">Publications</h1>
    <p class="page-subtitle">
        <a href="https://scholar.google.com/citations?user={{ site.author.scholar }}&hl=en" target="_blank" style="color: var(--accent);">
            <i class="fas fa-graduation-cap"></i> View on Google Scholar
        </a>
    </p>
    <p style="margin-top: 10px; color: var(--text-secondary);">
        Papers (Dagger (†) denotes first authors and asterisk (*) denotes corresponding authors.)
    </p>
</header>

<!-- Category Tabs -->
<div class="category-tabs">
    <a href="#journals" class="category-tab active">
        <span>International Journals</span>
        <span class="category-count">25</span>
    </a>
    <a href="#conferences" class="category-tab">
        <span>International Conferences</span>
        <span class="category-count">10</span>
    </a>
    <a href="#standards" class="category-tab">
        <span>ITU-T Standards</span>
        <span class="category-count">8</span>
    </a>
    <a href="#patents" class="category-tab">
        <span>Patents</span>
        <span class="category-count">2</span>
    </a>
</div>

<!-- Content sections will be loaded by JavaScript -->
<section id="journals" class="posts-section">
    <div class="section-header">
        <h2 class="section-title">International Journals</h2>
        <p style="color: var(--text-secondary);">Total 25 papers: 4 first-authored, 13 corresponding-authored</p>
    </div>
    <div class="posts-list" style="max-width: 1200px; margin: 0 auto;">
        <!-- Papers will be dynamically loaded here -->
    </div>
</section>

<section id="conferences" class="posts-section" style="display: none;">
    <div class="section-header">
        <h2 class="section-title">International Conferences</h2>
        <p style="color: var(--text-secondary);">Total 10 papers: 3 first-authored, 2 corresponding-authored</p>
    </div>
    <div class="posts-list" style="max-width: 1200px; margin: 0 auto;">
        <!-- Papers will be dynamically loaded here -->
    </div>
</section>

<section id="standards" class="posts-section" style="display: none;">
    <div class="section-header">
        <h2 class="section-title">ITU-T Standards</h2>
    </div>
    <div class="posts-list" style="max-width: 1200px; margin: 0 auto;">
        <!-- Standards will be dynamically loaded here -->
    </div>
</section>

<section id="patents" class="posts-section" style="display: none;">
    <div class="section-header">
        <h2 class="section-title">Domestic Patents</h2>
    </div>
    <div class="posts-list" style="max-width: 1200px; margin: 0 auto;">
        <!-- Patents will be dynamically loaded here -->
    </div>
</section>

<!-- Keep the existing JavaScript from publications.html -->
<script>
// Category Tabs
const categoryTabs = document.querySelectorAll('.category-tab');
const sections = document.querySelectorAll('.posts-section');

categoryTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all tabs
        categoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Hide all sections
        sections.forEach(section => {
            section.style.display = 'none';
        });
        
        // Show target section
        const target = tab.getAttribute('href').substring(1);
        const targetSection = document.getElementById(target);
        if (targetSection) {
            targetSection.style.display = 'block';
        }
    });
});

// Load Publications Data
const publicationsData = {
    journals: [],
    conferences: [],
    standards: [],
    patents: []
};

// Your existing publication data loading code here...
// (Copy the JavaScript from the original publications.html)
</script>