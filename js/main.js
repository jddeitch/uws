/**
 * United We Stand - Main JavaScript
 * Handles navigation, dynamic content loading, and site-wide functionality
 */

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // Load current issue data
    loadCurrentIssue();
});

/**
 * Load current issue information from data file
 */
async function loadCurrentIssue() {
    try {
        const response = await fetch('/data/current-issue.json');
        const data = await response.json();
        
        // Update cover image on homepage
        const coverImg = document.getElementById('current-cover');
        if (coverImg && data.coverImage) {
            coverImg.src = data.coverImage;
            coverImg.alt = `United We Stand Issue ${data.issueNumber}`;
        }
        
    } catch (error) {
        console.error('Error loading current issue:', error);
        // Fallback to default content
    }
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
}

/**
 * Smooth scroll to element
 */
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}


/**
 * Track outbound links (for analytics)
 */
document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (link && link.href && link.host !== window.location.host) {
        // Track external link clicks
        const destination = link.href;
        console.log('External link clicked:', destination);
        // Add analytics tracking here if needed
    }
});

