const fs = require('fs');
const path = require('path');

const projectDir = __dirname;
const releasesPath = path.join(projectDir, 'releases.json');
const indexPath = path.join(projectDir, 'index.html');

console.log('🎵 Building releases section...\n');

// Read releases.json
let releases;
try {
    const data = fs.readFileSync(releasesPath, 'utf8');
    releases = JSON.parse(data);
    console.log(`📀 Found ${releases.length} releases`);
} catch (e) {
    console.error('❌ Error reading releases.json:', e.message);
    process.exit(1);
}

// Generate HTML for releases
const releasesHTML = releases.map(r => `                <div class="release-card">
                    <img src="${r.image}" alt="${r.title} - ${r.artist}" class="release-image">
                    <div class="release-info">
                        <h4 class="release-title">${r.title}</h4>
                        <span class="release-artist">${r.artist}</span>
                    </div>
                </div>`).join('\r\n');

// Read index.html
let html;
try {
    html = fs.readFileSync(indexPath, 'utf8');
} catch (e) {
    console.error('❌ Error reading index.html:', e.message);
    process.exit(1);
}

// Find and replace the releases section using regex
const regex = /(<div class="releases-container">)\s*([\s\S]*?)(\s*<\/div>\r?\n\s*<\/section>\r?\n\s*<\/main>)/;
const match = html.match(regex);

if (!match) {
    console.error('❌ Could not find releases section in index.html');
    process.exit(1);
}

const newHTML = html.replace(regex, `$1\r\n${releasesHTML}\r\n            $3`);

// Write updated index.html
try {
    fs.writeFileSync(indexPath, newHTML, 'utf8');
    console.log('✅ index.html updated successfully!\n');
    console.log('Releases:');
    releases.forEach(r => console.log(`  ✓ ${r.title} (${r.artist})`));
} catch (e) {
    console.error('❌ Error writing index.html:', e.message);
    process.exit(1);
}

console.log('\n🚀 Done! Now pushing to GitHub...');
