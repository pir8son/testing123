import type { ConfigContext, ExpoConfig } from 'expo/config';

const publicEnvEntries = Object.entries(process.env).filter(
  ([key, value]) => key.startsWith('EXPO_PUBLIC_') && value !== undefined
);

const publicEnvConfig = Object.fromEntries(publicEnvEntries);

const getPublicExtra = (extra: Record<string, unknown> | undefined) =>
  Object.fromEntries(
    Object.entries(extra ?? {}).filter(([key]) => key.startsWith('EXPO_PUBLIC_'))
  );

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: process.env.EXPO_PUBLIC_APP_NAME ?? config.name ?? 'Mobile',
  slug: process.env.EXPO_PUBLIC_APP_SLUG ?? config.slug ?? 'mobile',
  ios: {
    ...(config.ios ?? {}),
    bundleIdentifier:
      process.env.MOBILE_IOS_BUNDLE_ID ?? config.ios?.bundleIdentifier ?? 'com.example.mobile'
  },
  android: {
    ...(config.android ?? {}),
    package:
      process.env.MOBILE_ANDROID_PACKAGE ?? config.android?.package ?? 'com.example.mobile'
  },
  extra: {
    ...getPublicExtra(config.extra),
    ...publicEnvConfig
  }
});
