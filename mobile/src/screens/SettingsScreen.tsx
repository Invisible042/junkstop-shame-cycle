import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { apiRequest } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen({ navigation }: { navigation: any }) {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    setUsername(user?.username || '');
    setEmail(user?.email || '');
  }, [user]);

  const handleSaveProfile = async () => {
    setProfileLoading(true);
    setProfileSuccess(false);
    setProfileError('');
    try {
      const data = await apiRequest('/api/user/profile', {
        method: 'PUT',
        data: { username, email },
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 2000);
    } catch (e: any) {
      setProfileError(e.message || 'Failed to update profile');
    }
    setProfileLoading(false);
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    setPasswordLoading(true);
    setPasswordSuccess(false);
    setPasswordError('');
    try {
      await apiRequest('/api/user/change-password', {
        method: 'POST',
        data: { old_password: oldPassword, new_password: newPassword },
      });
      setPasswordSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 2000);
    } catch (e: any) {
      setPasswordError(e.message || 'Failed to change password');
    }
    setPasswordLoading(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.cardBg, borderBottomColor: theme.inputBorder }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={[styles.section, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Profile</Text>
          <Text style={[styles.label, { color: theme.text }]}>Username</Text>
          <TextInput
            style={[styles.input, { 
              color: theme.text, 
              backgroundColor: theme.inputBg, 
              borderColor: theme.inputBorder 
            }]}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholderTextColor={theme.textSecondary}
          />
          <Text style={[styles.label, { color: theme.text }]}>Email</Text>
          <TextInput
            style={[styles.input, { 
              color: theme.text, 
              backgroundColor: theme.inputBg, 
              borderColor: theme.inputBorder 
            }]}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor={theme.textSecondary}
          />
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.accent }]} 
            onPress={handleSaveProfile} 
            disabled={profileLoading}
            activeOpacity={0.8}
          >
            {profileLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Save Profile</Text>
            )}
          </TouchableOpacity>
          {profileSuccess && <Text style={[styles.success, { color: theme.accent }]}>Profile updated!</Text>}
          {profileError ? <Text style={[styles.error, { color: '#e74c3c' }]}>{profileError}</Text> : null}
        </View>



        {/* Security Section */}
        <View style={[styles.section, { backgroundColor: theme.cardBg }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Security</Text>
          <Text style={[styles.label, { color: theme.text }]}>Old Password</Text>
          <TextInput
            style={[styles.input, { 
              color: theme.text, 
              backgroundColor: theme.inputBg, 
              borderColor: theme.inputBorder 
            }]}
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry
            placeholderTextColor={theme.textSecondary}
          />
          <Text style={[styles.label, { color: theme.text }]}>New Password</Text>
          <TextInput
            style={[styles.input, { 
              color: theme.text, 
              backgroundColor: theme.inputBg, 
              borderColor: theme.inputBorder 
            }]}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholderTextColor={theme.textSecondary}
          />
          <Text style={[styles.label, { color: theme.text }]}>Confirm New Password</Text>
          <TextInput
            style={[styles.input, { 
              color: theme.text, 
              backgroundColor: theme.inputBg, 
              borderColor: theme.inputBorder 
            }]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholderTextColor={theme.textSecondary}
          />
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.accent }]} 
            onPress={handleChangePassword} 
            disabled={passwordLoading}
            activeOpacity={0.8}
          >
            {passwordLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Change Password</Text>
            )}
          </TouchableOpacity>
          {passwordSuccess && <Text style={[styles.success, { color: theme.accent }]}>Password changed!</Text>}
          {passwordError ? <Text style={[styles.error, { color: '#e74c3c' }]}>{passwordError}</Text> : null}
        </View>

        {/* Logout Section */}
        <View style={[styles.section, { backgroundColor: theme.cardBg }]}>
          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: '#e74c3c' }]} 
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  success: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  error: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

}); 