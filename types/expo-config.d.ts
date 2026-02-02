declare module 'expo/config' {
  export interface ExpoConfig {
    name?: string;
    slug?: string;
    ios?: {
      bundleIdentifier?: string;
    };
    android?: {
      package?: string;
    };
    extra?: Record<string, unknown>;
  }

  export interface ConfigContext {
    config: ExpoConfig;
  }
}
