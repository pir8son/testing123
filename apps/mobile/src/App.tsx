import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { platformLabel } from '@repo/shared';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expo Mobile Boot Check</Text>
      <Text style={styles.label}>Platform: {platformLabel}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B0B10'
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8
  },
  label: {
    fontSize: 16,
    color: '#A1A1AA'
  }
});
