const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        fs.statSync(dirPath).isDirectory() ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

walkDir('./src', (filePath) => {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let newContent = content
            .replace(/RANGREZ/g, 'VASTRA AURA')
            .replace(/Rangrez/g, 'Vastra Aura')
            .replace(/rangrez\.com/g, 'vastraaura.com')
            .replace(/rangrez/g, 'vastraaura');
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log('Updated: ' + filePath);
        }
    }
});
