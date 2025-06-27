import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowDown, ArrowUp, Check, ChevronLeft, ChevronRight, Star } from 'lucide-react-native';
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
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { userPreferencesService } from '../../services/userPreferencesService';
import { RootStackParamList } from '../../types/navigation';

const { width, height } = Dimensions.get('window');

type SurveyScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Survey'>;

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

  const categories = [
    { key: 'food', label: 'Food & Dining', icon: '🍕', color: 'from-orange-400 to-red-500' },
    { key: 'shopping', label: 'Shopping', icon: '🛍️', color: 'from-pink-400 to-purple-500' },
    { key: 'coffee', label: 'Coffee & Drinks', icon: '☕', color: 'from-amber-400 to-orange-500' },
    { key: 'entertainment', label: 'Entertainment', icon: '🎬', color: 'from-blue-400 to-indigo-500' },
    { key: 'fitness', label: 'Fitness & Health', icon: '💪', color: 'from-green-400 to-emerald-500' },
    { key: 'beauty', label: 'Beauty & Wellness', icon: '💄', color: 'from-rose-400 to-pink-500' },
  ];

  const distanceOptions = [
    { value: 'Within 5 miles', icon: '🚶', description: 'Walking distance' },
    { value: 'Between 5-10 miles', icon: '🚗', description: 'Short drive' },
    { value: 'Between 10-25 miles', icon: '🛣️', description: 'Longer trip' },
    { value: 'Any distance', icon: '✈️', description: 'Worth the journey' },
  ];

  const rewardStyleOptions = [
    {
      value: 'Safer bets with smaller rewards',
      icon: '🛡️',
      description: 'Consistent wins, lower risk',
      color: 'from-green-400 to-emerald-500',
    },
    {
      value: 'Something in the middle',
      icon: '⚖️',
      description: 'Balanced approach',
      color: 'from-blue-400 to-indigo-500',
    },
    {
      value: 'High-risk/high-reward',
      icon: '🎯',
      description: 'Big wins, higher stakes',
      color: 'from-purple-400 to-pink-500',
    },
  ];

  const rewardTypeOptions = [
    { value: 'Free items', icon: '🎁' },
    { value: 'Percentage discounts', icon: '💰' },
    { value: 'BOGO offers', icon: '🔄' },
    { value: 'Exclusive experiences', icon: '⭐' },
    { value: 'Early access deals', icon: '⚡' },
  ];

  const socialOptions = [
    { value: "Yes, I'd love to share", icon: '📢', description: 'Share the excitement!' },
    { value: 'Maybe occasionally', icon: '🤔', description: 'Sometimes' },
    { value: 'Prefer to keep private', icon: '🔒', description: 'Just for me' },
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
    { value: 'Social media', icon: '📱' },
    { value: 'Friend or family', icon: '👥' },
    { value: 'App store browsing', icon: '📲' },
    { value: 'Online search', icon: '🔍' },
    { value: 'Advertisement', icon: '📺' },
    { value: 'Other', icon: '❓' },
  ];

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  };

  const handleRewardTypeToggle = (type: string) => {
    setRewardTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
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
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryLabel,
                selectedCategories.includes(category.key) && styles.categoryLabelSelected
              ]}>
                {category.label}
              </Text>
              {selectedCategories.includes(category.key) && (
                <View style={styles.checkmarkContainer}>
                  <Check size={16} color="white" />
                </View>
              )}
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
              <Text style={styles.optionIcon}>{option.icon}</Text>
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
                  <Check size={20} color="white" />
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
              <Text style={styles.optionIcon}>{option.icon}</Text>
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
                  <Check size={20} color="white" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSlide4 = () => (
    <View style={styles.slideContainer}>
      <View style={styles.slideHeader}>
        <Text style={styles.slideTitle}>Rank your favorites</Text>
        <Text style={styles.slideSubtitle}>Select and reorder by preference</Text>
      </View>

      <View style={styles.optionsList}>
        {rewardTypeOptions.map((option) => {
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
                  <Text style={[styles.optionIcon, { marginRight: 12 }]}>{option.icon}</Text>
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
                        <ArrowUp size={16} color={rankPosition === 1 ? '#9CA3AF' : '#6B7280'} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => moveRewardType(option.value, 'down')}
                        disabled={rankPosition === rewardTypes.length}
                        style={[
                          styles.arrowButton,
                          rankPosition === rewardTypes.length && styles.arrowButtonDisabled
                        ]}
                      >
                        <ArrowDown size={16} color={rankPosition === rewardTypes.length ? '#9CA3AF' : '#6B7280'} />
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
          <Text style={styles.rankingTitle}>Your ranking:</Text>
          <View style={styles.rankingList}>
            {rewardTypes.map((item, index) => (
              <View key={item} style={styles.rankingItem}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankNumber}>{index + 1}</Text>
                </View>
                <Text style={styles.rankingText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

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
            <View style={[styles.optionContent, { flexDirection: 'row', alignItems: 'center' }]}>
              <Text style={[styles.optionIcon, { marginRight: 12 }]}>{option.icon}</Text>
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
                  <Check size={20} color="white" />
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
              <Text style={styles.categoryIcon}>{option.icon}</Text>
              <Text style={[
                styles.categoryLabel,
                discovery === option.value && styles.categoryLabelSelected
              ]}>
                {option.value}
              </Text>
              {discovery === option.value && (
                <View style={styles.checkmarkContainer}>
                  <Check size={16} color="white" />
                </View>
              )}
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
      colors={['#14B8A6', '#0D9488', '#059669']}
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
                    source={require('../../../assets/OpenDoorsLogo.png')} 
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
                    <ChevronLeft size={20} color={currentSlide === 1 ? 'rgba(255,255,255,0.5)' : 'white'} />
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
                          <Star size={20} color="white" />
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
                      <ChevronRight size={20} color="#0D9488" />
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
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#E0F2F1',
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
    shadowColor: '#000',
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
    color: 'white',
    fontWeight: '500',
  },
  progressPercentage: {
    color: '#E0F2F1',
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
    backgroundColor: '#FCD34D',
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
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  slideSubtitle: {
    fontSize: 18,
    color: '#E0F2F1',
    textAlign: 'center',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  categoryCard: {
    width: (width - 80) / 2,
    padding: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryCardSelected: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  categoryContent: {
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 16,
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  categoryLabelSelected: {
    color: '#1E293B',
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    backgroundColor: '#14B8A6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
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
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: '#1E293B',
  },
  optionDescription: {
    fontSize: 14,
    color: '#E0F2F1',
  },
  optionDescriptionSelected: {
    color: '#6B7280',
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
    backgroundColor: '#14B8A6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    color: 'white',
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
    color: 'white',
    marginBottom: 16,
  },
  rankingList: {
    gap: 12,
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankingText: {
    color: 'white',
    marginLeft: 12,
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
    color: 'white',
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
    backgroundColor: 'white',
    borderColor: 'white',
    transform: [{scale: 1.1}],
  },
  ratingButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  ratingButtonTextSelected: {
    color: '#14B8A6',
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
    color: 'white',
    fontWeight: '600',
  },
  navButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  nextButton: {
    backgroundColor: 'white',
  },
  nextButtonText: {
    color: '#0D9488',
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#10B981',
  },
  completeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: 'white',
    borderRadius: 10,
  },
});
