const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');
const defaultSourceExts = require('metro-config/src/defaults/defaults').sourceExts;
const defaultAssetExts = require('metro-config/src/defaults/defaults').assetExts;
const workspaceRoot = path.resolve(__dirname, '../..');
const projectRoot = __dirname;
/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */

const config = mergeConfig(getDefaultConfig(__dirname), {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    assetExts: defaultAssetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...defaultSourceExts, 'svg'],
  },
});

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
