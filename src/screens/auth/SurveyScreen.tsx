import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  Star,
  UtensilsCrossed,
  ShoppingBag,
  Coffee,
  Film,
  Dumbbell,
  Sparkles,
  Footprints,
  Car,
  Plane,
  MapPin,
  Shield,
  Scale,
  Target,
  Gift,
  Percent,
  Repeat,
  Crown,
  Zap,
  Volume2,
  MessageCircle,
  Lock,
  Smartphone,
  Users,
  Search,
  Tv,
  HelpCircle
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  PanResponder
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase/client';
import { pushNotificationService } from '../../services/pushNotificationService';
import { userPreferencesService } from '../../services/userPreferencesService';
import { RootStackParamList } from '../../types/navigation';

const { width, height } = Dimensions.get('window');

type SurveyScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Survey'>;

// Icon component helper
const IconComponent = ({ name, size = 24, color = Colors.primary }: { name: string; size?: number; color?: string }) => {
  const iconProps = { size, color };

  switch (name) {
    case 'UtensilsCrossed': return <UtensilsCrossed {...iconProps} />;
    case 'ShoppingBag': return <ShoppingBag {...iconProps} />;
    case 'Coffee': return <Coffee {...iconProps} />;
    case 'Film': return <Film {...iconProps} />;
    case 'Dumbbell': return <Dumbbell {...iconProps} />;
    case 'Sparkles': return <Sparkles {...iconProps} />;
    case 'Footprints': return <Footprints {...iconProps} />;
    case 'Car': return <Car {...iconProps} />;
    case 'MapPin': return <MapPin {...iconProps} />;
    case 'Plane': return <Plane {...iconProps} />;
    case 'Shield': return <Shield {...iconProps} />;
    case 'Scale': return <Scale {...iconProps} />;
    case 'Target': return <Target {...iconProps} />;
    case 'Gift': return <Gift {...iconProps} />;
    case 'Percent': return <Percent {...iconProps} />;
    case 'Repeat': return <Repeat {...iconProps} />;
    case 'Crown': return <Crown {...iconProps} />;
    case 'Zap': return <Zap {...iconProps} />;
    case 'Volume2': return <Volume2 {...iconProps} />;
    case 'MessageCircle': return <MessageCircle {...iconProps} />;
    case 'Lock': return <Lock {...iconProps} />;
    case 'Smartphone': return <Smartphone {...iconProps} />;
    case 'Users': return <Users {...iconProps} />;
    case 'Search': return <Search {...iconProps} />;
    case 'Tv': return <Tv {...iconProps} />;
    case 'HelpCircle': return <HelpCircle {...iconProps} />;
    default: return <HelpCircle {...iconProps} />;
  }
};

