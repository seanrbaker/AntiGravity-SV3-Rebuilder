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

module.exports = { downloadFile };
