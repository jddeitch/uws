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


