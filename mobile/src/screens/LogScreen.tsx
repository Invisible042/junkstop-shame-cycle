import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  ScrollView,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
// import * as ImagePicker from 'expo-image-picker';
// import * as Location from 'expo-location';
import Slider from 'react-native-slider';
import Toast from 'react-native-toast-message';
import * as Animatable from 'react-native-animatable';

import { useData } from '../context/DataContext';
import { generateMotivation } from '../services/aiService';

const CALORIE_OPTIONS = [200, 500, 800, 1200];

export default function LogScreen() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [guiltRating, setGuiltRating] = useState(5);
  const [regretRating, setRegretRating] = useState(5);
  const [selectedCalories, setSelectedCalories] = useState(500);
  const [estimatedCost, setEstimatedCost] = useState('');
  const [loading, setLoading] = useState(false);
  const [showStreakBroken, setShowStreakBroken] = useState(false);
  const [aiMessage, setAiMessage] = useState('');

  const { addLog, currentStreak, getWeekStats } = useData();

  const takePhoto = async () => {
    // Mock photo capture for development
    const mockPhotoUri = 'https://via.placeholder.com/400x300/ff6b6b/ffffff?text=Junk+Food+Photo';
    setPhoto(mockPhotoUri);
    Alert.alert('Photo Captured', 'Demo photo captured for development');
  };

  const pickFromGallery = async () => {
    // Mock photo selection for development
    const mockPhotoUri = 'https://via.placeholder.com/400x300/4ecdc4/ffffff?text=Selected+Photo';
    setPhoto(mockPhotoUri);
    Alert.alert('Photo Selected', 'Demo photo selected for development');
  };

  const showImagePicker = () => {
    Alert.alert(
      'Select Photo',
      'Choose how you want to add a photo',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Gallery', onPress: pickFromGallery },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: address[0] ? `${address[0].street}, ${address[0].city}` : undefined,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  };

  const submitLog = async () => {
    if (!photo) {
      Alert.alert('Photo Required', 'Please take or select a photo of your junk food.');
      return;
    }

    setLoading(true);
    try {
      const location = await getLocation();
      const weekStats = getWeekStats();
      
      // Generate AI motivation message
      const motivation = await generateMotivation({
        frequency: weekStats.frequency + 1,
        avgGuilt: (weekStats.avgGuilt * weekStats.frequency + guiltRating) / (weekStats.frequency + 1),
        avgRegret: (weekStats.avgRegret * weekStats.frequency + regretRating) / (weekStats.frequency + 1),
        totalCalories: weekStats.totalCalories + selectedCalories,
      });

      await addLog({
        photoUri: photo,
        location,
        guiltRating,
        regretRating,
        estimatedCalories: selectedCalories,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
        aiMessage: motivation,
      });

      setAiMessage(motivation);

      if (currentStreak > 0) {
        setShowStreakBroken(true);
      } else {
        showSuccessMessage();
      }

      resetForm();
    } catch (error) {
      console.error('Error submitting log:', error);
      Alert.alert('Error', 'Failed to save your log. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showSuccessMessage = () => {
    Toast.show({
      type: 'success',
      text1: 'Logged Successfully',
      text2: 'Your junk food has been recorded.',
    });
  };

  const resetForm = () => {
    setPhoto(null);
    setGuiltRating(5);
    setRegretRating(5);
    setSelectedCalories(500);
    setEstimatedCost('');
  };

  const closeStreakBroken = () => {
    setShowStreakBroken(false);
    showSuccessMessage();
  };

  return (
    <LinearGradient
      colors={['#7C3AED', '#3B82F6', '#1E40AF']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Log Junk Food</Text>
          <Text style={styles.subtitle}>Be honest about your choices</Text>

          {/* Photo Section */}
          <View style={styles.photoSection}>
            {photo ? (
              <TouchableOpacity onPress={showImagePicker} style={styles.photoContainer}>
                <Image source={{ uri: photo }} style={styles.photo} />
                <View style={styles.photoOverlay}>
                  <Ionicons name="camera" size={24} color="white" />
                  <Text style={styles.photoOverlayText}>Change Photo</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={showImagePicker} style={styles.photoPlaceholder}>
                <Ionicons name="camera" size={48} color="#94A3B8" />
                <Text style={styles.photoPlaceholderText}>Take or Select Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Ratings Section */}
          <View style={styles.ratingSection}>
            <View style={styles.ratingCard}>
              <Text style={styles.ratingLabel}>Guilt Level: {guiltRating}/10</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={guiltRating}
                onValueChange={setGuiltRating}
                minimumTrackTintColor="#EF4444"
                maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                thumbStyle={styles.sliderThumb}
              />
            </View>

            <View style={styles.ratingCard}>
              <Text style={styles.ratingLabel}>Regret Level: {regretRating}/10</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={regretRating}
                onValueChange={setRegretRating}
                minimumTrackTintColor="#F97316"
                maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                thumbStyle={styles.sliderThumb}
              />
            </View>
          </View>

          {/* Calories Section */}
          <View style={styles.caloriesSection}>
            <Text style={styles.sectionTitle}>Estimated Calories</Text>
            <View style={styles.caloriesGrid}>
              {CALORIE_OPTIONS.map((calories) => (
                <TouchableOpacity
                  key={calories}
                  style={[
                    styles.calorieOption,
                    selectedCalories === calories && styles.calorieOptionSelected,
                  ]}
                  onPress={() => setSelectedCalories(calories)}
                >
                  <Text
                    style={[
                      styles.calorieText,
                      selectedCalories === calories && styles.calorieTextSelected,
                    ]}
                  >
                    {calories === 1200 ? '1200+' : calories}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Cost Section */}
          <View style={styles.costSection}>
            <Text style={styles.sectionTitle}>Estimated Cost (Optional)</Text>
            <TextInput
              style={styles.costInput}
              placeholder="$0.00"
              placeholderTextColor="#94A3B8"
              value={estimatedCost}
              onChangeText={setEstimatedCost}
              keyboardType="numeric"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={submitLog}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Logging...' : 'Submit Log'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      {/* Streak Broken Modal */}
      <Modal
        visible={showStreakBroken}
        transparent
        animationType="fade"
        onRequestClose={closeStreakBroken}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View animation="bounceIn" duration={1000} style={styles.streakBrokenCard}>
            <Ionicons name="heart-broken" size={64} color="#EF4444" />
            <Text style={styles.streakBrokenTitle}>STREAK BROKEN!</Text>
            <Text style={styles.streakBrokenText}>
              You lost your {currentStreak}-day streak.
            </Text>
            <Text style={styles.streakBrokenSubtext}>
              But you can start again right now!
            </Text>
            
            {aiMessage && (
              <View style={styles.aiMessageContainer}>
                <Text style={styles.aiMessageTitle}>Coach Says:</Text>
                <Text style={styles.aiMessageText}>{aiMessage}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={closeStreakBroken}>
              <Text style={styles.closeButtonText}>Start Fresh</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
    marginBottom: 30,
  },
  photoSection: {
    marginBottom: 30,
  },
  photoContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  photo: {
    width: 250,
    height: 250,
    borderRadius: 20,
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 16,
    alignItems: 'center',
  },
  photoOverlayText: {
    color: 'white',
    marginTop: 4,
    fontSize: 14,
  },
  photoPlaceholder: {
    width: 250,
    height: 250,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  photoPlaceholderText: {
    color: '#94A3B8',
    marginTop: 12,
    fontSize: 16,
  },
  ratingSection: {
    marginBottom: 30,
  },
  ratingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  ratingLabel: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderThumb: {
    backgroundColor: 'white',
    width: 24,
    height: 24,
  },
  caloriesSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  caloriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  calorieOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    width: '22%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  calorieOptionSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  calorieText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
  },
  calorieTextSelected: {
    color: 'white',
  },
  costSection: {
    marginBottom: 30,
  },
  costInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  submitButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakBrokenCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    margin: 20,
    maxWidth: 350,
  },
  streakBrokenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EF4444',
    marginTop: 16,
    marginBottom: 8,
  },
  streakBrokenText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4,
  },
  streakBrokenSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  aiMessageContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    width: '100%',
  },
  aiMessageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  aiMessageText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  closeButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});