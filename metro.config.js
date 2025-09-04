const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for web platform
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Fix for synthetic event errors
config.transformer.minifierConfig = {
  ...config.transformer.minifierConfig,
  mangle: {
    ...config.transformer.minifierConfig?.mangle,
    keep_fnames: true,
  },
};

module.exports = config; 