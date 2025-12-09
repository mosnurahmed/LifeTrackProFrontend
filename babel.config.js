module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: [
          '.ios.js',
          '.android.js',
          '.js',
          '.jsx',
          '.json',
          '.tsx',
          '.ts'
        ],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@features': './src/features',
          '@navigation': './src/navigation',
          '@store': './src/store',
          '@hooks': './src/hooks',
          '@utils': './src/utils',
          '@theme': './src/theme',
          '@types': './src/types',
          '@api': './src/api',
          '@assets': './src/assets'
        }
      }
    ],
    'react-native-reanimated/plugin'
  ]
};