import React, { useState } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { uploadFile } from '../utils/api';
import { colors, spacing, fontSizes, cardStyle, buttonStyle } from '../styles/theme';

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

  const submitLog = async () => {
    if (!foodType.trim()) {
      Alert.alert('Error', 'Please enter the type of junk food');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      
      if (photo) {
        console.log('Uploading photo:', photo);
        formData.append('photo', {
          uri: photo,
          type: 'image/jpeg',
          name: 'junkfood.jpg',
        } as any);
      }

      formData.append('food_type', foodType);
      formData.append('guilt_rating', guiltRating.toString());
      formData.append('regret_rating', regretRating.toString());
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

  const RatingSlider = ({ 
    label, 
    value, 
    onChange, 
    color 
  }: { 
    label: string; 
    value: number; 
    onChange: (value: number) => void; 
    color: string; 
  }) => (
    <View style={styles.ratingContainer}>
      <Text style={[styles.ratingLabel, { color: '#fff' }]}>{label}: {value}/10</Text>
      <View style={styles.ratingButtons}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
          <TouchableOpacity
            key={rating}
            style={[
              styles.ratingButton,
              { backgroundColor: rating <= value ? color : '#e0e0e0' },
            ]}
            onPress={() => onChange(rating)}
          >
            <Text style={[
              styles.ratingButtonText,
              { color: rating <= value ? '#fff' : '#666' }
            ]}>
              {rating}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={['#181c2f', '#23263a']}
        style={{ ...styles.header, backgroundColor: undefined, paddingHorizontal: spacing.lg }}
      >
        <Text
          style={{
            color: colors.accent,
            fontSize: fontSizes.heading * 1.2,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: spacing.xs,
            textShadowColor: 'rgba(0,0,0,0.4)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 6,
            letterSpacing: 1.2,
          }}
        >
          Log Junk Food
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: fontSizes.body,
            textAlign: 'center',
            marginBottom: spacing.md,
            paddingHorizontal: spacing.md,
          }}
        >
          Track your cravings and get support
        </Text>
      </LinearGradient>
      
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[cardStyle, { marginTop: spacing.lg, backgroundColor: '#23263acc', marginHorizontal: spacing.lg }]}>
          <View style={styles.photoSection}>
            <TouchableOpacity style={styles.photoButton} onPress={showImagePicker}>
              {photo ? (
                <Image source={{ uri: photo }} style={styles.photoPreview} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="camera" size={48} color="#ccc" />
                  <Text style={styles.photoPlaceholderText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={{ color: colors.textSecondary, fontSize: fontSizes.body, marginBottom: spacing.sm }}>What did you eat?</Text>
              <TextInput
                style={styles.textInput}
                value={foodType}
                onChangeText={setFoodType}
                placeholder="e.g. Large pizza, candy bar, fast food..."
                placeholderTextColor="#999"
              />
            </View>

            <RatingSlider
              label="Guilt Level"
              value={guiltRating}
              onChange={setGuiltRating}
              color="#e74c3c"
            />

            <RatingSlider
              label="Regret Level"
              value={regretRating}
              onChange={setRegretRating}
              color="#f39c12"
            />

            <View style={styles.inputGroup}>
              <Text style={{ color: colors.textSecondary, fontSize: fontSizes.body, marginBottom: spacing.sm }}>Estimated Cost (optional)</Text>
              <TextInput
                style={styles.textInput}
                value={estimatedCost}
                onChangeText={setEstimatedCost}
                placeholder="e.g. 15.99"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={{ color: colors.textSecondary, fontSize: fontSizes.body, marginBottom: spacing.sm }}>Location (optional)</Text>
              <TextInput
                style={styles.textInput}
                value={location}
                onChangeText={setLocation}
                placeholder="e.g. McDonald's, Home, Office..."
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[buttonStyle, { backgroundColor: colors.accent, marginTop: spacing.md }]}
            onPress={submitLog}
            disabled={isSubmitting}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: fontSizes.body }}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
              </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
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