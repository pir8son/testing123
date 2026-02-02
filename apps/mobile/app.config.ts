import type { ConfigContext, ExpoConfig } from 'expo/config';

const publicEnvEntries = Object.entries(process.env).filter(
  ([key, value]) => key.startsWith('EXPO_PUBLIC_') && value !== undefined
);

const publicEnvConfig = Object.fromEntries(publicEnvEntries);

const getPublicExtra = (extra: Record<string, unknown> | undefined) =>
  Object.fromEntries(
    Object.entries(extra ?? {}).filter(([key]) => key.startsWith('EXPO_PUBLIC_'))
  );

export default (ctx: ConfigContext): ExpoConfig => {
  const baseConfig = ctx.config;

  return {
    ...baseConfig,
    name: process.env.EXPO_PUBLIC_APP_NAME ?? baseConfig.name ?? 'Mobile',
    slug: process.env.EXPO_PUBLIC_APP_SLUG ?? baseConfig.slug ?? 'mobile',
    ios: {
      ...(baseConfig.ios ?? {}),
      bundleIdentifier:
        process.env.MOBILE_IOS_BUNDLE_ID ??
        baseConfig.ios?.bundleIdentifier ??
        'com.example.mobile'
    },
    android: {
      ...(baseConfig.android ?? {}),
      package:
        process.env.MOBILE_ANDROID_PACKAGE ??
        baseConfig.android?.package ??
        'com.example.mobile'
    },
    extra: {
      ...getPublicExtra(baseConfig.extra),
      ...publicEnvConfig
    }
  };
};
