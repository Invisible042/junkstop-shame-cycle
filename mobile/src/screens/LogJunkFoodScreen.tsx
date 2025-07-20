import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { uploadFile } from '../utils/api';
import { useTheme } from '../contexts/ThemeContext';
import { colors, spacing, fontSizes, cardStyle, buttonStyle } from '../styles/theme';
import { isDemoMode, addDemoLog } from '../utils/demoData';

interface LogJunkFoodScreenProps {
  navigation: any;
}

export default function LogJunkFoodScreen({ navigation }: LogJunkFoodScreenProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [foodType, setFoodType] = useState('');
  const [guiltRating, setGuiltRating] = useState(5);
  const [regretRating, setRegretRating] = useState(5);
  const [estimatedCost, setEstimatedCost] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { theme } = useTheme();

  // Calorie estimation based on food type
  const getEstimatedCalories = (foodType: string) => {
    const calorieMap: { [key: string]: number } = {
      'Pizza': 285,
      'Burger': 350,
      'French Fries': 365,
      'Chicken Wings': 290,
      'Hot Dog': 250,
      'Taco': 200,
      'Nachos': 320,
      'Ice Cream': 250,
      'Cake': 300,
      'Donut': 250,
      'Candy': 150,
      'Chocolate': 200,
      'Soda': 150,
      'Milkshake': 400,
      'Chips': 160,
      'Popcorn': 130,
      'Cookie': 180,
      'Brownie': 220,
      'Muffin': 350,
      'Bagel': 250,
      'Sandwich': 300,
      'Pasta': 200,
      'Ramen': 400,
      'Sushi': 250,
      'Other': 250, // Default
    };
    
    // Try to match the food type
    for (const [key, calories] of Object.entries(calorieMap)) {
      if (foodType.toLowerCase().includes(key.toLowerCase())) {
        return calories;
      }
    }
    
    return calorieMap['Other'];
  };

  const JUNK_TYPES = [
    'Burger',
    'Pizza',
    'Cake',
    'Fries',
    'Donut',
    'Soda',
    'Chocolate',
    'Candy',
    'Popcorn',
    'Milkshake',
    'Ice Cream',
    'Cupcake',
    'Other',
  ];
  const [selectedJunkType, setSelectedJunkType] = useState('');

  const estimatedCalories = getEstimatedCalories(foodType || selectedJunkType);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Permission to access camera is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Select Photo',
      'Choose how you want to add a photo',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // Map 4-level UI to backend values
  const REGRET_MAP = [1, 4, 7, 10];
  const GUILT_MAP = [1, 4, 7, 10];

  const submitLog = async () => {
    const typeToSubmit = foodType.trim() || selectedJunkType;
    if (!typeToSubmit) {
      Alert.alert('Error', 'Please select or enter the type of junk food');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isDemoMode()) {
        // Demo mode - add to demo data
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        
        // Add the new log to demo data
        addDemoLog({
          foodType: typeToSubmit,
          guiltRating: guiltRating,
          regretRating: regretRating,
          estimatedCost: estimatedCost,
          location: location,
          photo: photo || undefined,
          estimatedCalories: estimatedCalories,
        });
        
        Alert.alert(
          'Success! 🎉',
          'Your junk food log has been recorded successfully. Check the dashboard to see updated stats!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Dashboard'),
            },
          ]
        );
        
        // Reset form
        setPhoto(null);
        setFoodType('');
        setSelectedJunkType('');
        setGuiltRating(5);
        setRegretRating(5);
        setEstimatedCost('');
        setLocation('');
        return;
      }

      // Real API submission
      const formData = new FormData();
      if (photo) {
        formData.append('photo', {
          uri: photo,
          type: 'image/jpeg',
          name: 'junkfood.jpg',
        } as any);
      }
      formData.append('food_type', typeToSubmit);
      // Map UI value to backend value
      formData.append('guilt_rating', GUILT_MAP[guiltRating].toString());
      formData.append('regret_rating', REGRET_MAP[regretRating].toString());
      if (estimatedCost) formData.append('estimated_cost', estimatedCost.toString());
      if (location) formData.append('location', location);
      const result = await uploadFile('/api/logs', formData);
      Alert.alert(
        'Success!',
        result.ai_motivation || 'Your junk food log has been recorded successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Dashboard'),
          },
        ]
      );
      // Reset form
      setPhoto(null);
      setFoodType('');
      setSelectedJunkType('');
      setGuiltRating(5);
      setRegretRating(5);
      setEstimatedCost('');
      setLocation('');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit log. Please try again.');
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove RatingSlider and all styles usage (not used in new design)

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Fixed Header */}
      <View style={{
        backgroundColor: theme.cardBg,
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.inputBorder,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              padding: 8,
              borderRadius: 20,
              backgroundColor: 'rgba(0,0,0,0.1)',
            }}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={{ 
            fontSize: 20, 
            fontWeight: 'bold', 
            color: theme.text,
            fontFamily: theme.fontFamily 
          }}>
            Log New Food
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      {/* Scrollable Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
                <ScrollView
          contentContainerStyle={{ 
            padding: 20, 
            paddingBottom: 40,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Single Form Container */}
          <View style={{
            backgroundColor: theme.cardBg,
            borderRadius: 20,
            padding: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}>
            {/* Photo Input */}
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '600', 
                color: theme.text, 
                marginBottom: 12,
                fontFamily: theme.fontFamily 
              }}>
                Add Photo (Optional)
              </Text>
              <TouchableOpacity
                onPress={showImagePicker}
                activeOpacity={0.8}
                style={{
                  width: 180,
                  height: 110,
                  borderRadius: 12,
                  overflow: 'hidden',
                  backgroundColor: '#fff',
                  borderWidth: photo ? 2 : 1,
                  borderColor: photo ? theme.accent : theme.inputBorder,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: theme.accent,
                  shadowOpacity: 0.1,
                  shadowRadius: 6,
                }}
              >
                {photo ? (
                  <Image source={{ uri: photo }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                ) : (
                  <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name="camera" size={32} color={theme.accent} style={{ opacity: 0.8 }} />
                    <Text style={{ color: theme.textSecondary, marginTop: 6, fontSize: 12 }}>Tap to add photo</Text>
                  </View>
                )}
              </TouchableOpacity>
              {photo && (
                <TouchableOpacity 
                  onPress={() => setPhoto(null)} 
                  style={{ 
                    marginTop: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    backgroundColor: '#ff4444',
                    borderRadius: 16,
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12 }}>Remove Photo</Text>
                </TouchableOpacity>
              )}
            </View>
          {/* Food Name Input */}
          <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>Food Name</Text>
          <TextInput
            style={{ backgroundColor: '#fff', borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 14, padding: 12, fontSize: 18, color: theme.text, marginBottom: 14, fontFamily: theme.fontFamily, shadowColor: '#009e60', shadowOpacity: 0.04, shadowRadius: 5 }}
            placeholder="Food name"
            placeholderTextColor={theme.textSecondary}
            value={foodType}
            onChangeText={setFoodType}
            autoCapitalize="words"
            returnKeyType="done"
          />
          {/* Junk Food Type Dropdown */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600', marginBottom: 4 }}>Select Junk Food Type</Text>
            <Picker
              selectedValue={selectedJunkType}
              onValueChange={(itemValue: string) => {
                setSelectedJunkType(itemValue);
                if (!foodType) setFoodType(itemValue === 'Other' ? '' : itemValue);
              }}
              style={{ backgroundColor: '#fff', borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 14 }}
            >
              <Picker.Item label="Select type..." value="" />
              {JUNK_TYPES.map(type => (
                <Picker.Item key={type} label={type} value={type} />
              ))}
            </Picker>
          </View>
          {/* Regret Level */}
          <Text style={{ fontSize: 17, color: theme.text, marginBottom: 7, fontWeight: '600', letterSpacing: 0.2 }}>Regret level</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
            {[0, 1, 2, 3].map((level) => (
              <TouchableOpacity
                key={level}
                style={{
                  alignItems: 'center',
                  flex: 1,
                  marginHorizontal: 2,
                  paddingVertical: 5,
                  paddingHorizontal: 0,
                  borderRadius: 14,
                  borderWidth: regretRating === level ? 2 : 0,
                  borderColor: regretRating === level ? theme.accent : 'transparent',
                  backgroundColor: regretRating === level ? 'rgba(119,190,240,0.10)' : 'transparent',
                  shadowColor: regretRating === level ? theme.accent : 'transparent',
                  shadowOpacity: regretRating === level ? 0.07 : 0,
                  shadowRadius: regretRating === level ? 5 : 0,
                }}
                onPress={() => setRegretRating(level)}
                activeOpacity={0.85}
              >
                <Text style={{ fontSize: 34, textAlign: 'center', marginBottom: 1 }}>{['😊', '😕', '😟', '😩'][level]}</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '500', textAlign: 'center' }}>{['None', 'Low', 'Medium', 'High'][level]}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Guilt Level */}
          <Text style={{ fontSize: 17, color: theme.text, marginBottom: 7, fontWeight: '600', letterSpacing: 0.2 }}>Guilt level</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
            {[0, 1, 2, 3, 4, 5].map((level) => (
              <TouchableOpacity
                key={level}
                style={{
                  alignItems: 'center',
                  flex: 1,
                  marginHorizontal: 1,
                  paddingVertical: 5,
                  paddingHorizontal: 0,
                  borderRadius: 14,
                  borderWidth: guiltRating === level ? 2 : 0,
                  borderColor: guiltRating === level ? theme.accent : 'transparent',
                  backgroundColor: guiltRating === level ? 'rgba(119,190,240,0.10)' : 'transparent',
                  shadowColor: guiltRating === level ? theme.accent : 'transparent',
                  shadowOpacity: guiltRating === level ? 0.07 : 0,
                  shadowRadius: guiltRating === level ? 5 : 0,
                }}
                onPress={() => setGuiltRating(level)}
                activeOpacity={0.85}
              >
                <Text style={{ fontSize: 28, textAlign: 'center', marginBottom: 1 }}>{['😇', '😐', '😕', '😟', '😩', '😭'][level]}</Text>
                <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '500', textAlign: 'center' }}>{['None', 'Low', 'Mild', 'Mod', 'High', 'Max'][level]}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Estimated Calories Display - Only show when food type is selected */}
          {(foodType || selectedJunkType) && (
            <View style={{ 
              backgroundColor: 'rgba(255, 193, 7, 0.1)', 
              borderRadius: 12, 
              padding: 12, 
              marginBottom: 14,
              borderWidth: 1,
              borderColor: 'rgba(255, 193, 7, 0.3)',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="flame-outline" size={20} color="#FF9800" style={{ marginRight: 8 }} />
                <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600' }}>Estimated Calories</Text>
              </View>
              <Text style={{ color: '#FF9800', fontSize: 18, fontWeight: 'bold' }}>{estimatedCalories} cal</Text>
            </View>
          )}
          
          {/* Estimated Cost and Location (now stacked, full width) */}
          <TextInput
            style={{ backgroundColor: '#fff', borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 12, padding: 10, fontSize: 16, color: theme.text, fontFamily: theme.fontFamily, marginBottom: 10, shadowColor: '#009e60', shadowOpacity: 0.03, shadowRadius: 3 }}
            placeholder="Estimated cost ($, optional)"
            placeholderTextColor={theme.textSecondary}
            value={estimatedCost}
            onChangeText={setEstimatedCost}
            keyboardType="decimal-pad"
            returnKeyType="done"
          />
          <TextInput
            style={{ backgroundColor: '#fff', borderColor: theme.inputBorder, borderWidth: 1, borderRadius: 12, padding: 10, fontSize: 16, color: theme.text, fontFamily: theme.fontFamily, marginBottom: 14, shadowColor: '#009e60', shadowOpacity: 0.03, shadowRadius: 3 }}
            placeholder="Location (optional)"
            placeholderTextColor={theme.textSecondary}
            value={location}
            onChangeText={setLocation}
            returnKeyType="done"
          />
          {/* Mark as Junk Food Switch (optional, for future extensibility) */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14, justifyContent: 'flex-start' }}>
            <Text style={{ color: theme.text, fontSize: 16, marginRight: 12, fontWeight: '500' }}>Mark as junk food</Text>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: '#e0e7ff', true: theme.accent }}
              thumbColor={true ? theme.accent : '#fff'}
              disabled
            />
          </View>
          </View>

            {/* Submit Button - Integrated into form */}
            <TouchableOpacity 
              disabled={isSubmitting} 
              onPress={submitLog} 
              style={{ 
                borderRadius: 16, 
                overflow: 'hidden', 
                opacity: isSubmitting ? 0.7 : 1, 
                shadowColor: '#e74c3c', 
                shadowOpacity: 0.2, 
                shadowRadius: 6,
                elevation: 3,
                marginTop: 20,
              }}
            >
              <View
                style={{
                  backgroundColor: '#e74c3c',
                  paddingVertical: 14,
                  alignItems: 'center',
                  borderRadius: 16,
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="add-circle" size={20} color="#fff" style={{ marginRight: 6 }} />
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15, fontFamily: theme.fontFamily }}>
                  {isSubmitting ? 'Adding...' : 'Add Food Log'}
                </Text>
              </View>
            </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photoButton: {
    width: 200,
    height: 200,
    borderRadius: 15,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
  },
  formSection: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ratingContainer: {
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  ratingButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ratingButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    marginBottom: 30,
    borderRadius: 15,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});