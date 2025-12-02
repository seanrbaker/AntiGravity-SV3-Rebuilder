const path = require('path');
const fs = require('fs');
const { downloadFile, getLatestVersionUrl } = require('./download');
const { extractZip, findAppAsar } = require('./extract');
const { buildApp } = require('./build');

// const URL = 'https://dl.dod.cyber.mil/wp-content/uploads/stigs/zip/U_STIGViewer-linux_x64-3-6-0.zip';
const WORK_DIR = path.join(__dirname, '../work');
const DOWNLOAD_PATH = path.join(WORK_DIR, 'stig-viewer.zip');
const EXTRACT_DIR = path.join(WORK_DIR, 'extracted');
const BUILD_DIR = path.join(__dirname, '../out');

async function main() {
    if (!fs.existsSync(WORK_DIR)) fs.mkdirSync(WORK_DIR, { recursive: true });
    if (!fs.existsSync(BUILD_DIR)) fs.mkdirSync(BUILD_DIR, { recursive: true });

    console.log('Downloading...');
    if (!fs.existsSync(DOWNLOAD_PATH)) {
        const url = await getLatestVersionUrl();
        await downloadFile(url, DOWNLOAD_PATH);
    } else {
        console.log('File already downloaded.');
    }

    console.log('Extracting...');
    extractZip(DOWNLOAD_PATH, EXTRACT_DIR);

    console.log('Locating app.asar...');
    const asarPath = findAppAsar(EXTRACT_DIR);
    if (!asarPath) {
        throw new Error('Could not find app.asar in extracted files');
    }
    console.log(`Found asar at: ${asarPath}`);

    console.log('Building for MacOS...');
    await buildApp(asarPath, BUILD_DIR);

    console.log('Done!');
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
