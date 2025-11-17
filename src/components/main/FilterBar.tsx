/**
 * FilterBar Component
 * Enhanced category filter with icons, animations, and count badges
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  ScrollView,
  Text,
  View,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { Coffee, Dumbbell, Film, ShoppingBag, Sparkles, UtensilsCrossed, Package } from 'lucide-react-native';
import { TouchableScale } from '../ui';
import { Colors, Spacing, BorderRadius } from '../../constants';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FilterBarProps {
  /** List of all available categories */
  categories: string[];
  /** Categories that are currently excluded (hidden) */
  excludedCategories: string[];
  /** Callback when excluded categories change */
  onExcludedCategoriesChange: (excluded: string[]) => void;
  /** User's preferred categories (for emphasis) */
  userPreferenceCategories?: string[];
  /** Show only favorites toggle */
  showOnlyFavorites?: boolean;
  /** Callback for favorites toggle */
  onFavoritesToggle?: () => void;
  /** Count of games per category (optional) */
  categoryCounts?: Record<string, number>;
  /** Distance filter options */
  distanceOptions?: string[];
  /** Currently selected distance */
  selectedDistance?: string | null;
  /** Callback for distance change */
  onDistanceChange?: (distance: string) => void;
  /** Sort options */
  sortOptions?: string[];
  /** Currently selected sort */
  selectedSort?: string | null;
  /** Callback for sort change */
  onSortChange?: (sort: string) => void;
}

// Category icon mapping
const getCategoryIcon = (category: string): React.ComponentType<any> => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    'Food': UtensilsCrossed,
    'Drinks': Coffee,
    'Activities': Dumbbell,
    'Wellness': Sparkles,
    'Retail': ShoppingBag,
    'Entertainment': Film,
    'Other': Package,
  };
  return iconMap[category] || Package;
};

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  excludedCategories,
  onExcludedCategoriesChange,
  userPreferenceCategories = [],
  showOnlyFavorites = false,
  onFavoritesToggle,
  categoryCounts = {},
  distanceOptions = [],
  selectedDistance = null,
  onDistanceChange,
  sortOptions = [],
  selectedSort = null,
  onSortChange,
}) => {
  const handleCategoryToggle = (category: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    if (excludedCategories.includes(category)) {
      // Remove from excluded (show it)
      onExcludedCategoriesChange(excludedCategories.filter(c => c !== category));
    } else {
      // Add to excluded (hide it)
      onExcludedCategoriesChange([...excludedCategories, category]);
    }
  };

  return (
    <View style={{
      backgroundColor: Colors.white,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.lg,
      borderWidth: 1,
      borderColor: Colors.gray200,
    }}>
      {/* Section Label */}
      <Text style={{
        fontSize: 12,
        fontWeight: '700',
        color: Colors.gray500,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: Spacing.sm,
        marginLeft: Spacing.xs,
      }}>
        Categories
      </Text>

      {/* Row 1: Favorites toggle + Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: Spacing.md }}
        contentContainerStyle={{ paddingHorizontal: Spacing.xs }}
      >
        {/* Favorites toggle chip */}
        {onFavoritesToggle && (
          <TouchableScale
            onPress={onFavoritesToggle}
            scaleValue={0.95}
            style={{ marginRight: Spacing.sm }}
          >
            <View style={{
              backgroundColor: showOnlyFavorites ? Colors.primary : Colors.white,
              paddingHorizontal: Spacing.md,
              paddingVertical: Spacing.sm,
              borderRadius: BorderRadius.md,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: showOnlyFavorites ? Colors.primary : Colors.gray300,
            }}>
              <Ionicons
                name={showOnlyFavorites ? 'star' : 'star-outline'}
                size={16}
                color={showOnlyFavorites ? Colors.white : Colors.gray600}
                style={{ marginRight: 6 }}
              />
              <Text style={{
                color: showOnlyFavorites ? Colors.white : Colors.gray800,
                fontWeight: '600',
                fontSize: 14,
              }}>
                Favorites
              </Text>
            </View>
          </TouchableScale>
        )}

        {/* Category chips */}
        {categories.map(cat => {
          const isExcluded = excludedCategories.includes(cat);
          const isUserPreference = userPreferenceCategories.includes(cat);
          const count = categoryCounts[cat] || 0;
          const IconComponent = getCategoryIcon(cat);

          return (
            <CategoryChip
              key={cat}
              category={cat}
              isExcluded={isExcluded}
              isUserPreference={isUserPreference}
              count={count}
              IconComponent={IconComponent}
              onPress={() => handleCategoryToggle(cat)}
            />
          );
        })}
      </ScrollView>

      {/* Row 2: Distance filter */}
      {distanceOptions.length > 0 && selectedDistance !== null && (
        <>
          <Text style={{
            fontSize: 12,
            fontWeight: '700',
            color: Colors.gray500,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: Spacing.sm,
            marginLeft: Spacing.xs,
          }}>
            Distance
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: Spacing.md }}
            contentContainerStyle={{ paddingHorizontal: Spacing.xs }}
          >
            {distanceOptions.map(opt => {
              const isSelected = selectedDistance === opt;
              return (
                <TouchableScale
                  key={opt}
                  onPress={() => onDistanceChange?.(opt)}
                  scaleValue={0.95}
                  style={{ marginRight: Spacing.sm }}
                >
                  <View style={{
                    backgroundColor: isSelected ? Colors.primary : Colors.white,
                    paddingHorizontal: Spacing.md,
                    paddingVertical: Spacing.sm,
                    borderRadius: BorderRadius.md,
                    borderWidth: 2,
                    borderColor: isSelected ? Colors.primary : Colors.gray300,
                  }}>
                    <Text style={{
                      color: isSelected ? Colors.white : Colors.gray800,
                      fontWeight: '600',
                      fontSize: 14,
                    }}>
                      {opt}
                    </Text>
                  </View>
                </TouchableScale>
              );
            })}
          </ScrollView>
        </>
      )}

      {/* Row 3: Sort options */}
      {sortOptions.length > 0 && selectedSort !== null && (
        <>
          <Text style={{
            fontSize: 12,
            fontWeight: '700',
            color: Colors.gray500,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: Spacing.sm,
            marginLeft: Spacing.xs,
          }}>
            Sort By
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: Spacing.xs }}
          >
            {sortOptions.map(opt => {
              const isSelected = selectedSort === opt;
              return (
                <TouchableScale
                  key={opt}
                  onPress={() => onSortChange?.(opt)}
                  scaleValue={0.95}
                  style={{ marginRight: Spacing.sm }}
                >
                  <View style={{
                    backgroundColor: isSelected ? Colors.primary : Colors.white,
                    paddingHorizontal: Spacing.md,
                    paddingVertical: Spacing.sm,
                    borderRadius: BorderRadius.md,
                    borderWidth: 2,
                    borderColor: isSelected ? Colors.primary : Colors.gray300,
                  }}>
                    <Text style={{
                      color: isSelected ? Colors.white : Colors.gray800,
                      fontWeight: '600',
                      fontSize: 14,
                    }}>
                      {opt}
                    </Text>
                  </View>
                </TouchableScale>
              );
            })}
          </ScrollView>
        </>
      )}
    </View>
  );
};

