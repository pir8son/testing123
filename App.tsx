import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('App error boundary caught an error:', error);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message ?? 'Unexpected error. Please try again.'}
          </Text>
          <Pressable style={styles.errorButton} onPress={this.handleReset}>
            <Text style={styles.errorButtonText}>Try again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <ErrorBoundary>
          <View style={styles.container}>
            <Text style={styles.title}>Sizzle is ready</Text>
            <Text style={styles.subtitle}>
              Native shell loaded. Wire your React Navigation stacks and native
              screens here.
            </Text>
            <Text style={styles.platform}>Platform: {Platform.OS}</Text>
          </View>
        </ErrorBoundary>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0f172a',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#cbd5f5',
    marginBottom: 16,
    lineHeight: 22,
  },
  platform: {
    fontSize: 14,
    color: '#94a3b8',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0f172a',
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 15,
    textAlign: 'center',
    color: '#e2e8f0',
    marginBottom: 20,
  },
  errorButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: '#38bdf8',
  },
  errorButtonText: {
    color: '#0f172a',
    fontWeight: '700',
  },
});

export default App;
