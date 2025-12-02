const packager = require('electron-packager');
const path = require('path');
const fs = require('fs');
const asar = require('asar');
const { signAsync } = require('@electron/osx-sign');
const { notarize } = require('@electron/notarize');

async function buildApp(asarPath, outputDir) {
    console.log('Reading package.json from asar...');
    const packageJsonContent = asar.extractFile(asarPath, 'package.json');
    const packageJson = JSON.parse(packageJsonContent.toString());

    const stagingDir = path.join(outputDir, 'staging');
    if (!fs.existsSync(stagingDir)) {
        fs.mkdirSync(stagingDir, { recursive: true });
    }

    // Write the package.json to staging
    fs.writeFileSync(path.join(stagingDir, 'package.json'), JSON.stringify(packageJson, null, 2));

    // Create a dummy main file if it doesn't exist, just to satisfy packager
    // The packager needs the entry point to exist in the source dir
    const mainFile = packageJson.main || 'index.js';
    const mainPath = path.join(stagingDir, mainFile);
    const mainDir = path.dirname(mainPath);
    if (!fs.existsSync(mainDir)) fs.mkdirSync(mainDir, { recursive: true });
    fs.writeFileSync(mainPath, '// Dummy file');

    console.log('Running electron-packager...');
    const packagerOptions = {
        dir: stagingDir,
        out: outputDir,
        name: packageJson.productName || 'STIG Viewer 3',
        platform: 'darwin',
        arch: 'x64',
        overwrite: true,
        asar: true, // We will replace this anyway
        prune: true,
    };

    const appPaths = await packager(packagerOptions);

    const appPath = appPaths[0];
    console.log(`App packaged to: ${appPath}`);

    // Now replace the app.asar
    const appBundleName = fs.readdirSync(appPath).find(f => f.endsWith('.app'));
    const appBundlePath = path.join(appPath, appBundleName);
    const finalResourceDir = path.join(appBundlePath, 'Contents', 'Resources');

    const targetAsarPath = path.join(finalResourceDir, 'app.asar');

    console.log(`Replacing ${targetAsarPath} with original asar...`);
    fs.copyFileSync(asarPath, targetAsarPath);

    const unpackedPath = asarPath + '.unpacked';
    if (fs.existsSync(unpackedPath)) {
        const targetUnpackedPath = targetAsarPath + '.unpacked';
        console.log(`Copying unpacked resources to ${targetUnpackedPath}...`);
        fs.cpSync(unpackedPath, targetUnpackedPath, { recursive: true });
    }

    // Manual Signing
    if (process.env.OSX_SIGN_IDENTITY) {
        console.log(`Signing app at ${appBundlePath} with identity: ${process.env.OSX_SIGN_IDENTITY}`);
        const signOptions = {
            app: appBundlePath,
            identity: process.env.OSX_SIGN_IDENTITY,
            hardenedRuntime: true,
            gatekeeperAssess: false,
            entitlements: path.join(__dirname, '../entitlements.plist'),
            entitlementsInherit: path.join(__dirname, '../entitlements.plist'),
            platform: 'darwin',
            version: packageJson.version
        };

        if (!fs.existsSync(signOptions.entitlements)) {
            console.error(`Entitlements file missing at: ${signOptions.entitlements}`);
        }

        await signAsync(signOptions);
        console.log('Signing complete.');
    } else {
        console.log('No OSX_SIGN_IDENTITY provided, skipping signing.');
    }

    // Manual Notarization
    if (process.env.OSX_NOTARIZE_APPLE_ID && process.env.OSX_NOTARIZE_APPLE_ID_PASSWORD && process.env.OSX_NOTARIZE_TEAM_ID) {
        console.log('Notarization credentials provided, notarizing...');
        await notarize({
            tool: 'notarytool',
            appPath: appBundlePath,
            appleId: process.env.OSX_NOTARIZE_APPLE_ID,
            appleIdPassword: process.env.OSX_NOTARIZE_APPLE_ID_PASSWORD,
            teamId: process.env.OSX_NOTARIZE_TEAM_ID,
        });
        console.log('Notarization complete.');
    } else {
        console.log('Missing notarization credentials, skipping notarization.');
    }

    console.log('Build complete.');
    return appPath;
}

module.exports = { buildApp };
