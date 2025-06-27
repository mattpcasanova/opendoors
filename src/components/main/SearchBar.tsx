import { Search, X } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  containerStyle?: ViewStyle;
  autoFocus?: boolean;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search games by name or description',
  containerStyle,
  autoFocus = false,
}: SearchBarProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: value.length > 0 ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [value.length]);

  return (
    <View
      style={[
        styles.container,
        containerStyle,
      ]}
    >
      <View style={styles.searchContainer}>
        <Search
          size={20}
          color="#999999"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#999999"
          value={value}
          onChangeText={onChangeText}
          autoFocus={autoFocus}
          returnKeyType="search"
          clearButtonMode="never"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Search input"
          accessibilityHint="Enter text to search for games"
        />
        <Animated.View style={{ opacity: fadeAnim }}>
          {value.length > 0 && (
            <TouchableOpacity
              onPress={() => onChangeText('')}
              style={styles.clearButton}
              accessibilityLabel="Clear search"
              accessibilityHint="Clear the search text"
            >
              <X size={20} color="#999999" />
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  searchContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: Platform.OS === 'ios' ? 0 : 4,
    minHeight: Platform.OS === 'ios' ? 24 : 32,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
});
