/**
 * Homepage-specific navigation behavior
 * Auto-hide/show nav based on scroll position (MOBILE ONLY)
 * Nav only appears when the Subscribe button is COMPLETELY off screen
 */

// Wait for nav and button to be loaded
setTimeout(function initHomeNav() {
    const nav = document.querySelector('nav');
    const subscribeBtn = document.getElementById('hero-subscribe-btn');
    
    // If nav or button hasn't loaded yet, try again
    if (!nav || !subscribeBtn) {
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
        
        // Get the position of the Subscribe button
        const btnRect = subscribeBtn.getBoundingClientRect();
        
        // Show nav ONLY when Subscribe button is completely scrolled off screen
        // btnRect.bottom < 0 means the bottom of the button is above the viewport
        if (btnRect.bottom < 0) {
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

