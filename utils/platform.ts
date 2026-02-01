export const isWeb =
  typeof window !== 'undefined' &&
  typeof document !== 'undefined' &&
  typeof document.createElement === 'function';

export const isDev =
  typeof __DEV__ !== 'undefined'
    ? __DEV__
    : typeof process !== 'undefined'
      ? process.env.NODE_ENV !== 'production'
      : true;

export const warnIfNotWeb = (feature: string) => {
  if (!isWeb && isDev) {
    console.warn(`[platform] ${feature} is unavailable outside web runtimes.`);
  }
};
