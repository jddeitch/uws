/**
 * United We Stand - Main JavaScript
 * Handles navigation, dynamic content loading, and site-wide functionality
 */

// Load current issue data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadCurrentIssue();
});

/**
 * Load current issue information from data file
 */
async function loadCurrentIssue() {
    try {
        const response = await fetch('./data/current-issue.json');
        const data = await response.json();

        // Prefer local cover (updated by GitHub Action) to avoid flash.
        // Only fall back to external URL if local path isn't set.
        const coverSrc = data.coverImage || './images/mags/themag.jpg';
        const altText = `United We Stand Issue ${data.issueNumber || 'Latest'}`;

        // Update both desktop and mobile cover images
        const covers = document.querySelectorAll('#current-cover, #current-cover-mobile');
        covers.forEach(img => {
            img.src = coverSrc;
            img.alt = altText;
        });

    } catch (error) {
        console.error('Error loading current issue:', error);
        // Fallback to default content - already set in HTML
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

