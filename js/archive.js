/**
 * United We Stand - Archive Page JavaScript
 * Horizontal scroll gallery for magazine covers
 */

document.addEventListener('DOMContentLoaded', function() {
    initGallery();
});

/**
 * Curated magazine cover selection
 * Showcasing heritage and recent issues
 */
const magazineCovers = [
    // Recent issues
    { file: 'themag285.jpg', issue: 285 },
    { file: 'themag284.jpg', issue: 284 },
    { file: 'themag283.jpg', issue: 283 },
    { file: 'themag281.jpg', issue: 281 },
    { file: 'themag279.jpg', issue: 279 },
    { file: 'themag277.jpg', issue: 277 },
    { file: 'themag275.jpg', issue: 275 },
    { file: 'themag270.jpg', issue: 270 },
    { file: 'themag265.jpg', issue: 265 },
    { file: 'themag260.jpg', issue: 260 },
    { file: 'themag250.jpg', issue: 250 },
    { file: 'themagUws 240.jpg', issue: 240 },
    { file: 'themagUws 230.jpg', issue: 230 },
    { file: 'themagUWS 220 cover.jpg', issue: 220 },
    { file: 'themag210.jpg', issue: 210 },
    // Historic covers
    { file: 'front8.jpg', issue: null, label: 'Classic Issue' },
    { file: 'front7.jpg', issue: null, label: 'Classic Issue' },
    { file: 'front6.jpg', issue: null, label: 'Classic Issue' },
    { file: 'front5.jpg', issue: null, label: 'Classic Issue' },
    { file: 'front4.jpg', issue: null, label: 'Classic Issue' }
];

/**
 * Initialize gallery
 */
function initGallery() {
    const container = document.querySelector('.carousel-container');
    const track = document.getElementById('carousel-track');
    
    if (!track) return;
    
    // Render slides
    magazineCovers.forEach((cover) => {
        const slide = createSlide(cover);
        track.appendChild(slide);
    });
    
    // Navigation buttons (desktop only)
    const prevBtn = document.querySelector('.carousel-nav.prev');
    const nextBtn = document.querySelector('.carousel-nav.next');
    
    if (prevBtn && nextBtn && container) {
        prevBtn.addEventListener('click', () => {
            container.scrollBy({ left: -300, behavior: 'smooth' });
        });
        nextBtn.addEventListener('click', () => {
            container.scrollBy({ left: 300, behavior: 'smooth' });
        });
    }
}

/**
 * Create gallery slide
 */
function createSlide(cover) {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    
    const issueLabel = cover.issue ? `Issue ${cover.issue}` : (cover.label || 'Archive');
    
    slide.innerHTML = `
        <div class="cover-card">
            <img 
                src="/images/mags/${cover.file}" 
                alt="${issueLabel}"
                loading="lazy"
            />
            <div class="cover-overlay">
                <div class="issue-label">${issueLabel}</div>
            </div>
        </div>
    `;
    
    // Click handler - redirect to subscribe page
    slide.querySelector('.cover-card').addEventListener('click', () => {
        window.location.href = '/subscribe.html';
    });
    
    return slide;
}
