import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { userPreferencesService } from '../../services/userPreferencesService';
import { RootStackParamList } from '../../types/navigation';

type SurveyScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Survey'>;

interface SurveyScreenProps {
  onComplete?: () => void;
}

export default function SurveyScreen({ onComplete }: SurveyScreenProps) {
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

  const categories = [
    { key: 'food', label: 'Food & Dining', icon: '🍕' },
    { key: 'shopping', label: 'Shopping', icon: '🛍️' },
    { key: 'coffee', label: 'Coffee & Drinks', icon: '☕' },
    { key: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { key: 'fitness', label: 'Fitness & Health', icon: '💪' },
    { key: 'beauty', label: 'Beauty & Wellness', icon: '💄' }
  ];

  const distanceOptions = [
    'Within 5 miles',
    'Between 5-10 miles', 
    'Between 10-25 miles',
    'Any distance'
  ];

  const rewardStyleOptions = [
    'Safer bets with smaller rewards',
    'Something in the middle',
    'High-risk/high-reward'
  ];

  const rewardTypeOptions = [
    'Free items',
    'Percentage discounts',
    'BOGO offers',
    'Exclusive experiences',
    'Early access deals'
  ];

  const socialOptions = [
    'Yes, I\'d love to share',
    'Maybe occasionally',
    'Prefer to keep private'
  ];

  const ratingCategories = [
    'Quick meals & snacks',
    'Sit-down dining experiences',
    'Retail shopping deals',
    'Tech & electronics',
    'Local services (spa, salon, etc.)',
    'Experiences & activities'
  ];

  const discoveryOptions = [
    'Social media',
    'Friend or family',
    'App store browsing',
    'Online search',
    'Advertisement',
    'Other'
  ];

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleRatingChange = (category: string, rating: number) => {
    setRatings(prev => ({ ...prev, [category]: rating }));
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
    <View className="w-full bg-gray-200 h-2 rounded-full mb-8">
      <View 
        className="h-full rounded-full"
        style={{ 
          width: `${(currentSlide / totalSlides) * 100}%`,
          backgroundColor: '#FF9800'
        }}
      />
    </View>
  );

  const renderSlide1 = () => (
    <View className="space-y-6">
      <View className="text-center mb-4">
        <Text className="text-2xl font-bold text-gray-900 mb-2">What type of rewards are you most interested in winning?</Text>
        <Text className="text-gray-600">Select all that apply</Text>
      </View>
      
      <View className="grid grid-cols-2 gap-4">
        {categories.map(category => (
          <TouchableOpacity
            key={category.key}
            onPress={() => handleCategoryToggle(category.key)}
            className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
              selectedCategories.includes(category.key)
                ? 'bg-teal-600 border-teal-600'
                : 'bg-white border-gray-200'
            }`}
          >
            <View className="text-center">
              <Text className="text-3xl mb-3">{category.icon}</Text>
              <Text className={`font-semibold text-sm ${
                selectedCategories.includes(category.key) ? 'text-white' : 'text-gray-900'
              }`}>{category.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSlide2 = () => (
    <View className="space-y-6">
      <View className="text-center mb-4">
        <Text className="text-2xl font-bold text-gray-900 mb-2">What is the maximum distance you'd be willing to travel for a reward?</Text>
        <Text className="text-gray-600">We'll always show you the closest rewards first.</Text>
      </View>
      <View className="space-y-4">
        {distanceOptions.map(option => (
          <TouchableOpacity
            key={option}
            onPress={() => setDistance(option)}
            className={`p-6 rounded-2xl border-2 transition-all duration-200 flex-row items-center ${
              distance === option
                ? 'bg-teal-600 border-teal-600'
                : 'bg-white border-gray-200'
            }`}
          >
            <Ionicons name="location" size={24} color={distance === option ? 'white' : '#6B7280'} />
            <Text className={`font-semibold text-lg ml-4 ${
              distance === option ? 'text-white' : 'text-gray-900'
            }`}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSlide3 = () => (
    <View className="space-y-6">
      <View className="text-center mb-4">
        <Text className="text-2xl font-bold text-gray-900 mb-2">What kind of rewards do you prefer?</Text>
        <Text className="text-gray-600">Choose your style</Text>
      </View>
      
      <View className="space-y-4">
        {rewardStyleOptions.map(option => (
          <TouchableOpacity
            key={option}
            onPress={() => setRewardStyle(option)}
            className={`p-6 rounded-2xl border-2 transition-all duration-200 flex-row items-center ${
              rewardStyle === option
                ? 'bg-teal-600 border-teal-600'
                : 'bg-white border-gray-200'
            }`}
          >
            <Ionicons name="trending-up" size={24} color={rewardStyle === option ? 'white' : '#6B7280'} />
            <Text className={`font-semibold text-lg ml-4 ${
              rewardStyle === option ? 'text-white' : 'text-gray-900'
            }`}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSlide4 = () => {
    const handleClick = (option: string) => {
      if (!rewardTypes.includes(option)) {
        setRewardTypes([...rewardTypes, option]);
      } else {
        setRewardTypes(rewardTypes.filter(item => item !== option));
      }
    };

    const moveUp = (item: string) => {
      const currentIndex = rewardTypes.indexOf(item);
      if (currentIndex > 0) {
        const newOrder = [...rewardTypes];
        [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
        setRewardTypes(newOrder);
      }
    };

    const moveDown = (item: string) => {
      const currentIndex = rewardTypes.indexOf(item);
      if (currentIndex < rewardTypes.length - 1) {
        const newOrder = [...rewardTypes];
        [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
        setRewardTypes(newOrder);
      }
    };

    return (
      <View className="space-y-6">
        <View className="text-center mb-4">
          <Text className="text-2xl font-bold text-gray-900 mb-2">Which reward types excite you most?</Text>
          <Text className="text-gray-600">Click to select, use arrows to reorder by preference</Text>
        </View>
        
        <View className="space-y-4">
          {rewardTypeOptions.map((option) => {
            const isSelected = rewardTypes.includes(option);
            const rankPosition = isSelected ? rewardTypes.indexOf(option) + 1 : null;
            
            return (
              <TouchableOpacity
                key={option}
                onPress={() => handleClick(option)}
                className={`p-6 rounded-2xl border-2 transition-all duration-200 flex-row items-center justify-between ${
                  isSelected
                    ? 'bg-teal-600 border-teal-600'
                    : 'bg-white border-gray-200'
                }`}
              >
                <View className="flex-row items-center">
                  <Ionicons name="gift" size={24} color={isSelected ? 'white' : '#6B7280'} />
                  <Text className={`font-semibold text-lg ml-4 ${
                    isSelected ? 'text-white' : 'text-gray-900'
                  }`}>{option}</Text>
                </View>
                {isSelected && (
                  <View className="flex-row items-center space-x-2">
                    <View className="flex-col space-y-1">
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          moveUp(option);
                        }}
                        disabled={rankPosition === 1}
                        className={`w-6 h-6 rounded items-center justify-center ${
                          rankPosition === 1 
                            ? 'opacity-50' 
                            : ''
                        }`}
                      >
                        <Ionicons name="chevron-up" size={16} color="white" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          moveDown(option);
                        }}
                        disabled={rankPosition === rewardTypes.length}
                        className={`w-6 h-6 rounded items-center justify-center ${
                          rankPosition === rewardTypes.length 
                            ? 'opacity-50' 
                            : ''
                        }`}
                      >
                        <Ionicons name="chevron-down" size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                    <View className="bg-white rounded-full w-8 h-8 items-center justify-center ml-2">
                      <Text className="text-teal-600 font-bold">{rankPosition}</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        
        {rewardTypes.length > 0 && (
          <View className="bg-white p-4 rounded-xl border border-gray-200 mt-6">
            <Text className="font-semibold text-gray-900 mb-2">Your ranking:</Text>
            <View className="space-y-2">
              {rewardTypes.map((item, index) => (
                <View key={item} className="flex-row items-center">
                  <View className="w-6 h-6 bg-teal-100 rounded-full items-center justify-center mr-3">
                    <Text className="text-teal-600 text-xs font-bold">{index + 1}</Text>
                  </View>
                  <Text className="text-sm text-gray-700">{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderSlide5 = () => (
    <View className="space-y-6">
      <View className="text-center mb-4">
        <Text className="text-2xl font-bold text-gray-900 mb-2">Would you be interested in sharing your wins with friends?</Text>
        <Text className="text-gray-600">Help us understand your social preferences</Text>
      </View>
      
      <View className="space-y-4">
        {socialOptions.map(option => (
          <TouchableOpacity
            key={option}
            onPress={() => setSocialSharing(option)}
            className={`p-6 rounded-2xl border-2 transition-all duration-200 flex-row items-center ${
              socialSharing === option
                ? 'bg-teal-600 border-teal-600'
                : 'bg-white border-gray-200'
            }`}
          >
            <Ionicons name="people" size={24} color={socialSharing === option ? 'white' : '#6B7280'} />
            <Text className={`font-semibold text-lg ml-4 ${
              socialSharing === option ? 'text-white' : 'text-gray-900'
            }`}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSlide6 = () => (
    <View style={{ paddingHorizontal: 12, marginBottom: 0 }}>
      <View style={{ alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 4, paddingHorizontal: 8, textAlign: 'center' }}>
          Rate your interest in these reward categories
        </Text>
        <Text style={{ color: '#6B7280', fontSize: 14, marginBottom: 8 }}>1 = Not interested, 7 = Very interested</Text>
      </View>
      <ScrollView style={{ maxHeight: 340 }} contentContainerStyle={{ paddingBottom: 12 }}>
        {ratingCategories.map(category => (
          <View key={category} style={{ backgroundColor: 'white', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16 }}>
            <Text style={{ fontWeight: '600', color: '#111827', marginBottom: 8, paddingHorizontal: 4 }}>{category}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              {[1, 2, 3, 4, 5, 6, 7].map(rating => (
                <TouchableOpacity
                  key={rating}
                  onPress={() => handleRatingChange(category, rating)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    borderWidth: 2,
                    borderColor: ratings[category] === rating ? '#14B8A6' : '#E5E7EB',
                    backgroundColor: ratings[category] === rating ? '#14B8A6' : 'white',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginHorizontal: 2,
                  }}
                >
                  <Text style={{ fontWeight: 'bold', color: ratings[category] === rating ? 'white' : '#111827' }}>{rating}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderSlide7 = () => (
    <View className="space-y-6">
      <View className="text-center mb-4">
        <Text className="text-2xl font-bold text-gray-900 mb-2">How did you hear about Open Doors?</Text>
        <Text className="text-gray-600">Help us understand how you discovered us</Text>
      </View>
      
      <View className="space-y-4">
        {discoveryOptions.map(option => (
          <TouchableOpacity
            key={option}
            onPress={() => setDiscovery(option)}
            className={`p-6 rounded-2xl border-2 transition-all duration-200 flex-row items-center ${
              discovery === option
                ? 'bg-teal-600 border-teal-600'
                : 'bg-white border-gray-200'
            }`}
          >
            <Ionicons 
              name="star" 
              size={24} 
              color={discovery === option ? '#FFD700' : '#9CA3AF'} 
            />
            <Text className={`font-semibold text-lg ml-4 ${
              discovery === option ? 'text-white' : 'text-gray-900'
            }`}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCurrentSlide = () => {
    switch(currentSlide) {
      case 1: return renderSlide1();
      case 2: return renderSlide2();
      case 3: return renderSlide3();
      case 4: return renderSlide4();
      case 5: return renderSlide5();
      case 6: return renderSlide6();
      case 7: return renderSlide7();
      default: return renderSlide1();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#009688' }}>
      <LinearGradient
        colors={['#009688', '#00796B']}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            {/* Header */}
            <View className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6">
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-2xl font-bold text-white">Welcome to Open Doors!</Text>
                  <Text className="text-teal-100">Let's personalize your experience</Text>
                </View>
                <View className="w-16 h-16 bg-teal-100 rounded-full items-center justify-center overflow-hidden">
                  <Image source={require('../../../assets/OpenDoorsLogo.png')} style={{ width: 48, height: 48, resizeMode: 'contain' }} />
                </View>
              </View>
              
              {/* Progress indicator */}
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm text-white">Step {currentSlide} of {totalSlides}</Text>
                <Text className="text-sm text-white">{Math.round((currentSlide / totalSlides) * 100)}% complete</Text>
              </View>
              {renderProgressBar()}
            </View>

            {/* Main Content */}
            <View className="bg-gray-50 flex-1 px-6 py-8">
              <View className="max-w-2xl mx-auto">
                {renderCurrentSlide()}
                
                {/* Navigation Buttons */}
                <View className="flex-row justify-between mt-12">
                  <TouchableOpacity
                    onPress={prevSlide}
                    disabled={currentSlide === 1}
                    className={`flex-row items-center px-6 py-3 rounded-xl font-semibold ${
                      currentSlide === 1
                        ? 'bg-gray-300'
                        : 'bg-white border-2 border-teal-600'
                    }`}
                  >
                    <Ionicons name="chevron-back" size={20} color={currentSlide === 1 ? '#6B7280' : '#009688'} />
                    <Text className={`ml-2 font-semibold ${
                      currentSlide === 1 ? 'text-gray-500' : 'text-teal-600'
                    }`}>Back</Text>
                  </TouchableOpacity>
                  
                  {currentSlide === totalSlides ? (
                    <TouchableOpacity
                      onPress={handleComplete}
                      disabled={loading}
                      className="flex-row items-center px-6 py-3 rounded-xl font-semibold bg-green-500"
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <>
                          <Text className="text-white font-semibold">Get Started!</Text>
                          <Ionicons name="chevron-forward" size={20} color="white" className="ml-2" />
                        </>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={nextSlide}
                      className="flex-row items-center px-6 py-3 rounded-xl font-semibold bg-teal-600"
                    >
                      <Text className="text-white font-semibold">Next</Text>
                      <Ionicons name="chevron-forward" size={20} color="white" className="ml-2" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}
