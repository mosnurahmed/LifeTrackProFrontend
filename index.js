/**
 * @format
 **/

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

// Disable yellow box warnings in development
if (__DEV__) {
  const ignoreWarns = [
    'ViewPropTypes will be removed',
    'ColorPropType will be removed'
  ];

  const warn = console.warn;
  console.warn = (...arg) => {
    for (const warning of ignoreWarns) {
      if (arg[0]?.startsWith(warning)) {
        return;
      }
    }
    warn(...arg);
  };
}

AppRegistry.registerComponent(appName, () => App);
