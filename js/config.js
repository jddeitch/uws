/**
 * United We Stand - Site Configuration
 * Centralized configuration for analytics, copyright, and site-wide settings
 */

const UWSConfig = {
    // Copyright year range (automatically updates the end year)
    copyright: {
        startYear: 1989,
        endYear: new Date().getFullYear()
    },
    
    // Analytics configuration
    analytics: {
        // Cloudflare Web Analytics
        // Get your token from: https://dash.cloudflare.com
        // Leave empty to disable analytics
        cloudflareToken: '', // Add your token here when ready: 'YOUR_TOKEN_HERE'
        enabled: false // Set to true when you add the token
    },
    
    // Site URLs
    urls: {
        forum: 'https://forum.uwsonline.com',
        exactEditions: 'https://shop.exacteditions.com/united-we-stand',
        podcast: 'https://audioboom.com/channel/united-we-stand-podcast'
    },
    
    // Contact information
    contact: {
        email: 'uwsmag@yahoo.co.uk',
        address: {
            line1: 'United We Stand',
            line2: '43 Chapel Road',
            city: 'Manchester',
            postcode: 'M22 4JN'
        }
    }
};

// Initialize site configuration when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Load components (nav and footer)
    loadComponents();
});

/**
 * Update copyright year in footer
 */
function updateCopyright() {
    const copyrightElements = document.querySelectorAll('.copyright-year');
    const copyrightText = `${UWSConfig.copyright.startYear}-${UWSConfig.copyright.endYear}`;
    
    copyrightElements.forEach(el => {
        el.textContent = copyrightText;
    });
}

/**
 * Update contact information in footer
 */
function updateContactInfo() {
    const contactElements = document.querySelectorAll('.contact-address');
    const contact = UWSConfig.contact;
    
    const addressHTML = `
        ${contact.address.line1}<br>
        ${contact.address.line2}<br>
        ${contact.address.city}<br>
        ${contact.address.postcode}
    `;
    
    contactElements.forEach(el => {
        el.innerHTML = addressHTML;
    });
}

/**
 * Load site components (nav and footer)
 */
async function loadComponents() {
    // Load navigation
    const navElement = document.getElementById('site-nav');
    if (navElement) {
        try {
            const navResponse = await fetch('/components/nav.html');
            const navHTML = await navResponse.text();
            navElement.innerHTML = navHTML;
        } catch (error) {
            console.error('Error loading navigation:', error);
        }
    }
    
    // Load footer
    const footerElement = document.getElementById('site-footer');
    if (footerElement) {
        try {
            const footerResponse = await fetch('/components/footer.html');
            const footerHTML = await footerResponse.text();
            footerElement.innerHTML = footerHTML;
            
            // After footer is loaded, update dynamic content
            updateCopyright();
            updateContactInfo();
        } catch (error) {
            console.error('Error loading footer:', error);
        }
    }
    
    // Initialize analytics if enabled
    if (UWSConfig.analytics.enabled && UWSConfig.analytics.cloudflareToken) {
        initializeAnalytics();
    }
}

/**
 * Initialize Cloudflare Analytics
 */
function initializeAnalytics() {
    const script = document.createElement('script');
    script.defer = true;
    script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    script.setAttribute('data-cf-beacon', JSON.stringify({
        token: UWSConfig.analytics.cloudflareToken
    }));
    document.body.appendChild(script);
}

