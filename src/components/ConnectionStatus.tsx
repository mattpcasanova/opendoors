import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { testSupabaseConnection } from '../utils/supabaseHelpers';

interface ConnectionStatusProps {
  onRetry?: () => void;
}

export default function ConnectionStatus({ onRetry }: ConnectionStatusProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    const connected = await testSupabaseConnection();
    setIsConnected(connected);
    setIsChecking(false);
  };

  useEffect(() => {
    checkConnection();
  }, []);

  if (isConnected === null || isChecking) {
    return (
      <View style={[styles.container, styles.checking]}>
        <Text style={styles.text}>🔄 Checking connection...</Text>
      </View>
    );
  }

  if (!isConnected) {
    return (
      <TouchableOpacity 
        style={[styles.container, styles.error]} 
        onPress={() => {
          checkConnection();
          onRetry?.();
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.text}>❌ Connection failed - Tap to retry</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, styles.success]}>
      <Text style={styles.text}>✅ Connected</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  checking: {
    backgroundColor: '#FEF3C7',
  },
  error: {
    backgroundColor: '#FEE2E2',
  },
  success: {
    backgroundColor: '#D1FAE5',
  },
  text: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
});
