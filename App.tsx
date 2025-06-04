import React from 'react';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: '#009688', 
      justifyContent: 'center', 
      alignItems: 'center' 
    }}>
      <Text style={{ 
        color: 'white', 
        fontSize: 24, 
        fontWeight: 'bold' 
      }}>
        OpenDoors App Working! 🚪
      </Text>
    </View>
  );
}