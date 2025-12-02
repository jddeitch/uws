/**
 * Homepage-specific navigation behavior
 * Auto-hide/show nav based on scroll position (MOBILE ONLY)
 */

document.addEventListener('DOMContentLoaded', function() {
    const nav = document.querySelector('nav');
    const heroSection = document.querySelector('section'); // First section is hero
    let lastScroll = 0;
    
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
        const heroHeight = heroSection.offsetHeight;
        
        // Show nav when scrolled past hero section (where Subscribe button is)
        if (currentScroll > heroHeight * 0.7) {
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

