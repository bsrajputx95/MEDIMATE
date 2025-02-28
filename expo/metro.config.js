const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Optimize bundle size
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json'];

// Enable minification and tree shaking
config.transformer.minifierConfig = {
  compress: {
    // Remove console logs in production
    drop_console: true,
    // Remove debugger statements
    drop_debugger: true,
    // Remove dead code
    dead_code: true,
    // Inline functions
    inline: 2,
    // Optimize conditions
    conditionals: true,
    // Evaluate constants
    evaluate: true,
    // Remove unused variables
    unused: true,
    // Collapse variable declarations
    collapse_vars: true,
    // Optimize loops
    loops: true,
    // Optimize if/return
    if_return: true,
    // Join consecutive statements
    join_vars: true,
    // Optimize properties
    properties: true,
  },
};

// Alias for shorter imports
config.resolver.alias = {
  '@': './',
  '@components': './components',
  '@hooks': './hooks',
  '@lib': './lib',
  '@contexts': './contexts',
  '@constants': './constants',
  '@utils': './utils',
  '@types': './types',
};

module.exports = config;
