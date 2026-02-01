import type { ExpoConfig } from 'expo/config';
import appJson from './app.json';

const baseConfig = appJson.expo ?? {};

const config: ExpoConfig = {
  ...baseConfig,
  name: process.env.EXPO_PUBLIC_APP_NAME ?? baseConfig.name ?? 'Mobile',
  slug: process.env.EXPO_PUBLIC_APP_SLUG ?? baseConfig.slug ?? 'mobile',
  ios: {
    ...baseConfig.ios,
    bundleIdentifier:
      process.env.MOBILE_IOS_BUNDLE_ID ?? baseConfig.ios?.bundleIdentifier ?? 'com.example.mobile'
  },
  android: {
    ...baseConfig.android,
    package:
      process.env.MOBILE_ANDROID_PACKAGE ?? baseConfig.android?.package ?? 'com.example.mobile'
  }
};

export default config;
