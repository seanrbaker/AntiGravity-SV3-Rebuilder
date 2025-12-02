const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function downloadFile(url, destPath) {
  const writer = fs.createWriteStream(destPath);

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function getLatestVersionUrl(baseUrl = 'https://dl.dod.cyber.mil/wp-content/uploads/stigs/zip/U_STIGViewer-linux_x64-') {
  let major = 3;
  let minor = 6;
  let patch = 0;
  let latestUrl = `${baseUrl}${major}-${minor}-${patch}.zip`;

  console.log(`Checking for newer versions starting from ${major}.${minor}.${patch}...`);

  while (true) {
    // Check next patch version
    const nextPatchUrl = `${baseUrl}${major}-${minor}-${patch + 1}.zip`;
    // Check next minor version
    const nextMinorUrl = `${baseUrl}${major}-${minor + 1}-0.zip`;

    try {
      // Try next patch first
      await axios.head(nextPatchUrl);
      patch++;
      latestUrl = nextPatchUrl;
      console.log(`Found newer version: ${major}.${minor}.${patch}`);
      continue;
    } catch (e) {
      // If patch fails, try minor
      try {
        await axios.head(nextMinorUrl);
        minor++;
        patch = 0;
        latestUrl = nextMinorUrl;
        console.log(`Found newer version: ${major}.${minor}.${patch}`);
        continue;
      } catch (e2) {
        // Both failed, we have the latest
        break;
      }
    }
  }

  console.log(`Latest version found: ${major}.${minor}.${patch}`);
  return latestUrl;
}

module.exports = { downloadFile, getLatestVersionUrl };
