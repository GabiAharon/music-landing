const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;
const projectDir = __dirname;
const releasesPath = path.join(projectDir, 'releases.json');
const indexPath = path.join(projectDir, 'index.html');

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif'
};

// Build releases into index.html
function buildReleases() {
    const releases = JSON.parse(fs.readFileSync(releasesPath, 'utf8'));
    const releasesHTML = releases.map(r => `                <div class="release-card">
                    <img src="${r.image}" alt="${r.title} - ${r.artist}" class="release-image">
                    <div class="release-info">
                        <h4 class="release-title">${r.title}</h4>
                        <span class="release-artist">${r.artist}</span>
                    </div>
                </div>`).join('\r\n');

    let html = fs.readFileSync(indexPath, 'utf8');
    const regex = /(<div class="releases-container">)\s*([\s\S]*?)(\s*<\/div>\r?\n\s*<\/section>\r?\n\s*<\/main>)/;
    html = html.replace(regex, `$1\r\n${releasesHTML}\r\n            $3`);
    fs.writeFileSync(indexPath, html, 'utf8');
    return releases.length;
}

// Push to GitHub
function pushToGitHub(message) {
    return new Promise((resolve, reject) => {
        const cmd = `cd /d "${projectDir}" && git add . && git commit -m "${message}" && git push origin main`;
        exec(cmd, { shell: 'cmd.exe' }, (error, stdout, stderr) => {
            if (error) {
                reject(stderr || error.message);
            } else {
                resolve(stdout);
            }
        });
    });
}

