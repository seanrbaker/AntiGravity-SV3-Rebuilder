const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');

function extractZip(zipPath, destDir) {
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(destDir, true);
}

function findAppAsar(startDir) {
    if (!fs.existsSync(startDir)) {
        return null;
    }

    const files = fs.readdirSync(startDir);
    for (const file of files) {
        const filePath = path.join(startDir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            const result = findAppAsar(filePath);
            if (result) return result;
        } else if (file === 'app.asar') {
            return filePath;
        }
    }
    return null;
}

module.exports = { extractZip, findAppAsar };