export default function SurveyScreen({ onComplete }: { onComplete: () => void }) {
  const navigation = useNavigation<SurveyScreenNavigationProp>();
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [distance, setDistance] = useState('');
  const [rewardStyle, setRewardStyle] = useState('');
  const [rewardTypes, setRewardTypes] = useState<string[]>([]);
  const [socialSharing, setSocialSharing] = useState('');
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [discovery, setDiscovery] = useState('');
  const [loading, setLoading] = useState(false);

  const totalSlides = 7;
  const progressPercentage = (currentSlide / totalSlides) * 100;

  // Request location and push notification permissions
  const requestInitialPermissions = async () => {
    if (!user?.id) return;

    try {
      // Request location permission
      const locationStatus = await Location.getForegroundPermissionsAsync();
      if (locationStatus.status !== 'granted') {
        const { status: newLocationStatus } = await Location.requestForegroundPermissionsAsync();
        if (newLocationStatus === 'granted') {
          // Update user settings
          await supabase.from('user_settings').upsert(
            { user_id: user.id, location_enabled: true },
            { onConflict: 'user_id' }
          );
        }
      }

      // Request push notification permission
      const notificationStatus = await Notifications.getPermissionsAsync();
      if (notificationStatus.status !== 'granted') {
        const { status: newNotificationStatus } = await Notifications.requestPermissionsAsync();
        if (newNotificationStatus === 'granted') {
          // Update user settings and register for push
          await supabase.from('user_settings').upsert(
            { user_id: user.id, notifications_enabled: true },
            { onConflict: 'user_id' }
          );
          // Register for push notifications
          await pushNotificationService.registerForPushNotifications(user.id);
        }
      } else {
        // Already granted, just register
        await supabase.from('user_settings').upsert(
          { user_id: user.id, notifications_enabled: true },
          { onConflict: 'user_id' }
        );
        await pushNotificationService.registerForPushNotifications(user.id);
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      // Don't block survey completion if permissions fail
    }
  };

  const categories = [
    { key: 'food', label: 'Food & Dining', icon: 'UtensilsCrossed', color: 'from-orange-400 to-red-500' },
    { key: 'shopping', label: 'Shopping', icon: 'ShoppingBag', color: 'from-pink-400 to-purple-500' },
    { key: 'coffee', label: 'Coffee & Drinks', icon: 'Coffee', color: 'from-amber-400 to-orange-500' },
    { key: 'entertainment', label: 'Entertainment', icon: 'Film', color: 'from-blue-400 to-indigo-500' },
    { key: 'fitness', label: 'Fitness & Health', icon: 'Dumbbell', color: 'from-green-400 to-emerald-500' },
    { key: 'beauty', label: 'Beauty & Wellness', icon: 'Sparkles', color: 'from-rose-400 to-pink-500' },
  ];

  const distanceOptions = [
    { value: 'Within 5 miles', icon: 'Footprints', description: 'Walking distance' },
    { value: 'Between 5-10 miles', icon: 'Car', description: 'Short drive' },
    { value: 'Between 10-25 miles', icon: 'MapPin', description: 'Longer trip' },
    { value: 'Any distance', icon: 'Plane', description: 'Worth the journey' },
  ];

  const rewardStyleOptions = [
    {
      value: 'Safer bets with smaller rewards',
      icon: 'Shield',
      description: 'Consistent wins, lower risk',
      color: 'from-green-400 to-emerald-500',
    },
    {
      value: 'Something in the middle',
      icon: 'Scale',
      description: 'Balanced approach',
      color: 'from-blue-400 to-indigo-500',
    },
    {
      value: 'High-risk/high-reward',
      icon: 'Target',
      description: 'Big wins, higher stakes',
      color: 'from-purple-400 to-pink-500',
    },
  ];

  const rewardTypeOptions = [
    { value: 'Free items', icon: 'Gift' },
    { value: 'Percentage discounts', icon: 'Percent' },
    { value: 'BOGO offers', icon: 'Repeat' },
    { value: 'Exclusive experiences', icon: 'Crown' },
    { value: 'Early access deals', icon: 'Zap' },
  ];

  const socialOptions = [
    { value: "Yes, I'd love to share", icon: 'Volume2', description: 'Share the excitement!' },
    { value: 'Maybe occasionally', icon: 'MessageCircle', description: 'Sometimes' },
    { value: 'Prefer to keep private', icon: 'Lock', description: 'Just for me' },
  ];

  const ratingCategories = [
    'Quick meals & snacks',
    'Sit-down dining experiences',
    'Retail shopping deals',
    'Tech & electronics',
    'Local services (spa, salon, etc.)',
    'Experiences & activities',
  ];

  const discoveryOptions = [
    { value: 'Social media', icon: 'Smartphone' },
    { value: 'Friend or family', icon: 'Users' },
    { value: 'App store browsing', icon: 'Smartphone' },
    { value: 'Online search', icon: 'Search' },
    { value: 'Advertisement', icon: 'Tv' },
    { value: 'Other', icon: 'HelpCircle' },
  ];

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  };

  const handleRewardTypeToggle = (type: string) => {
    setRewardTypes((prev) => {
      if (prev.includes(type)) {
        // Remove the item - all items below move up
        return prev.filter((t) => t !== type);
      } else {
        // Add to the end of the list
        return [...prev, type];
      }
    });
  };

  const moveRewardType = (type: string, direction: 'up' | 'down') => {
    const currentIndex = rewardTypes.indexOf(type);
    if (direction === 'up' && currentIndex > 0) {
      const newOrder = [...rewardTypes];
      [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
      setRewardTypes(newOrder);
    } else if (direction === 'down' && currentIndex < rewardTypes.length - 1) {
      const newOrder = [...rewardTypes];
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
      setRewardTypes(newOrder);
    }
  };

  const moveRewardTypeToPosition = (type: string, newPosition: number) => {
    const currentIndex = rewardTypes.indexOf(type);
    if (currentIndex === -1 || currentIndex === newPosition) return;

    const newOrder = [...rewardTypes];
    // Remove from current position
    const [item] = newOrder.splice(currentIndex, 1);
    // Insert at new position
    newOrder.splice(newPosition, 0, item);
    setRewardTypes(newOrder);
  };

  const nextSlide = () => {
    if (currentSlide < totalSlides) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 1) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleComplete = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not found. Please try again.');
      return;
    }

    // Validate required fields
    if (selectedCategories.length === 0) {
      Alert.alert('Error', 'Please select at least one category of interest.');
      return;
    }

    if (!distance) {
      Alert.alert('Error', 'Please select a distance preference.');
      return;
    }

    if (!rewardStyle) {
      Alert.alert('Error', 'Please select a reward style preference.');
      return;
    }

    if (rewardTypes.length === 0) {
      Alert.alert('Error', 'Please select at least one reward type.');
      return;
    }

    if (!socialSharing) {
      Alert.alert('Error', 'Please select a social sharing preference.');
      return;
    }

    if (!discovery) {
      Alert.alert('Error', 'Please select how you discovered Open Doors.');
      return;
    }

    setLoading(true);

    try {
      // Save preferences (categories as booleans, distance_preference)
      const categoryPrefs: Record<string, boolean | string> = {};
      categories.forEach(cat => {
        categoryPrefs[cat.key] = selectedCategories.includes(cat.key);
      });
      categoryPrefs.distance_preference = distance;
      await userPreferencesService.saveSurveyPreferences(user.id, categoryPrefs);

      // Save user_survey_answers
      const surveyAnswers = {
        reward_style: rewardStyle,
        reward_types: rewardTypes,
        social_sharing: socialSharing,
        category_ratings: ratings,
        discovery_source: discovery,
      };
      await userPreferencesService.saveSurveyAnswers(user.id, surveyAnswers);
      
      const { error } = await userPreferencesService.markSurveyComplete(user.id);
      if (error) {
        Alert.alert('Error', `Failed to save survey answers: ${error}`);
        return;
      }
      
      // Request location and push notification permissions after survey completion
      await requestInitialPermissions();
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressBarContainer}>
      <View style={styles.progressBar}>
        <Animated.View 
          style={[
            styles.progressFill,
            { width: `${progressPercentage}%` }
          ]} 
        />
      </View>
    </View>
  );

  const renderSlide1 = () => (
    <View style={styles.slideContainer}>
      <View style={styles.slideHeader}>
        <Text style={styles.slideTitle}>What rewards interest you most?</Text>
        <Text style={styles.slideSubtitle}>Select all that apply</Text>
      </View>

      <View style={styles.categoriesGrid}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.key}
            onPress={() => handleCategoryToggle(category.key)}
            style={[
              styles.categoryCard,
              selectedCategories.includes(category.key) && styles.categoryCardSelected,
            ]}
            activeOpacity={0.8}
          >
            <View style={styles.categoryContent}>
              <View style={styles.categoryIconContainerOuter}>
                <View style={styles.categoryIconContainer}>
                  <IconComponent
                    name={category.icon}
                    size={32}
                    color={selectedCategories.includes(category.key) ? Colors.primary : Colors.white}
                  />
                </View>
              </View>
              <Text style={[
                styles.categoryLabel,
                selectedCategories.includes(category.key) && styles.categoryLabelSelected
              ]}>
                {category.label}
              </Text>
              <View style={[
                styles.checkmarkContainer,
                !selectedCategories.includes(category.key) && styles.checkmarkContainerHidden
              ]}>
                {selectedCategories.includes(category.key) && (
                  <Check size={16} color={Colors.white} />
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSlide2 = () => (
    <View style={styles.slideContainer}>
      <View style={styles.slideHeader}>
        <Text style={styles.slideTitle}>How far will you travel?</Text>
        <Text style={styles.slideSubtitle}>We'll show you the closest rewards first</Text>
      </View>

      <View style={styles.optionsList}>
        {distanceOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => setDistance(option.value)}
            style={[
              styles.optionCard,
              distance === option.value && styles.optionCardSelected,
            ]}
            activeOpacity={0.8}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIconContainerOuter}>
                <View style={styles.optionIconContainer}>
                  <IconComponent
                    name={option.icon}
                    size={24}
                    color={distance === option.value ? Colors.primary : Colors.white}
                  />
                </View>
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[
                  styles.optionTitle,
                  distance === option.value && styles.optionTitleSelected
                ]}>
                  {option.value}
                </Text>
                <Text style={[
                  styles.optionDescription,
                  distance === option.value && styles.optionDescriptionSelected
                ]}>
                  {option.description}
                </Text>
              </View>
              {distance === option.value && (
                <View style={styles.checkmarkContainer}>
                  <Check size={20} color={Colors.white} />
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSlide3 = () => (
    <View style={styles.slideContainer}>
      <View style={styles.slideHeader}>
        <Text style={styles.slideTitle}>What's your style?</Text>
        <Text style={styles.slideSubtitle}>Choose your reward preference</Text>
      </View>

      <View style={styles.optionsList}>
        {rewardStyleOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => setRewardStyle(option.value)}
            style={[
              styles.optionCard,
              rewardStyle === option.value && styles.optionCardSelected,
            ]}
            activeOpacity={0.8}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIconContainerOuter}>
                <View style={styles.optionIconContainer}>
                  <IconComponent
                    name={option.icon}
                    size={24}
                    color={rewardStyle === option.value ? Colors.primary : Colors.white}
                  />
                </View>
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[
                  styles.optionTitle,
                  rewardStyle === option.value && styles.optionTitleSelected
                ]}>
                  {option.value}
                </Text>
                <Text style={[
                  styles.optionDescription,
                  rewardStyle === option.value && styles.optionDescriptionSelected
                ]}>
                  {option.description}
                </Text>
              </View>
              {rewardStyle === option.value && (
                <View style={styles.checkmarkContainer}>
                  <Check size={20} color={Colors.white} />
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSlide4 = () => {
    // Sort options: selected items by rank order first, then unselected items
    const sortedOptions = [...rewardTypeOptions].sort((a, b) => {
      const aSelected = rewardTypes.includes(a.value);
      const bSelected = rewardTypes.includes(b.value);

      if (aSelected && bSelected) {
        // Both selected: sort by rank position
        return rewardTypes.indexOf(a.value) - rewardTypes.indexOf(b.value);
      } else if (aSelected) {
        // Only a is selected: a comes first
        return -1;
      } else if (bSelected) {
        // Only b is selected: b comes first
        return 1;
      } else {
        // Neither selected: maintain original order
        return 0;
      }
    });

    return (
      <View style={styles.slideContainer}>
        <View style={styles.slideHeader}>
          <Text style={styles.slideTitle}>Rank your favorites</Text>
          <Text style={styles.slideSubtitle}>Tap to select (ranks 1-5 in order)</Text>
        </View>

        <View style={styles.optionsList}>
          {sortedOptions.map((option) => {
            const isSelected = rewardTypes.includes(option.value);
            const rankPosition = isSelected ? rewardTypes.indexOf(option.value) + 1 : null;

            return (
              <View
                key={option.value}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected
                ]}
              >
                <View style={styles.optionContent}>
                  <TouchableOpacity
                    onPress={() => handleRewardTypeToggle(option.value)}
                    style={[styles.optionTextContainer, { flexDirection: 'row', alignItems: 'center' }]}
                  >
                    <View style={[styles.optionIconContainerOuter, { marginRight: 12 }]}>
                      <View style={styles.optionIconContainer}>
                        <IconComponent
                          name={option.icon}
                          size={24}
                          color={isSelected ? Colors.primary : Colors.white}
                        />
                      </View>
                    </View>
                    <Text style={[
                      styles.optionTitle,
                      isSelected && styles.optionTitleSelected
                    ]}>
                      {option.value}
                    </Text>
                  </TouchableOpacity>

                  {isSelected && (
                    <View style={styles.rankingControls}>
                      <View style={styles.arrowButtons}>
                        <TouchableOpacity
                          onPress={() => moveRewardType(option.value, 'up')}
                          disabled={rankPosition === 1}
                          style={[
                            styles.arrowButton,
                            rankPosition === 1 && styles.arrowButtonDisabled
                          ]}
                        >
                          <ArrowUp size={16} color={rankPosition === 1 ? Colors.gray400 : Colors.gray500} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => moveRewardType(option.value, 'down')}
                          disabled={rankPosition === rewardTypes.length}
                          style={[
                            styles.arrowButton,
                            rankPosition === rewardTypes.length && styles.arrowButtonDisabled
                          ]}
                        >
                          <ArrowDown size={16} color={rankPosition === rewardTypes.length ? Colors.gray400 : Colors.gray500} />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.rankBadge}>
                        <Text style={styles.rankNumber}>{rankPosition}</Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {rewardTypes.length > 0 && (
          <View style={styles.rankingSummary}>
            <Text style={styles.rankingTitle}>Your ranking (drag to reorder):</Text>
            <View style={styles.rankingList}>
              {rewardTypes.map((item, index) => {
                const pan = new Animated.ValueXY();
                const panResponder = PanResponder.create({
                  onStartShouldSetPanResponder: () => true,
                  onMoveShouldSetPanResponder: () => true,
                  onPanResponderGrant: () => {
                    pan.setOffset({
                      x: 0,
                      y: 0,
                    });
                  },
                  onPanResponderMove: Animated.event([
                    null,
                    { dy: pan.y }
                  ], { useNativeDriver: false }),
                  onPanResponderRelease: (_, gesture) => {
                    pan.flattenOffset();
                    // Calculate which position they dragged to
                    const itemHeight = 60; // Approximate height of each ranking item
                    const draggedPositions = Math.round(gesture.dy / itemHeight);
                    const newIndex = Math.max(0, Math.min(rewardTypes.length - 1, index + draggedPositions));

                    if (newIndex !== index) {
                      moveRewardTypeToPosition(item, newIndex);
                    }

                    // Reset animation
                    Animated.spring(pan, {
                      toValue: { x: 0, y: 0 },
                      useNativeDriver: false,
                    }).start();
                  },
                });

                return (
                  <Animated.View
                    key={item}
                    {...panResponder.panHandlers}
                    style={[
                      styles.rankingItem,
                      {
                        transform: [{ translateY: pan.y }],
                      },
                    ]}
                  >
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankNumber}>{index + 1}</Text>
                    </View>
                    <Text style={styles.rankingText}>{item}</Text>
                    <Text style={styles.dragHandle}>⋮⋮</Text>
                  </Animated.View>
                );
              })}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderSlide5 = () => (
    <View style={styles.slideContainer}>
      <View style={styles.slideHeader}>
        <Text style={styles.slideTitle}>Share your wins?</Text>
        <Text style={styles.slideSubtitle}>How social do you want to be?</Text>
      </View>

      <View style={styles.optionsList}>
        {socialOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => setSocialSharing(option.value)}
            style={[
              styles.optionCard,
              socialSharing === option.value && styles.optionCardSelected
            ]}
            activeOpacity={0.8}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionIconContainerOuter}>
                <View style={styles.optionIconContainer}>
                  <IconComponent
                    name={option.icon}
                    size={24}
                    color={socialSharing === option.value ? Colors.primary : Colors.white}
                  />
                </View>
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={[
                  styles.optionTitle,
                  socialSharing === option.value && styles.optionTitleSelected
                ]}>
                  {option.value}
                </Text>
                <Text style={[
                  styles.optionDescription,
                  socialSharing === option.value && styles.optionDescriptionSelected
                ]}>
                  {option.description}
                </Text>
              </View>
              {socialSharing === option.value && (
                <View style={styles.checkmarkContainer}>
                  <Check size={20} color={Colors.white} />
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSlide6 = () => (
    <View style={styles.slideContainer}>
      <View style={styles.slideHeader}>
        <Text style={styles.slideTitle}>Rate your interests</Text>
        <Text style={styles.slideSubtitle}>1 = Not interested, 7 = Very interested</Text>
      </View>

      <View style={styles.ratingsList}>
        {ratingCategories.map((category) => (
          <View key={category} style={styles.ratingCard}>
            <Text style={styles.ratingTitle}>{category}</Text>
            <View style={styles.ratingButtonsContainer}>
              {[1, 2, 3, 4, 5, 6, 7].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  onPress={() => setRatings((prev) => ({ ...prev, [category]: rating }))}
                  style={[
                    styles.ratingButton,
                    ratings[category] === rating && styles.ratingButtonSelected,
                  ]}
                >
                  <Text 
                    style={[
                      styles.ratingButtonText,
                      ratings[category] === rating && styles.ratingButtonTextSelected,
                    ]}
                  >
                    {rating}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderSlide7 = () => (
    <View style={styles.slideContainer}>
      <View style={styles.slideHeader}>
        <Text style={styles.slideTitle}>How did you find us?</Text>
        <Text style={styles.slideSubtitle}>Help us understand our reach</Text>
      </View>

      <View style={styles.categoriesGrid}>
        {discoveryOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => setDiscovery(option.value)}
            style={[
              styles.categoryCard,
              discovery === option.value && styles.categoryCardSelected
            ]}
            activeOpacity={0.8}
          >
            <View style={styles.categoryContent}>
              <View style={styles.categoryIconContainerOuter}>
                <View style={styles.categoryIconContainer}>
                  <IconComponent
                    name={option.icon}
                    size={32}
                    color={discovery === option.value ? Colors.primary : Colors.white}
                  />
                </View>
              </View>
              <Text style={[
                styles.categoryLabel,
                discovery === option.value && styles.categoryLabelSelected
              ]}>
                {option.value}
              </Text>
              <View style={[
                styles.checkmarkContainer,
                discovery !== option.value && styles.checkmarkContainerHidden
              ]}>
                {discovery === option.value && (
                  <Check size={16} color={Colors.white} />
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCurrentSlide = () => {
    switch (currentSlide) {
      case 1:
        return renderSlide1();
      case 2:
        return renderSlide2();
      case 3:
        return renderSlide3();
      case 4:
        return renderSlide4();
      case 5:
        return renderSlide5();
      case 6:
        return renderSlide6();
      case 7:
        return renderSlide7();
      default:
        return renderSlide1();
    }
  };

  return (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryDark, Colors.success]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Background decorative elements */}
      <View style={styles.backgroundDecorations}>
        <View style={[styles.blurCircle, styles.blurCircle1]} />
        <View style={[styles.blurCircle, styles.blurCircle2]} />
        <View style={[styles.blurCircle, styles.blurCircle3]} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            {/* Enhanced Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <View style={styles.headerText}>
                  <Text style={styles.headerTitle}>Welcome to OpenDoors!</Text>
                  <Text style={styles.headerSubtitle}>Let's personalize your experience</Text>
                </View>
                <View style={styles.logoContainer}>
                  <Image 
                    source={require('../../../assets/images/OpenDoorsLogo.png')} 
                    style={styles.logoImage}
                  />
                </View>
              </View>

              {/* Enhanced Progress */}
              <View style={styles.progressInfo}>
                <Text style={styles.progressText}>
                  Step {currentSlide} of {totalSlides}
                </Text>
                <Text style={styles.progressPercentage}>
                  {Math.round(progressPercentage)}% complete
                </Text>
              </View>
              {renderProgressBar()}
            </View>

            {/* Main Content */}
            <View style={styles.content}>
              <View style={styles.slideWrapper}>
                {renderCurrentSlide()}

                {/* Enhanced Navigation */}
                <View style={styles.navigation}>
                  <TouchableOpacity
                    onPress={prevSlide}
                    disabled={currentSlide === 1}
                    style={[
                      styles.navButton,
                      styles.backButton,
                      currentSlide === 1 && styles.navButtonDisabled
                    ]}
                    activeOpacity={0.8}
                  >
                    <ChevronLeft size={20} color={currentSlide === 1 ? 'rgba(255,255,255,0.5)' : Colors.white} />
                    <Text style={[
                      styles.navButtonText,
                      currentSlide === 1 && styles.navButtonTextDisabled
                    ]}>
                      Back
                    </Text>
                  </TouchableOpacity>

                  {currentSlide === totalSlides ? (
                    <TouchableOpacity
                      onPress={handleComplete}
                      disabled={loading}
                      style={[styles.navButton, styles.completeButton]}
                      activeOpacity={0.8}
                    >
                      {loading ? (
                        <View style={styles.loadingSpinner} />
                      ) : (
                        <>
                          <Text style={styles.completeButtonText}>Get Started!</Text>
                          <Star size={20} color={Colors.white} />
                        </>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={nextSlide}
                      style={[styles.navButton, styles.nextButton]}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.nextButtonText}>Next</Text>
                      <ChevronRight size={20} color={Colors.primaryDark} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundDecorations: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  blurCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 1000,
  },
  blurCircle1: {
    width: 128,
    height: 128,
    top: 80,
    right: 40,
  },
  blurCircle2: {
    width: 96,
    height: 96,
    bottom: 160,
    left: 32,
  },
  blurCircle3: {
    width: 64,
    height: 64,
    top: height * 0.33,
    left: width * 0.25,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 64,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 18,
    color: Colors.primaryLightest,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  logoImage: {
    width: 56,
    height: 56,
    resizeMode: 'contain',
    opacity: 0.95,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressText: {
    color: Colors.white,
    fontWeight: '500',
  },
  progressPercentage: {
    color: Colors.primaryLightest,
  },
  progressBarContainer: {
    marginBottom: 32,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.warning,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  slideWrapper: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  slideContainer: {
    gap: 32,
  },
  slideHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  slideSubtitle: {
    fontSize: 18,
    color: Colors.primaryLightest,
    textAlign: 'center',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  categoryCard: {
    width: (width - 80) / 2,
    minHeight: 150,
    padding: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryCardSelected: {
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  categoryContent: {
    alignItems: 'center',
  },
  categoryIconContainerOuter: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginBottom: 16,
  },
  categoryIconContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
  },
  categoryLabelSelected: {
    color: Colors.gray900,
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  checkmarkContainerHidden: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  optionsList: {
    gap: 16,
  },
  optionCard: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionCardSelected: {
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIconContainerOuter: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  optionIconContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: Colors.gray900,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.primaryLightest,
  },
  optionDescriptionSelected: {
    color: Colors.gray500,
  },
  rankingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  arrowButtons: {
    gap: 4,
  },
  arrowButton: {
    padding: 4,
    borderRadius: 12,
  },
  arrowButtonDisabled: {
    opacity: 0.3,
  },
  rankBadge: {
    width: 40,
    height: 40,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  rankingSummary: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    padding: 24,
  },
  rankingTitle: {
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 16,
  },
  rankingList: {
    gap: 12,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  rankingText: {
    color: Colors.white,
    marginLeft: 12,
    flex: 1,
  },
  dragHandle: {
    color: Colors.white,
    fontSize: 20,
    marginLeft: 8,
    opacity: 0.5,
  },
  ratingsList: {
    marginTop: 16,
  },
  ratingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 16,
  },
  ratingButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  ratingButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  ratingButtonSelected: {
    backgroundColor: Colors.white,
    borderColor: Colors.white,
    transform: [{scale: 1.1}],
  },
  ratingButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  ratingButtonTextSelected: {
    color: Colors.primary,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 48,
    gap: 16,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  navButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  navButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  nextButton: {
    backgroundColor: Colors.white,
  },
  nextButtonText: {
    color: Colors.primaryDark,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: Colors.success,
  },
  completeButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: Colors.white,
    borderRadius: 10,
  },
});
