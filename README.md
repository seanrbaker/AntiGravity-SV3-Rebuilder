# STIG Viewer MacOS Rebuilder

This tool downloads the official Linux STIG Viewer from DISA, extracts the core application, and rebuilds it as a native MacOS Electron app.

## Prerequisites

*   Node.js (v18 or later)
*   macOS (Intel or Apple Silicon)

## Usage

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the builder:**
    ```bash
    npm start
    ```

3.  **Locate the Application:**
    The application will be created in `out/STIG Viewer 3-darwin-x64/STIG Viewer 3.app`.

## Signing and Notarization

To sign and notarize the application for distribution, set the following environment variables before running `npm start`. This uses Apple's `notarytool`.

*   `OSX_SIGN_IDENTITY`: The name of your Developer ID Application certificate (e.g., "Developer ID Application: John Doe (TEAMID)").
*   `OSX_NOTARIZE_APPLE_ID`: Your Apple ID email.
*   `OSX_NOTARIZE_APPLE_ID_PASSWORD`: An app-specific password (generated at appleid.apple.com).
*   `OSX_NOTARIZE_TEAM_ID`: Your Apple Team ID.

**Example:**

```bash
export OSX_SIGN_IDENTITY="Developer ID Application: My Org (ABC12345)"
export OSX_NOTARIZE_APPLE_ID="admin@myorg.com"
export OSX_NOTARIZE_APPLE_ID_PASSWORD="abcd-efgh-ijkl-mnop"
export OSX_NOTARIZE_TEAM_ID="ABC12345"

npm start
```

## Architecture Notes

*   **Target Architecture**: x64 (Intel)
*   **Apple Silicon Support**: Runs via Rosetta 2.
*   **Why not native ARM?**: The source Linux distribution only includes x64 native binaries for `sqlite3`. Rebuilding for native ARM would require manually compiling dependencies, which is outside the scope of this rebuilder tool.

## Troubleshooting

*   **"Unidentified Developer" Warning**: If you build without signing, you may need to Right-Click > Open the app to bypass the security warning.
*   **"Initializing App State" Hang**: This usually means the native modules (`sqlite3`) were not correctly copied. The build script handles this automatically by copying `app.asar.unpacked`.
*   **Signing Errors**: Ensure your environment variables are correct and you have a valid Developer ID Application certificate in your Keychain.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**DISCLAIMER: USE AT YOUR OWN RISK.**

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

