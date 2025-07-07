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

  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [recentReplies, setRecentReplies] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  useEffect(() => {
    setUsername(user?.username || '');
    setEmail(user?.email || '');
    // Fetch recent posts and replies for preview
    const fetchActivityPreview = async () => {
      setLoadingActivity(true);
      try {
        const [userPosts, userReplies] = await Promise.all([
          apiRequest('/api/user/posts'),
          apiRequest('/api/user/replies'),
        ]);
        setRecentPosts(userPosts.slice(0, 2));
        setRecentReplies(userReplies.slice(0, 2));
      } catch (e) {
        // ignore for now
      }
      setLoadingActivity(false);
    };
    fetchActivityPreview();

    // Fetch notifications
    const fetchNotifications = async () => {
      setLoadingNotifications(true);
      try {
        const data = await apiRequest('/api/notifications');
        setNotifications(data);
      } catch (e) {
        setNotifications([]);
      }
      setLoadingNotifications(false);
    };
    fetchNotifications();
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
          <Ionicons name="arrow-back" size={26} color={colors.blue} />
        </TouchableOpacity>
        <Text style={{
          color: colors.blue,
          fontSize: fontSizes.heading * 1.1,
          fontWeight: 'bold',
          letterSpacing: 1.2,
          textShadowColor: 'rgba(0,0,0,0.4)',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 6,
        }}>Settings</Text>
      </View>
      {/* Profile Section */}
      <View style={[cardStyle, { backgroundColor: colors.lightGray, marginBottom: spacing.lg, padding: spacing.lg }]}> 
        <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: fontSizes.subheading, marginBottom: spacing.md, letterSpacing: 0.5 }}>Profile</Text>
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
        <TouchableOpacity style={[buttonStyle, { backgroundColor: colors.blue, marginTop: spacing.md }]} onPress={handleSaveProfile} disabled={profileLoading}>
          {profileLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Profile</Text>}
        </TouchableOpacity>
        {profileSuccess && <Text style={styles.success}>Profile updated!</Text>}
        {profileError ? <Text style={styles.error}>{profileError}</Text> : null}
      </View>

      {/* Activity Section */}
      <View style={[cardStyle, { backgroundColor: colors.lightGray, marginBottom: spacing.lg, padding: spacing.lg }]}> 
        <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: fontSizes.subheading, marginBottom: spacing.md, letterSpacing: 0.5 }}>Activity</Text>
        <TouchableOpacity style={styles.activityButton} onPress={() => navigation.navigate('MyActivity')}>
          <Ionicons name="list" size={18} color={colors.blue} style={{ marginRight: 8 }} />
          <Text style={styles.activityButtonText}>View My Posts & Replies</Text>
        </TouchableOpacity>
        {/* Recent Posts Preview */}
        <View style={{ marginTop: spacing.md }}>
          <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: fontSizes.body, marginBottom: spacing.xs }}>Recent Posts</Text>
          {loadingActivity ? <ActivityIndicator color={colors.blue} /> :
            recentPosts.length === 0 ? <Text style={{ color: colors.gray }}>No posts yet.</Text> :
            recentPosts.map((post, idx) => (
              <View key={post.id} style={{ backgroundColor: colors.lightGray, borderRadius: 10, padding: spacing.sm, marginBottom: spacing.xs }}>
                <Text style={{ color: colors.textSecondary, fontSize: fontSizes.small }}>{post.content}</Text>
                <Text style={{ color: colors.gray, fontSize: 11, marginTop: 2 }}>Posted {new Date(post.created_at).toLocaleDateString()}</Text>
              </View>
            ))
          }
          <TouchableOpacity onPress={() => navigation.navigate('MyActivity')} style={{ marginTop: 2 }}>
            <Text style={{ color: colors.blue, fontWeight: 'bold', fontSize: fontSizes.small }}>See all</Text>
          </TouchableOpacity>
        </View>
        {/* Recent Replies Preview */}
        <View style={{ marginTop: spacing.md }}>
          <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: fontSizes.body, marginBottom: spacing.xs }}>Recent Replies</Text>
          {loadingActivity ? <ActivityIndicator color={colors.blue} /> :
            recentReplies.length === 0 ? <Text style={{ color: colors.gray }}>No replies yet.</Text> :
            recentReplies.map((reply, idx) => (
              <View key={reply.id} style={{ backgroundColor: colors.lightGray, borderRadius: 10, padding: spacing.sm, marginBottom: spacing.xs }}>
                <Text style={{ color: colors.textSecondary, fontSize: fontSizes.small }}>{reply.content}</Text>
                <Text style={{ color: colors.gray, fontSize: 11, marginTop: 2 }}>On post #{reply.post_id} • {new Date(reply.created_at).toLocaleDateString()}</Text>
              </View>
            ))
          }
          <TouchableOpacity onPress={() => navigation.navigate('MyActivity')} style={{ marginTop: 2 }}>
            <Text style={{ color: colors.blue, fontWeight: 'bold', fontSize: fontSizes.small }}>See all</Text>
          </TouchableOpacity>
        </View>
        {/* Liked Posts Placeholder */}
        <View style={{ marginTop: spacing.md }}>
          <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: fontSizes.body, marginBottom: spacing.xs }}>Liked Posts</Text>
          <Text style={{ color: colors.gray, fontSize: fontSizes.small }}>Coming soon!</Text>
        </View>
      </View>

      {/* Notifications Section */}
      <View style={[cardStyle, { backgroundColor: colors.lightGray, marginBottom: spacing.lg, padding: spacing.lg }]}> 
        <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: fontSizes.subheading, marginBottom: spacing.md, letterSpacing: 0.5 }}>Notifications</Text>
        {loadingNotifications ? (
          <ActivityIndicator color={colors.blue} />
        ) : notifications.length === 0 ? (
          <Text style={{ color: colors.gray, fontSize: fontSizes.small }}>No notifications yet.</Text>
        ) : notifications.map((notif) => (
          <TouchableOpacity
            key={notif.id}
            style={{ backgroundColor: notif.read ? colors.lightGray : colors.card, borderRadius: 10, padding: spacing.sm, marginBottom: spacing.xs }}
            onPress={async () => {
              // Navigate to CommunityScreen and scroll to the post (if possible)
              navigation.navigate('Community', { postId: notif.post_id });
              // Mark as read in backend
              try {
                await apiRequest(`/api/notifications/${notif.id}/read`, { method: 'PATCH' });
                setNotifications((prev) => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
              } catch {}
            }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: fontSizes.body }}>{notif.message}</Text>
            <Text style={{ color: colors.gray, fontSize: 11, marginTop: 2 }}>{new Date(notif.created_at).toLocaleString()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Security Section */}
      <View style={[cardStyle, { backgroundColor: colors.lightGray, marginBottom: spacing.lg, padding: spacing.lg }]}> 
        <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: fontSizes.subheading, marginBottom: spacing.md, letterSpacing: 0.5 }}>Security</Text>
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
        <TouchableOpacity style={[buttonStyle, { backgroundColor: colors.blue, marginTop: spacing.md }]} onPress={handleChangePassword} disabled={passwordLoading}>
          {passwordLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Change Password</Text>}
        </TouchableOpacity>
        {passwordSuccess && <Text style={styles.success}>Password changed!</Text>}
        {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}
      </View>

      {/* Logout Section */}
      <View style={[cardStyle, { backgroundColor: colors.lightGray, padding: spacing.lg, alignItems: 'center' }]}> 
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: 'transparent', borderColor: colors.border, borderWidth: 1, width: '100%' }]} onPress={handleLogout}>
          <Text style={{ color: colors.accent, fontWeight: 'bold', fontSize: fontSizes.body, textAlign: 'center' }}>Logout</Text>
        </TouchableOpacity>
      </View>
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