/**
 * Generate OG Image for Social Media
 *
 * Composites the latest magazine cover with the UWS dot logo
 * onto a 1200x630 black background for social media previews.
 *
 * Called automatically by fetch-latest-cover.js when a new cover is detected.
 * Can also be run standalone: node scripts/generate-og-image.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const COVER_PATH = path.join(__dirname, '../images/mags/themag.jpg');
const LOGO_PATH = path.join(__dirname, '../images/uwslogo.svg');
const OUTPUT_PATH = path.join(__dirname, '../images/og-image.jpg');

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

async function generateOgImage() {
    // Check inputs exist
    if (!fs.existsSync(COVER_PATH)) {
        console.error('Cover image not found:', COVER_PATH);
        return false;
    }
    if (!fs.existsSync(LOGO_PATH)) {
        console.error('Logo not found:', LOGO_PATH);
        return false;
    }

    console.log('Generating OG image...');

    // Layout: cover on left, logo on right, both on black
    const PADDING = 50;
    const GAP = 60;
    const COVER_MAX_HEIGHT = OG_HEIGHT - (PADDING * 2); // 530px

    // Resize cover to fit height
    const coverBuffer = await sharp(COVER_PATH)
        .resize({ height: COVER_MAX_HEIGHT, fit: 'inside' })
        .toBuffer();
    const coverMeta = await sharp(coverBuffer).metadata();
    const coverW = coverMeta.width;
    const coverH = coverMeta.height;

    // Position cover: left side, vertically centered
    const coverX = PADDING;
    const coverY = Math.round((OG_HEIGHT - coverH) / 2);

    // Available space for logo
    const logoAreaX = coverX + coverW + GAP;
    const logoAreaWidth = OG_WIDTH - logoAreaX - PADDING;

    // Render SVG logo to fit available space
    // Logo viewBox is roughly 1506x577 (2.6:1 ratio)
    const logoBuffer = await sharp(LOGO_PATH)
        .resize({
            width: Math.round(logoAreaWidth),
            fit: 'inside',
        })
        .toBuffer();
    const logoMeta = await sharp(logoBuffer).metadata();
    const logoW = logoMeta.width;
    const logoH = logoMeta.height;

    // Center logo vertically in the canvas
    const logoX = logoAreaX + Math.round((logoAreaWidth - logoW) / 2);
    const logoY = Math.round((OG_HEIGHT - logoH) / 2);

    // Composite everything onto black background
    await sharp({
        create: {
            width: OG_WIDTH,
            height: OG_HEIGHT,
            channels: 3,
            background: { r: 0, g: 0, b: 0 },
        },
    })
        .composite([
            { input: coverBuffer, left: coverX, top: coverY },
            { input: logoBuffer, left: logoX, top: logoY },
        ])
        .jpeg({ quality: 90 })
        .toFile(OUTPUT_PATH);

    const stats = fs.statSync(OUTPUT_PATH);
    console.log(`OG image saved: ${OUTPUT_PATH} (${Math.round(stats.size / 1024)}KB)`);
    return true;
}

// Allow standalone execution
if (require.main === module) {
    generateOgImage()
        .then(success => {
            if (success) {
                console.log('OG image generated successfully');
            } else {
                console.error('Failed to generate OG image');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            process.exit(1);
        });
}

module.exports = { generateOgImage };
