declare module 'react-native' {
  export const Platform: {
    OS: 'ios' | 'android' | 'web' | string;
  };
  export const StyleSheet: {
    create: (styles: Record<string, unknown>) => Record<string, unknown>;
  };
  export const Text: any;
  export const View: any;
}
