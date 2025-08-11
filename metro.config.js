const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

module.exports = (async () => {
  const defaultConfig = await getDefaultConfig(__dirname);

  return mergeConfig(defaultConfig, {
    resolver: {
      extraNodeModules: {
        ...defaultConfig.resolver.extraNodeModules,
        'react-dom': require.resolve('react-native-web/dist/exports/View'),
      },
    },
  });
})();
