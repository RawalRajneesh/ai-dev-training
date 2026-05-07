const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

/**
 * Merge StreamList/.env into process.env so Babel (react-native-dotenv) can pick
 * values on the final merge pass. Also warn when the token line is empty on disk
 * (common when the file is open in an editor but not saved).
 */
function applyStreamListDotenv() {
  const envPath = path.join(__dirname, '.env');
  try {
    const parsed = dotenv.parse(fs.readFileSync(envPath));
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'string' && value.length > 0) {
        process.env[key] = value;
      }
    }
    const token = (parsed.TMDB_ACCESS_TOKEN ?? '').trim();
    if (!token) {
      console.warn(
        '\n\x1b[33m[StreamList]\x1b[0m TMDB_ACCESS_TOKEN is empty in .env on disk at:\n' +
          `  ${envPath}\n` +
          '  Metro reads the saved file only — save the file, then restart with:\n' +
          '  npx react-native start --reset-cache\n',
      );
    }
  } catch {
    // .env missing is OK for some workflows; react-native-dotenv will still try.
  }
}

applyStreamListDotenv();

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
