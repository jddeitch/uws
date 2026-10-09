/**
 * Fetch Latest Magazine Covers from Exact Editions
 *
 * Scrapes the Exact Editions shop page for the current UWS cover (saved as
 * images/mags/themag.jpg, recorded in data/current-issue.json) and the two
 * issues before it (images/mags/previous-1.jpg and previous-2.jpg).
 *
 * Exits non-zero on any failure so the scheduled GitHub Action shows as
 * failed (and GitHub emails about it) instead of silently passing.
 *
 * Usage: node scripts/fetch-latest-cover.js
 */

const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const EXACT_EDITIONS_URL = 'https://shop.exacteditions.com/united-we-stand';
const DATA_FILE = path.join(__dirname, '../data/current-issue.json');
const COVER_PATH = path.join(__dirname, '../images/mags/themag.jpg');
const PREVIOUS_COVERS = 2;
const PREVIOUS_COVER_WIDTH = 800;
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (compatible; UWS-Bot/1.0; +https://uwsonline.com)',
    'Referer': EXACT_EDITIONS_URL
};

function readIssueData() {
    return fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) : {};
}

function writeIssueData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * GET with retries, so a single network blip doesn't fail the run.
 */
async function getWithRetry(url, options = {}, attempts = 3) {
    for (let attempt = 1; ; attempt++) {
        try {
            return await axios.get(url, { headers: HEADERS, timeout: 30000, ...options });
        } catch (error) {
            if (attempt >= attempts) throw error;
            console.log(`⚠️  ${error.message} - retrying (${attempt}/${attempts - 1})`);
            await new Promise(resolve => setTimeout(resolve, attempt * 5000));
        }
    }
}

/**
 * Save the issues before the current one as images/mags/previous-1.jpg, -2.jpg
 * (the cover stack on the site). The shop page carousel lists recent issues;
 * its image URLs are signed and expire, so the covers are stored locally.
 * The issue date in each URL path (YYYYMMDD) orders them, and the newest
 * (the current issue, saved as themag.jpg) is skipped. The saved dates are
 * recorded in current-issue.json, so the covers are only re-downloaded when
 * the issues change (resized bytes can differ between sharp versions).
 */
async function savePreviousCovers($) {
    const issues = [];
    $('ul.slider a[href*="reader.exacteditions.com/issues/"] img').each((i, el) => {
        const src = $(el).attr('src');
        const date = src && (src.match(/\/(\d{8})\/images\//) || [])[1];
        if (date) issues.push({ src, date });
    });
    issues.sort((a, b) => b.date.localeCompare(a.date));

    const previous = issues.slice(1, 1 + PREVIOUS_COVERS);
    if (previous.length < PREVIOUS_COVERS) {
        throw new Error(`found ${issues.length} issues in the shop carousel, need ${PREVIOUS_COVERS + 1} (page markup may have changed)`);
    }

    const dates = previous.map(issue => issue.date);
    const outPaths = previous.map((issue, i) => path.join(__dirname, `../images/mags/previous-${i + 1}.jpg`));
    const data = readIssueData();
    if (JSON.stringify(data.previousCovers) === JSON.stringify(dates) && outPaths.every(p => fs.existsSync(p))) {
        console.log(`✅ Previous covers unchanged (${dates.join(', ')})`);
        return;
    }

    for (const [i, issue] of previous.entries()) {
        const response = await getWithRetry(issue.src, { responseType: 'arraybuffer' });
        const resized = await sharp(Buffer.from(response.data))
            .resize({ width: PREVIOUS_COVER_WIDTH })
            .jpeg({ quality: 82 })
            .toBuffer();
        fs.writeFileSync(outPaths[i], resized);
        console.log(`✅ Previous cover ${i + 1} (${issue.date}) saved to: ${outPaths[i]}`);
    }

    writeIssueData({ ...readIssueData(), previousCovers: dates });
}

/**
 * Save the current cover (the page's og:image) if it has changed, update
 * current-issue.json and regenerate the OG image. Returns true if it changed.
 */
async function updateCurrentCover($) {
    let coverImageUrl = $('meta[property="og:image"]').attr('content');
    if (!coverImageUrl) {
        throw new Error('no og:image on the shop page (page markup may have changed)');
    }

    // Ensure URL is absolute
    if (coverImageUrl.startsWith('//')) {
        coverImageUrl = 'https:' + coverImageUrl;
    } else if (coverImageUrl.startsWith('/')) {
        coverImageUrl = 'https://shop.exacteditions.com' + coverImageUrl;
    }
    console.log('Found cover URL:', coverImageUrl);

    console.log('⬇️  Downloading cover image...');
    const imageResponse = await getWithRetry(coverImageUrl, { responseType: 'arraybuffer' });
    const newImageBuffer = Buffer.from(imageResponse.data);

    // The URL is a stable permalink that doesn't change between issues,
    // so compare bytes instead
    if (fs.existsSync(COVER_PATH)) {
        const md5 = buffer => crypto.createHash('md5').update(buffer).digest('hex');
        const existingHash = md5(fs.readFileSync(COVER_PATH));
        const newHash = md5(newImageBuffer);
        if (existingHash === newHash) {
            console.log('✅ Cover image unchanged - no update needed');
            return false;
        }
        console.log(`📸 New cover detected! (hash ${existingHash.slice(0, 8)} → ${newHash.slice(0, 8)})`);
    } else {
        console.log('📸 No existing cover - saving new one');
    }

    fs.writeFileSync(COVER_PATH, newImageBuffer);
    console.log('✅ Cover image saved to:', COVER_PATH);

    const currentData = readIssueData();
    writeIssueData({
        ...currentData,
        issueNumber: currentData.issueNumber || 'Latest',
        coverImage: './images/mags/themag.jpg',
        coverImageExternal: coverImageUrl,
        publicationDate: new Date().toISOString().split('T')[0],
        exactEditionsUrl: EXACT_EDITIONS_URL,
        lastUpdated: new Date().toISOString(),
        note: 'Cover image automatically downloaded from Exact Editions'
    });
    console.log('✅ Successfully updated current-issue.json');

    // Social preview image with the new cover
    const { generateOgImage } = require('./generate-og-image');
    if (!(await generateOgImage())) {
        throw new Error('cover saved, but OG image generation failed');
    }

    return true;
}

async function main() {
    console.log('Fetching covers from Exact Editions...');
    const response = await getWithRetry(EXACT_EDITIONS_URL);
    const $ = cheerio.load(response.data);

    // Both run even if one fails; any failure fails the run at the end
    const failures = [];
    let changed = false;
    try {
        changed = await updateCurrentCover($);
    } catch (error) {
        failures.push(`current cover: ${error.message}`);
    }
    try {
        await savePreviousCovers($);
    } catch (error) {
        failures.push(`previous covers: ${error.message}`);
    }

    if (failures.length) {
        throw new Error(failures.join('; '));
    }
    console.log(changed ? '✅ Cover updated successfully' : 'ℹ️ No new cover');
}

main().catch(error => {
    console.error('❌ Cover update failed:', error.message);
    process.exit(1);
});