// Admin HTML
const adminHTML = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎵 ניהול סינגלים</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, sans-serif;
            background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
            min-height: 100vh;
            padding: 2rem;
            color: #fff;
        }
        .container { max-width: 900px; margin: 0 auto; }
        h1 {
            text-align: center;
            margin-bottom: 2rem;
            background: linear-gradient(135deg, #9333ea, #ec4899);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 2.5rem;
        }
        .actions {
            display: flex;
            gap: 1rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
        }
        .btn {
            padding: 1rem 2rem;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .btn:hover { transform: translateY(-2px); }
        .btn-primary { background: linear-gradient(135deg, #9333ea, #ec4899); color: #fff; }
        .btn-success { background: linear-gradient(135deg, #10b981, #059669); color: #fff; }
        .btn-danger { background: #ef4444; color: #fff; }
        .btn-secondary { background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2); }
        
        .release-grid { display: grid; gap: 1rem; }
        .release-item {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 15px;
            padding: 1.5rem;
            display: grid;
            grid-template-columns: 100px 1fr auto;
            gap: 1.5rem;
            align-items: center;
        }
        .release-item img {
            width: 100px;
            height: 100px;
            object-fit: cover;
            border-radius: 10px;
        }
        .release-item .info { flex: 1; }
        .release-item input, .release-item select {
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            padding: 0.5rem;
            border-radius: 5px;
            color: #fff;
            font-size: 1rem;
            width: 100%;
            margin-bottom: 0.5rem;
        }
        .release-item input:focus { outline: none; border-color: #9333ea; }
        .release-item .actions-col { display: flex; flex-direction: column; gap: 0.5rem; }
        .release-item .btn { padding: 0.5rem 1rem; font-size: 0.9rem; }
        
        .status {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            padding: 1rem 2rem;
            border-radius: 10px;
            display: none;
            z-index: 1000;
        }
        .status.success { background: #10b981; display: block; }
        .status.error { background: #ef4444; display: block; }
        .status.loading { background: #6366f1; display: block; }
        
        .add-form {
            background: rgba(147, 51, 234, 0.1);
            border: 1px solid rgba(147, 51, 234, 0.3);
            border-radius: 15px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            display: none;
        }
        .add-form.show { display: block; }
        .add-form h3 { margin-bottom: 1rem; }
        .add-form .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr auto;
            gap: 1rem;
            align-items: end;
        }
        .add-form input, .add-form select {
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            padding: 0.75rem;
            border-radius: 8px;
            color: #fff;
            font-size: 1rem;
        }
        .add-form label { display: block; margin-bottom: 0.5rem; font-size: 0.9rem; color: rgba(255,255,255,0.7); }
        
        @media (max-width: 768px) {
            .release-item { grid-template-columns: 1fr; text-align: center; }
            .release-item img { margin: 0 auto; }
            .add-form .form-row { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎵 ניהול סינגלים</h1>
        
        <div class="actions">
            <button class="btn btn-primary" onclick="toggleAddForm()">➕ הוסף סינגל חדש</button>
            <button class="btn btn-success" onclick="deployToGitHub()">🚀 פרסם שינויים</button>
            <button class="btn btn-secondary" onclick="window.open('index.html', '_blank')">👁️ צפה באתר</button>
        </div>
        
        <div class="add-form" id="addForm">
            <h3>➕ הוסף סינגל חדש</h3>
            <div class="form-row">
                <div>
                    <label>שם השיר</label>
                    <input type="text" id="newTitle" placeholder="My New Song">
                </div>
                <div>
                    <label>אמן</label>
                    <select id="newArtist">
                        <option value="Gabi Aharon">Gabi Aharon</option>
                        <option value="Gabriel Aharon">Gabriel Aharon</option>
                    </select>
                </div>
                <div>
                    <label>שם קובץ התמונה</label>
                    <input type="text" id="newImage" placeholder="my-song.jpg">
                </div>
                <button class="btn btn-primary" onclick="addRelease()">הוסף</button>
            </div>
        </div>
        
        <div class="release-grid" id="releaseGrid">טוען...</div>
    </div>
    
    <div class="status" id="status"></div>
    
    <script>
        let releases = [];
        
        async function loadReleases() {
            const res = await fetch('/api/releases');
            releases = await res.json();
            renderReleases();
        }
        
        function renderReleases() {
            const grid = document.getElementById('releaseGrid');
            if (releases.length === 0) {
                grid.innerHTML = '<p style="text-align:center; color: rgba(255,255,255,0.5);">אין סינגלים עדיין. הוסף את הראשון!</p>';
                return;
            }
            grid.innerHTML = releases.map((r, i) => \`
                <div class="release-item" data-index="\${i}">
                    <img src="\${r.image}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect fill=%22%23333%22 width=%22100%22 height=%22100%22/><text x=%2250%25%22 y=%2250%25%22 fill=%22%23999%22 text-anchor=%22middle%22 dy=%22.3em%22>?</text></svg>'">
                    <div class="info">
                        <input type="text" value="\${r.title}" onchange="updateRelease(\${i}, 'title', this.value)" placeholder="שם השיר">
                        <select onchange="updateRelease(\${i}, 'artist', this.value)">
                            <option value="Gabi Aharon" \${r.artist === 'Gabi Aharon' ? 'selected' : ''}>Gabi Aharon</option>
                            <option value="Gabriel Aharon" \${r.artist === 'Gabriel Aharon' ? 'selected' : ''}>Gabriel Aharon</option>
                        </select>
                        <input type="text" value="\${r.image}" onchange="updateRelease(\${i}, 'image', this.value)" placeholder="שם קובץ התמונה">
                    </div>
                    <div class="actions-col">
                        \${i > 0 ? '<button class="btn btn-secondary" onclick="moveRelease(' + i + ', -1)">⬆️</button>' : ''}
                        \${i < releases.length - 1 ? '<button class="btn btn-secondary" onclick="moveRelease(' + i + ', 1)">⬇️</button>' : ''}
                        <button class="btn btn-danger" onclick="deleteRelease(\${i})">🗑️ מחק</button>
                    </div>
                </div>
            \`).join('');
        }
        
        function toggleAddForm() {
            document.getElementById('addForm').classList.toggle('show');
        }
        
        async function addRelease() {
            const title = document.getElementById('newTitle').value.trim();
            const artist = document.getElementById('newArtist').value;
            const image = document.getElementById('newImage').value.trim();
            
            if (!title || !image) {
                showStatus('אנא מלא את כל השדות', 'error');
                return;
            }
            
            releases.unshift({ title, artist, image });
            await saveReleases();
            document.getElementById('newTitle').value = '';
            document.getElementById('newImage').value = '';
            toggleAddForm();
        }
        
        function updateRelease(index, field, value) {
            releases[index][field] = value;
            saveReleases();
        }
        
        async function deleteRelease(index) {
            if (confirm('למחוק את הסינגל הזה?')) {
                releases.splice(index, 1);
                await saveReleases();
            }
        }
        
        async function moveRelease(index, direction) {
            const newIndex = index + direction;
            [releases[index], releases[newIndex]] = [releases[newIndex], releases[index]];
            await saveReleases();
        }
        
        async function saveReleases() {
            showStatus('שומר...', 'loading');
            const res = await fetch('/api/releases', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(releases)
            });
            if (res.ok) {
                showStatus('נשמר!', 'success');
                renderReleases();
            } else {
                showStatus('שגיאה בשמירה', 'error');
            }
        }
        
        async function deployToGitHub() {
            if (!confirm('לפרסם את כל השינויים ל-GitHub?')) return;
            
            showStatus('מעלה ל-GitHub...', 'loading');
            const res = await fetch('/api/deploy', { method: 'POST' });
            const data = await res.json();
            
            if (data.success) {
                showStatus('פורסם בהצלחה! האתר יתעדכן תוך דקה', 'success');
            } else {
                showStatus('שגיאה: ' + data.error, 'error');
            }
        }
        
        function showStatus(msg, type) {
            const el = document.getElementById('status');
            el.textContent = msg;
            el.className = 'status ' + type;
            if (type !== 'loading') {
                setTimeout(() => el.className = 'status', 3000);
            }
        }
        
        loadReleases();
    </script>
</body>
</html>`;

// Create server
const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    // API: Get releases
    if (url.pathname === '/api/releases' && req.method === 'GET') {
        const data = fs.readFileSync(releasesPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(data);
        return;
    }

    // API: Save releases
    if (url.pathname === '/api/releases' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            fs.writeFileSync(releasesPath, body, 'utf8');
            const count = buildReleases();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, count }));
        });
        return;
    }

    // API: Deploy to GitHub
    if (url.pathname === '/api/deploy' && req.method === 'POST') {
        try {
            await pushToGitHub('Update releases');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: error.toString() }));
        }
        return;
    }

    // Admin page
    if (url.pathname === '/' || url.pathname === '/admin') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(adminHTML);
        return;
    }

    // Serve static files
    let filePath = path.join(projectDir, url.pathname);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        const content = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
        return;
    }

    res.writeHead(404);
    res.end('Not found');
});

server.listen(PORT, () => {
    console.log('');
    console.log('========================================');
    console.log('   🎵 Music Admin Server Running');
    console.log('========================================');
    console.log('');
    console.log('   📍 Open in browser:');
    console.log('   http://localhost:' + PORT);
    console.log('');
    console.log('   Press Ctrl+C to stop');
    console.log('========================================');
    console.log('');

    // Auto-open browser
    exec('start http://localhost:' + PORT);
});
