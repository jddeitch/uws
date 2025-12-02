/**
 * Homepage-specific navigation behavior
 * Auto-hide/show nav based on scroll position (MOBILE ONLY)
 * Nav only appears when Subscribe button is COMPLETELY off screen
 */

document.addEventListener('DOMContentLoaded', function() {
    const nav = document.querySelector('nav');
    const heroSection = document.querySelector('section'); // First section is hero
    
    if (!nav || !heroSection) return;
    
    function isMobile() {
        return window.innerWidth < 768; // md breakpoint
    }
    
    function updateNavVisibility() {
        // Only apply auto-hide on mobile
        if (!isMobile()) {
            nav.style.transform = 'translateY(0)';
            return;
        }
        
        const currentScroll = window.pageYOffset;
        const heroRect = heroSection.getBoundingClientRect();
        const heroBottom = heroRect.bottom + currentScroll;
        
        // Show nav ONLY when entire hero section (including Subscribe button) is scrolled past
        // Adding small buffer to ensure button is completely gone
        if (currentScroll > heroBottom + 20) {
            nav.style.transform = 'translateY(0)';
        } else {
            nav.style.transform = 'translateY(-100%)';
        }
    }
    
    // Set initial state
    nav.style.transition = 'transform 0.3s ease-in-out';
    updateNavVisibility();
    
    // Update on scroll
    window.addEventListener('scroll', updateNavVisibility);
    
    // Update on resize (in case user rotates device or resizes window)
    window.addEventListener('resize', updateNavVisibility);
});

