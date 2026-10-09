/**
 * United We Stand - Main JavaScript
 * Handles navigation, dynamic content loading, and site-wide functionality
 */

// Load prices on page load
document.addEventListener('DOMContentLoaded', function() {
    loadPrices();
});

/**
 * Fill prices from data/pricing.json (the values in the HTML are fallbacks).
 * Doto's full stop is a plus-shaped dot cluster, so scoreboard prices get
 * their decimal point set in Inter.
 */
async function loadPrices() {
    if (!document.querySelector('[data-price], [data-paypal-amount]')) return;
    try {
        const response = await fetch('./data/pricing.json');
        const pricing = await response.json();

        document.querySelectorAll('[data-price]').forEach(el => {
            const price = pricing[el.dataset.price];
            if (!price) return;
            const [pounds, pence] = String(price).split('.');
            el.textContent = '£' + pounds;
            if (pence === undefined) return;
            if (el.classList.contains('scoreboard')) {
                const point = document.createElement('span');
                point.className = 'scoreboard-point';
                point.textContent = '.';
                el.append(point, pence);
            } else {
                el.append('.' + pence);
            }
        });

        document.querySelectorAll('[data-paypal-amount]').forEach(el => {
            const price = pricing[el.dataset.paypalAmount];
            if (price) el.value = price;
        });
    } catch (error) {
        console.error('Error loading prices:', error);
        // Fallback prices are already in the HTML
    }
}
