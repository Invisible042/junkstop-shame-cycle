import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { apiRequest } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes, cardStyle, buttonStyle } from '../styles/theme';

export default function SettingsScreen({ navigation }: { navigation: any }) {
  const { user, logout } = useAuth();
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
    <ScrollView contentContainerStyle={{ padding: spacing.lg, backgroundColor: colors.background, flexGrow: 1 }}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 10 }}>
          <Ionicons name="arrow-back" size={26} color={colors.accent} />
        </TouchableOpacity>
        <Text style={{
          color: colors.accent,
          fontSize: fontSizes.heading * 1.1,
          fontWeight: 'bold',
          letterSpacing: 1.2,
          textShadowColor: 'rgba(0,0,0,0.4)',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 6,
        }}>Profile Settings</Text>
      </View>
      <View style={[cardStyle, { backgroundColor: '#23263acc', marginBottom: spacing.lg }]}> 
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TouchableOpacity style={[buttonStyle, { backgroundColor: colors.accent, marginTop: spacing.md }]} onPress={handleSaveProfile} disabled={profileLoading}>
          {profileLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Profile</Text>}
        </TouchableOpacity>
        {profileSuccess && <Text style={styles.success}>Profile updated!</Text>}
        {profileError ? <Text style={styles.error}>{profileError}</Text> : null}
        <TouchableOpacity style={styles.activityButton} onPress={() => navigation.navigate('MyActivity')}>
          <Ionicons name="list" size={18} color={colors.accent} style={{ marginRight: 8 }} />
          <Text style={styles.activityButtonText}>View My Posts & Replies</Text>
        </TouchableOpacity>
      </View>
      <View style={[cardStyle, { backgroundColor: '#23263acc', marginBottom: spacing.lg }]}> 
        <Text style={[styles.title, { color: colors.text, marginTop: 0 }]}>Change Password</Text>
        <Text style={styles.label}>Old Password</Text>
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
          value={oldPassword}
          onChangeText={setOldPassword}
          secureTextEntry
        />
        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />
        <Text style={styles.label}>Confirm New Password</Text>
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <TouchableOpacity style={[buttonStyle, { backgroundColor: colors.accent, marginTop: spacing.md }]} onPress={handleChangePassword} disabled={passwordLoading}>
          {passwordLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Change Password</Text>}
        </TouchableOpacity>
        {passwordSuccess && <Text style={styles.success}>Password changed!</Text>}
        {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}
      </View>
      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.accent }]} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#222',
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  saveButton: {
    backgroundColor: '#8e44ad',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 18,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  success: {
    color: '#27ae60',
    marginTop: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  error: {
    color: '#e74c3c',
    marginTop: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 40,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  activityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8e44ad',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#f8f6ff',
  },
  activityButtonText: {
    color: '#8e44ad',
    fontWeight: 'bold',
    fontSize: 15,
  },
}); 