/**
 * Fetch Latest Magazine Cover from Exact Editions
 * 
 * This script scrapes the Exact Editions page to get the latest UWS cover image
 * and updates the current-issue.json file automatically.
 * 
 * Run: npm install axios cheerio
 * Usage: node scripts/fetch-latest-cover.js
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const { createWriteStream } = require('fs');
const { pipeline } = require('stream');
const { promisify } = require('util');
const streamPipeline = promisify(pipeline);

const EXACT_EDITIONS_URL = 'https://shop.exacteditions.com/united-we-stand';
const DATA_FILE = path.join(__dirname, '../data/current-issue.json');

async function fetchLatestCover() {
    try {
        console.log('Fetching latest cover from Exact Editions...');
        
        // Fetch the page
        const response = await axios.get(EXACT_EDITIONS_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; UWS-Bot/1.0; +https://uwsonline.com)'
            }
        });
        
        // Parse HTML
        const $ = cheerio.load(response.data);
        
        // Find the cover image
        // Exact Editions typically uses og:image meta tag for the latest cover
        let coverImageUrl = null;
        
        // Priority 1: Open Graph image (most reliable)
        coverImageUrl = $('meta[property="og:image"]').attr('content');
        
        if (!coverImageUrl) {
            // Priority 2: Try finding the main publication cover
            const selectors = [
                'img[alt*="United We Stand"]',
                'img[alt*="united we stand"]',
                '.publication-cover img',
                '.cover-image img',
                'img.cover',
                '.latest-issue img',
                'article img',
                '.product-image img'
            ];
            
            for (const selector of selectors) {
                const src = $(selector).first().attr('src');
                if (src && (src.includes('cover') || src.includes('issue') || src.includes('.jpg') || src.includes('.png'))) {
                    coverImageUrl = src;
                    console.log(`Found cover using selector: ${selector}`);
                    break;
                }
            }
        } else {
            console.log('Found cover using og:image meta tag');
        }
        
        if (!coverImageUrl) {
            console.log('❌ Could not find cover image on page');
            console.log('Available meta tags:');
            $('meta').each((i, el) => {
                const property = $(el).attr('property') || $(el).attr('name');
                const content = $(el).attr('content');
                if (property && content) {
                    console.log(`  ${property}: ${content.substring(0, 100)}`);
                }
            });
            return false;
        }
        
        // Ensure URL is absolute
        if (coverImageUrl.startsWith('//')) {
            coverImageUrl = 'https:' + coverImageUrl;
        } else if (coverImageUrl.startsWith('/')) {
            coverImageUrl = 'https://shop.exacteditions.com' + coverImageUrl;
        }
        
        console.log('Found cover URL:', coverImageUrl);
        
        // Extract metadata from the page
        const issueTitle = $('meta[property="og:title"]').attr('content') || '';
        const issueDescription = $('meta[property="og:description"]').attr('content') || '';

        // Try to extract issue number/date from the title or description
        // Exact Editions titles often include the issue info
        console.log('Page title:', issueTitle);
        if (issueDescription) console.log('Description:', issueDescription);

        // Read current data
        let currentData = {};
        if (fs.existsSync(DATA_FILE)) {
            currentData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        }

        // Check if URL has changed
        if (currentData.coverImageExternal === coverImageUrl) {
            console.log('✅ Cover image unchanged - no update needed');
            return false;
        }

        console.log('📸 New cover detected!');
        console.log(`   Old: ${currentData.coverImageExternal || 'none'}`);
        console.log(`   New: ${coverImageUrl}`);

        // Download the image directly to themag.jpg
        console.log('⬇️  Downloading cover image...');
        const imageResponse = await axios.get(coverImageUrl, {
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; UWS-Bot/1.0; +https://uwsonline.com)',
                'Referer': EXACT_EDITIONS_URL
            }
        });

        const imagePath = path.join(__dirname, '../images/mags/themag.jpg');
        const writer = createWriteStream(imagePath);

        await streamPipeline(imageResponse.data, writer);
        console.log('✅ Cover image saved to:', imagePath);

        // Update data
        const updatedData = {
            issueNumber: currentData.issueNumber || 'Latest',
            coverImage: './images/mags/themag.jpg',
            coverImageExternal: coverImageUrl,
            publicationDate: new Date().toISOString().split('T')[0],
            exactEditionsUrl: EXACT_EDITIONS_URL,
            lastUpdated: new Date().toISOString(),
            note: 'Cover image automatically downloaded from Exact Editions'
        };

        // Write updated data
        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify(updatedData, null, 2),
            'utf8'
        );

        console.log('✅ Successfully updated current-issue.json');
        console.log(`📝 File updated at: ${DATA_FILE}`);
        return true;
        
    } catch (error) {
        console.error('❌ Error fetching latest cover:', error.message);
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   URL: ${EXACT_EDITIONS_URL}`);
        }
        return false;
    }
}

// Run the function
fetchLatestCover().then(changed => {
    if (changed) {
        console.log('✅ Cover updated successfully');
        process.exit(0);
    } else {
        console.log('ℹ️ No changes detected');
        process.exit(0);
    }
}).catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
});

