const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Support Skia's wasm file on web (no-op for native builds)
config.resolver.assetExts.push('wasm');

module.exports = config;
