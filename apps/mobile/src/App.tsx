import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { isAndroid, isIOS, isNative, isWeb } from '@swipe-to-recipe/shared';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.card}>
        <Text style={styles.title}>Swipe to Recipe</Text>
        <Text style={styles.subtitle}>Expo + Hermes ready</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Platform</Text>
        <Text style={styles.value}>isNative: {String(isNative)}</Text>
        <Text style={styles.value}>isIOS: {String(isIOS)}</Text>
        <Text style={styles.value}>isAndroid: {String(isAndroid)}</Text>
        <Text style={styles.value}>isWeb: {String(isWeb)}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 24,
    gap: 16,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f8fafc',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#cbd5f5',
  },
  label: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#94a3b8',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: '#e2e8f0',
    marginBottom: 4,
  },
});

export default App;
