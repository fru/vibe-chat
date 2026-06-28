const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow importing from the shared workspace root if needed.
config.watchFolders = [__dirname];

module.exports = config;
