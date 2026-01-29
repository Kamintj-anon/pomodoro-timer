/**
 * NEO-POP MAGAZINE AUTH - INITIALIZATION
 * Creates decorative column structure
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMagazineLayout);
    } else {
        initMagazineLayout();
    }

    function initMagazineLayout() {
        const authContainer = document.querySelector('.auth-container');
        if (!authContainer) {
            console.warn('Auth container not found');
            return;
        }

        // Check if decorative column already exists
        if (authContainer.querySelector('.decorative-column')) {
            console.log('✓ Magazine layout already initialized');
            return;
        }

        // Create decorative column
        const decorativeColumn = document.createElement('div');
        decorativeColumn.className = 'decorative-column';

        // Create headline
        const headline = document.createElement('div');
        headline.className = 'decorative-headline';
        headline.innerHTML = 'FOCUS<br>/<br>MODE';

        // Create retro icon
        const icon = document.createElement('div');
        icon.className = 'decorative-icon';
        icon.innerHTML = '<i class="fas fa-clock"></i>';

        // Assemble decorative column
        decorativeColumn.appendChild(headline);
        decorativeColumn.appendChild(icon);

        // Insert as first child of auth-container
        authContainer.insertBefore(decorativeColumn, authContainer.firstChild);

        console.log('✓ Neo-Pop Magazine layout initialized');
    }

    // Re-initialize on theme changes (if form switches)
    document.addEventListener('DOMContentLoaded', () => {
        // Watch for form switches
        const observer = new MutationObserver(() => {
            // Ensure decorative column persists
            initMagazineLayout();
        });

        const authContainer = document.querySelector('.auth-container');
        if (authContainer) {
            observer.observe(authContainer, {
                childList: true,
                subtree: true
            });
        }
    });

})();
