/**
 * Homepage-specific navigation behavior
 * Auto-hide/show nav based on scroll position (MOBILE ONLY)
 * Nav only appears when Subscribe button is COMPLETELY off screen
 */

// Wait for nav to be loaded by config.js before running
setTimeout(function initHomeNav() {
    const nav = document.querySelector('nav');
    const heroSection = document.querySelector('section'); // First section is hero
    
    // If nav hasn't loaded yet, try again
    if (!nav || !heroSection) {
        setTimeout(initHomeNav, 100);
        return;
    }
    
    function isMobile() {
        return window.innerWidth < 768; // md breakpoint
    }
    
    function updateNavVisibility() {
        // Only apply auto-hide on mobile
        if (!isMobile()) {
            nav.style.transform = 'translateY(0)';
            return;
        }
        
        // Get the bottom of the entire hero section
        const heroRect = heroSection.getBoundingClientRect();
        
        // Show nav ONLY when hero section is completely scrolled off screen
        // heroRect.bottom < 0 means the bottom of the hero is above the viewport
        if (heroRect.bottom < 0) {
            nav.style.transform = 'translateY(0)';
        } else {
            nav.style.transform = 'translateY(-100%)';
        }
    }
    
    // Set initial state (CSS already has transition and initial hide)
    updateNavVisibility();
    
    // Update on scroll
    window.addEventListener('scroll', updateNavVisibility);
    
    // Update on resize (in case user rotates device or resizes window)
    window.addEventListener('resize', updateNavVisibility);
}, 100);

