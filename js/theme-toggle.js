document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('theme-toggle');
    // Ensure correct check for localStorage item existence
    const storedTheme = localStorage.getItem('theme');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    // Function to set the theme on the <html> element
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (themeToggleButton) {
            themeToggleButton.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        }
    }

    // Initialize theme on load
    let initialTheme = 'light'; // Default to light
    if (storedTheme) {
        initialTheme = storedTheme;
    } else if (prefersDarkScheme.matches) {
        initialTheme = 'dark';
    }
    applyTheme(initialTheme);

    // Add event listener for the toggle button
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    }

    // Listen for changes in OS theme preference
    prefersDarkScheme.addEventListener('change', (e) => {
        // Only change if the user hasn't manually overridden the theme via the button
        if (!localStorage.getItem('theme')) {
             applyTheme(e.matches ? 'dark' : 'light');
        }
    });
}); 