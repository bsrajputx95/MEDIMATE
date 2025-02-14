module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Enable tree shaking for lodash
      'lodash',
      // Transform optional chaining and nullish coalescing
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-nullish-coalescing-operator',
      // Remove prop-types in production
      process.env.NODE_ENV === 'production' ? 'transform-react-remove-prop-types' : null,
      // Optimize React imports
      [
        'module-resolver',
        {
          alias: {
            '@': './',
            '@components': './components',
            '@hooks': './hooks',
            '@lib': './lib',
            '@contexts': './contexts',
            '@constants': './constants',
            '@utils': './utils',
            '@types': './types',
          },
        },
      ],
    ].filter(Boolean),
  };
};