/** Individual Category Chip Component with animation */
interface CategoryChipProps {
  category: string;
  isExcluded: boolean;
  isUserPreference: boolean;
  count: number;
  IconComponent: React.ComponentType<any>;
  onPress: () => void;
}

const CategoryChip: React.FC<CategoryChipProps> = ({
  category,
  isExcluded,
  isUserPreference,
  count,
  IconComponent,
  onPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isExcluded) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.5,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isExcluded]);

  // Get colors based on state
  const getColors = () => {
    if (isExcluded) {
      return {
        bg: Colors.gray100,
        border: Colors.gray300,
        text: Colors.gray500,
        icon: Colors.gray400,
        badge: Colors.gray400,
      };
    }
    if (isUserPreference) {
      return {
        bg: Colors.white,
        border: Colors.success,
        text: Colors.gray900,
        icon: Colors.success,
        badge: Colors.success,
      };
    }
    return {
      bg: Colors.white,
      border: Colors.gray300,
      text: Colors.gray900,
      icon: Colors.gray600,
      badge: Colors.primary,
    };
  };

  const colors = getColors();

  return (
    <TouchableScale
      onPress={onPress}
      scaleValue={0.95}
      style={{ marginRight: Spacing.sm }}
    >
      <Animated.View style={{
        backgroundColor: colors.bg,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.border,
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }}>
        {/* Category icon */}
        <IconComponent size={16} color={colors.icon} style={{ marginRight: 6 }} />

        {/* User preference star */}
        {isUserPreference && !isExcluded && (
          <Ionicons
            name="star"
            size={12}
            color={colors.icon}
            style={{ marginRight: 4 }}
          />
        )}

        {/* Category name */}
        <Text style={{
          color: colors.text,
          fontWeight: isUserPreference ? '700' : '600',
          fontSize: 14,
          textDecorationLine: isExcluded ? 'line-through' : 'none',
          marginRight: count > 0 ? 6 : 0,
        }}>
          {category}
        </Text>

        {/* Count badge */}
        {count > 0 && !isExcluded && (
          <View style={{
            backgroundColor: colors.badge,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: BorderRadius.sm,
            minWidth: 20,
            alignItems: 'center',
          }}>
            <Text style={{
              color: Colors.white,
              fontSize: 11,
              fontWeight: '700',
            }}>
              {count}
            </Text>
          </View>
        )}
      </Animated.View>
    </TouchableScale>
  );
};
