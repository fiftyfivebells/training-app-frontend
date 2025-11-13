module.exports = function (api) {
  console.log("Babel config loaded");
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@domains': './src/domains',
            '@lib': './src/lib',
            '@theme': './src/theme',
          },
        },
      ],
    ],
  };
};