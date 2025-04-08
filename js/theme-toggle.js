document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('theme-toggle');
    const storedTheme = localStorage.getItem('theme');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    // Explicitly check for light scheme preference as well
    const prefersLightScheme = window.matchMedia('(prefers-color-scheme: light)');

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        // Ensure localStorage is always updated when theme is applied
        localStorage.setItem('theme', theme);
        if (themeToggleButton) {
            themeToggleButton.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
    }

    // Initialize theme on load - DEFAULT DARK
    let initialTheme = 'dark'; // Default to dark mode

    if (storedTheme) {
        // 1. Use stored theme if it exists (highest priority)
        initialTheme = storedTheme;
    } else if (prefersLightScheme.matches) {
        // 2. If no stored theme, AND OS explicitly prefers light, use light
        initialTheme = 'light';
    } 
    // 3. Otherwise (no stored theme, OS prefers dark or no preference), initialTheme remains 'dark'
    
    // Apply the determined theme immediately on DOMContentLoaded
    applyTheme(initialTheme);

    // Add event listener for the toggle button
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            // Determine the new theme based on the current theme
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme); // Apply the new theme and update localStorage
        });
    }

    // Listen for changes in OS theme preference
    // This should only apply if the user hasn't manually set a theme
    prefersDarkScheme.addEventListener('change', (e) => {
        // Check localStorage again *inside* the listener to be sure
        if (!localStorage.getItem('theme')) { 
             applyTheme(e.matches ? 'dark' : 'light');
        }
    });
}); 