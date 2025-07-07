import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api, { API_BASE_URL } from '../utils/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { colors, spacing, fontSizes, cardStyle, buttonStyle } from '../styles/theme';
import StreakBadge from '../components/StreakBadge';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './VideoPreviewScreen'; // Update path if you move the type
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';

const { width } = Dimensions.get('window');

interface WeeklyAnalytics {
  total_logs: number;
  avg_guilt_score: number;
  avg_regret_score: number;
  total_cost: number;
  total_calories: number;
  daily_breakdown: Array<{
    date: string;
    count: number;
    avg_guilt: number;
    avg_regret: number;
    total_cost: number;
    total_calories: number;
  }>;
  streak_count: number;
  best_streak: number;
}

interface JunkFoodLog {
  id: number;
  photo_url: string;
  food_type: string;
  guilt_rating: number;
  regret_rating: number;
  estimated_cost: number;
  estimated_calories: number;
  location?: string;
  created_at: string;
  ai_motivation?: string;
}

export default function ProgressScreen() {
  const queryClient = useQueryClient();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const {
    data: analytics,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics,
  } = useQuery({
    queryKey: ['weeklyAnalytics'],
    queryFn: () => api.get('/api/analytics/weekly').then(res => res.data),
  });

  const {
    data: recentLogs,
    isLoading: logsLoading,
    refetch: refetchLogs,
  } = useQuery({
    queryKey: ['recentLogs'],
    queryFn: () => api.get('/api/logs?limit=5'),
  });

  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingMsg, setProcessingMsg] = useState('');

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['weeklyAnalytics'] }),
      queryClient.invalidateQueries({ queryKey: ['recentLogs'] }),
    ]);
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Add a helper to format date+time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
    });
  };

  const getProgressColor = (value: number, max: number) => {
    const percentage = (value / max) * 100;
    if (percentage < 30) return '#4caf50';
    if (percentage < 70) return '#ff9800';
    return '#f44336';
  };

  const handleShare = async () => {
    try {
      setProcessing(true);
      setProcessingMsg('Creating your viral video...');
      // Calculate weekly log count
      const weekLogCount = analytics?.daily_breakdown?.reduce((sum, d) => sum + d.count, 0) || 0;
      const avatarVideoFilename = 'video1.mp4'; // Simplified for now, as getAvatarVideoFilename is removed
      // Call backend to create video share job
      const res = await api.post('/api/video-share', {
        input_data: {
          avatar_video_path: avatarVideoFilename, // just 'video1.mp4'
        },
      });
      const jobId = res.data.id;
      let status = 'pending';
      let videoUrl = null;
      setProcessingMsg('Composing your video...');
      // Poll for job status
      while (status === 'pending') {
        await new Promise(r => setTimeout(r, 2000));
        const jobRes = await api.get(`/api/video-share/${jobId}/status`);
        status = jobRes.data.status;
        if (status === 'complete') {
          videoUrl = jobRes.data.video_url;
          break;
        }
        if (status === 'failed') {
          setProcessing(false);
          alert('Video creation failed: ' + (jobRes.data.error_message || 'Unknown error'));
          return;
        }
      }
      setProcessingMsg('Preparing to share...');
      // Download video to local file (required for Sharing.shareAsync)
      console.log('Video URL to download:', videoUrl);
      if (!videoUrl) {
        setProcessing(false);
        alert('No video URL returned from server.');
        return;
      }
      // If the URL is relative, prepend your backend base URL
      if (!videoUrl.startsWith('http')) {
        videoUrl = API_BASE_URL.replace(/\/$/, '') + videoUrl;
      }
      const localUri = FileSystem.cacheDirectory + 'viral_share.mp4';
      await FileSystem.downloadAsync(videoUrl, localUri);
      setProcessing(false);
      navigation.navigate('VideoPreview', { localUri });
    } catch (e) {
      setProcessing(false);
      alert('Error sharing video: ' + (e.message || e));
    }
  };

  // Add this mapping function near the top of the component
  const foodTypeToEmoji = (foodType: string) => {
    const type = foodType.toLowerCase();
    if (type.includes('pizza')) return '🍕';
    if (type.includes('burger') || type.includes('cheeseburger')) return '🍔';
    if (type.includes('fries') || type.includes('chips')) return '🍟';
    if (type.includes('soda') || type.includes('cola') || type.includes('coke') || type.includes('pepsi')) return '🥤';
    if (type.includes('candy') || type.includes('bar') || type.includes('chocolate')) return '🍫';
    if (type.includes('ice cream') || type.includes('sundae')) return '🍦';
    if (type.includes('donut') || type.includes('doughnut')) return '🍩';
    if (type.includes('cookie')) return '🍪';
    if (type.includes('cake')) return '🍰';
    if (type.includes('popcorn')) return '🍿';
    if (type.includes('hot dog')) return '🌭';
    if (type.includes('taco')) return '🌮';
    if (type.includes('sandwich')) return '🥪';
    if (type.includes('milkshake')) return '🥤';
    return '🧁'; // default junk food emoji
  };

  // When using recentLogs, always default to an array
  const safeRecentLogs = Array.isArray(recentLogs) ? recentLogs : [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Fixed Current Streak Badge and Motivational Subtitle */}
      <View style={{ paddingTop: spacing.xl, paddingBottom: spacing.md, backgroundColor: 'transparent', alignItems: 'center' }}>
        <StreakBadge streak={analytics?.streak_count || 0} />
        <Text style={{ color: colors.textSecondary, fontSize: fontSizes.body, marginTop: spacing.xs, marginBottom: spacing.sm, textAlign: 'center' }}>
          {analytics?.streak_count > 0 ? 'Keep it up! Every day counts.' : 'Start your streak today!'}
        </Text>
      </View>
      {(analyticsLoading || logsLoading) && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }}>
          <ActivityIndicator size="large" color={colors.accent || '#e74c3c'} />
            </View>
      )}
      {!(analyticsLoading || logsLoading) && (
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: 0 }}>
          {(!analytics || !recentLogs) ? (
            <View style={{ alignItems: 'center', marginTop: spacing.xl }}>
              <Text style={{ color: colors.textSecondary, fontSize: fontSizes.body, textAlign: 'center' }}>
                No progress data available yet. Log some junk food to see your stats!
              </Text>
            </View>
          ) : (
            <>
              {/* 3D Reflection Card - now with Three.js scene */}
              <GLView
                style={{ width: '100%', height: 380, borderRadius: 36, backgroundColor: '#181a2a', overflow: 'hidden', marginBottom: spacing.lg }}
                onContextCreate={async (gl) => {
                  const { drawingBufferWidth: w, drawingBufferHeight: h } = gl;
                  const renderer = new Renderer({ gl });
                  renderer.setSize(w, h);
                  renderer.setClearColor(0x181a2a, 1);
                  const scene = new THREE.Scene();
                  scene.fog = new THREE.Fog(0x181a2a, 10, 50);
                  const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
                  camera.position.z = 5;
                  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
                  scene.add(ambientLight);
                  const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
                  dirLight.position.set(5, 10, 7.5);
                  scene.add(dirLight);
                  // --- Avatar Placeholder: Spinning Cube ---
                  const geometry = new THREE.BoxGeometry(1, 1, 1);
                  const material = new THREE.MeshStandardMaterial({ color: 0x00c6fb });
                  const cube = new THREE.Mesh(geometry, material);
                  scene.add(cube);
                  // --- Junk Food Items: 3D Spheres as Placeholders ---
                  const junkMeshes = [];
                  const logCount = Array.isArray(recentLogs) ? recentLogs.length : 0;
                  for (let i = 0; i < logCount; i++) {
                    // Position items in a semi-circle around the avatar
                    const angle = (Math.PI / (logCount + 1)) * (i + 1) - Math.PI / 2;
                    const radius = 2.5;
                    const x = Math.cos(angle) * radius;
                    const y = -1.2;
                    const z = Math.sin(angle) * radius;
                    // Use a different color for each food type (placeholder)
                    const log = recentLogs[i];
                    let color = 0xffc300; // default yellow
                    if (log.food_type.toLowerCase().includes('pizza')) color = 0xffa500;
                    if (log.food_type.toLowerCase().includes('burger')) color = 0x8d5524;
                    if (log.food_type.toLowerCase().includes('fries')) color = 0xffe066;
                    if (log.food_type.toLowerCase().includes('soda')) color = 0x00bfff;
                    if (log.food_type.toLowerCase().includes('candy')) color = 0xff69b4;
                    if (log.food_type.toLowerCase().includes('ice cream')) color = 0xfaf0e6;
                    if (log.food_type.toLowerCase().includes('donut')) color = 0xf7cac9;
                    if (log.food_type.toLowerCase().includes('cookie')) color = 0xd2b48c;
                    if (log.food_type.toLowerCase().includes('cake')) color = 0xf5e6ff;
                    // TODO: Swap for custom 3D models or textures per food type
                    const sphereGeo = new THREE.SphereGeometry(0.35, 32, 32);
                    const sphereMat = new THREE.MeshStandardMaterial({ color });
                    const mesh = new THREE.Mesh(sphereGeo, sphereMat);
                    mesh.position.set(x, y, z);
                    scene.add(mesh);
                    junkMeshes.push(mesh);
                  }
                  // --- Animate falling in for new items (simple drop effect) ---
                  let dropProgress = 0;
                  const dropDuration = 40; // frames
                  const animate = () => {
                    requestAnimationFrame(animate);
                    cube.rotation.x += 0.01;
                    cube.rotation.y += 0.01;
                    // Animate the last junk item dropping in
                    if (junkMeshes.length > 0 && dropProgress < dropDuration) {
                      const mesh = junkMeshes[junkMeshes.length - 1];
                      mesh.position.y = -1.2 + (2.5 * (1 - dropProgress / dropDuration));
                      dropProgress++;
                    }
                    renderer.render(scene, camera);
                    gl.endFrameEXP();
                  };
                  animate();
                }}
              />
              {/* Share Progress Button */}
              <TouchableOpacity onPress={handleShare} style={{ alignSelf: 'center', backgroundColor: '#00c6fb', borderRadius: 22, paddingVertical: 10, paddingHorizontal: 28, flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg, shadowColor: '#00c6fb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 8, elevation: 4 }}>
                <Ionicons name="share-social-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 16, color: '#fff', fontWeight: 'bold' }}>Share Progress</Text>
              </TouchableOpacity>
              {/* Processing Modal */}
              <Modal visible={processing} transparent animationType="fade">
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center' }}>
                  <View style={{ backgroundColor: '#23263a', borderRadius: 18, padding: 32, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12 }}>
                    <ActivityIndicator size="large" color={colors.accent || '#e74c3c'} />
                    <Text style={{ color: colors.text, fontSize: 18, marginTop: 18, textAlign: 'center' }}>{processingMsg || 'Processing...'}</Text>
            </View>
          </View>
              </Modal>

              {/* Summary Cards */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: spacing.lg }}>
                <View style={[cardStyle, { width: '48%', marginBottom: spacing.md, alignItems: 'center', backgroundColor: colors.lightGray }]}> 
                  <Ionicons name="flame" size={24} color="#ffd700" style={{ marginBottom: 4 }} />
                  <Text style={{ color: '#ffd700', fontWeight: 'bold', fontSize: 24 }}>{analytics.best_streak || 0}</Text>
                  <Text style={{ color: '#fff', fontSize: 12 }}>Best Streak</Text>
              </View>
                <View style={[cardStyle, { width: '48%', marginBottom: spacing.md, alignItems: 'center', backgroundColor: colors.lightGray }]}> 
                  <Ionicons name="cash" size={24} color="#27ae60" style={{ marginBottom: 4 }} />
                  <Text style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 24 }}>${analytics.total_cost?.toFixed(0) || 0}</Text>
                  <Text style={{ color: '#fff', fontSize: 12 }}>Money Saved</Text>
            </View>
                <View style={[cardStyle, { width: '48%', marginBottom: spacing.md, alignItems: 'center', backgroundColor: colors.lightGray }]}> 
                  <Ionicons name="journal" size={24} color="#2196f3" style={{ marginBottom: 4 }} />
                  <Text style={{ color: '#2196f3', fontWeight: 'bold', fontSize: 24 }}>{analytics.total_logs || 0}</Text>
                  <Text style={{ color: '#fff', fontSize: 12 }}>Total Logs</Text>
          </View>
                <View style={[cardStyle, { width: '48%', marginBottom: spacing.md, alignItems: 'center', backgroundColor: colors.lightGray }]}> 
                  <Ionicons name="bar-chart" size={24} color="#ff9800" style={{ marginBottom: 4 }} />
                  <Text style={{ color: '#ff9800', fontWeight: 'bold', fontSize: 24 }}>{analytics.avg_guilt_score?.toFixed(1) || 0}</Text>
                  <Text style={{ color: '#fff', fontSize: 12 }}>Avg Guilt</Text>
                </View>
                <View style={[cardStyle, { width: '48%', marginBottom: spacing.md, alignItems: 'center', backgroundColor: colors.lightGray }]}> 
                  <Ionicons name="heart" size={24} color="#9b59b6" style={{ marginBottom: 4 }} />
                  <Text style={{ color: '#9b59b6', fontWeight: 'bold', fontSize: 24 }}>{analytics.avg_regret_score?.toFixed(1) || 0}</Text>
                  <Text style={{ color: '#fff', fontSize: 12 }}>Avg Regret</Text>
              </View>
                <View style={[cardStyle, { width: '48%', marginBottom: spacing.md, alignItems: 'center', backgroundColor: colors.lightGray }]}> 
                  <Ionicons name="nutrition" size={24} color="#00b894" style={{ marginBottom: 4 }} />
                  <Text style={{ color: '#00b894', fontWeight: 'bold', fontSize: 24 }}>{analytics.total_calories || 0}</Text>
                  <Text style={{ color: '#fff', fontSize: 12 }}>Total Calories</Text>
                </View>
              </View>

              {/* Simple Bar Chart for Daily Breakdown */}
              <LinearGradient
                colors={["#23263a", "#3a3ad6", "#7b2ff2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 28,
                  marginBottom: spacing.lg,
                  minHeight: 200,
                  padding: spacing.lg,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.22,
                  shadowRadius: 16,
                  elevation: 8,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                }}
              >
                <View style={{
                  ...StyleSheet.absoluteFillObject,
                  backgroundColor: 'rgba(30,32,60,0.55)',
                  borderRadius: 28,
                  zIndex: 0,
                }} />
                <Text style={{
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: 22,
                  marginBottom: 2,
                  textAlign: 'center',
                  letterSpacing: 0.5,
                  textShadowColor: '#000',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 4,
                  zIndex: 1,
                }}>
                  This Week
                </Text>
                <Text style={{
                  color: '#00c6fb',
                  fontSize: 13,
                  textAlign: 'center',
                  marginBottom: 10,
                  fontStyle: 'italic',
                  opacity: 0.85,
                  zIndex: 1,
                }}>
                  Keep up the momentum!
                </Text>
                {/* Summary Row */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10, zIndex: 1 }}>
                  <Ionicons name="calendar" size={16} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={{ color: '#fff', fontSize: 13, marginRight: 12 }}>Total logs: {analytics.total_logs || 0}</Text>
                  <Ionicons name="star" size={15} color="#ffd700" style={{ marginRight: 4 }} />
                  <Text style={{ color: '#ffd700', fontSize: 13 }}>
                    Best day: {analytics.daily_breakdown && analytics.daily_breakdown.length > 0 ? Math.max(...analytics.daily_breakdown.map(d => d.count)) : 0} logs
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 100, minHeight: 100, maxHeight: 100, paddingHorizontal: 2, zIndex: 1 }}>
                  {analytics.daily_breakdown?.map((day, idx) => {
                    const max = Math.max(...analytics.daily_breakdown.map(d => d.count));
                    const barHeight = max ? Math.min((day.count / max) * 80, 80) : 0;
                    const barColor = '#00c6fb';
                    // Get weekday abbreviation
                    const dateObj = new Date(day.date);
                    const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                    return (
                      <View key={idx} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                        <View style={{
                          height: barHeight,
                          width: 18,
                          backgroundColor: barColor,
                          borderTopLeftRadius: 12,
                          borderTopRightRadius: 12,
                          marginBottom: 4,
                          shadowColor: barColor,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.45,
                          shadowRadius: 8,
                          elevation: 5,
                        }} />
                        <Text style={{ fontSize: 12, color: barColor, fontWeight: 'bold', marginTop: 2 }}>{weekday}</Text>
                      </View>
                    );
                  })}
                </View>
              </LinearGradient>

              {/* Recent Logs */}
              <View style={{
                backgroundColor: colors.lightGray,
                borderRadius: 24,
                marginBottom: spacing.lg,
                padding: spacing.md,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.08)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.14,
                shadowRadius: 14,
                elevation: 7,
                overflow: 'hidden',
              }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20, marginBottom: 12, textAlign: 'center', letterSpacing: 0.5, textShadowColor: '#000', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }}>Recent Logs</Text>
                {safeRecentLogs.length === 0 ? (
                  <View style={{ alignItems: 'center', padding: spacing.lg }}>
                    <Ionicons name="cloud-outline" size={48} color="#00c6fb" style={{ marginBottom: 8 }} />
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>No logs yet.</Text>
                    <Text style={{ color: '#b2f7ef', fontSize: 13, fontStyle: 'italic', textAlign: 'center' }}>Start logging to see your journey take shape!</Text>
                  </View>
                ) : (
                  safeRecentLogs.map((log, idx) => (
                    <View key={log.id || idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: idx === safeRecentLogs.length - 1 ? 0 : 18 }}>
                      {log.photo_url ? (
                        <View style={{
                          width: 52,
                          height: 52,
                          borderRadius: 16,
                          borderWidth: 2,
                          borderColor: '#00c6fb',
                          backgroundColor: '#222',
                          marginRight: 16,
                          overflow: 'hidden',
                        }}>
                          <Image source={{ uri: log.photo_url }} style={{ width: '100%', height: '100%', borderRadius: 13 }} />
                        </View>
                      ) : (
                        <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: colors.lightGray, marginRight: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#444' }}>
                          <Ionicons name="fast-food-outline" size={28} color="#666" />
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, marginBottom: 2, letterSpacing: 0.2 }}>{log.food_type}</Text>
                        <Text style={{ color: '#b2f7ef', fontSize: 13, fontWeight: '600', marginBottom: 2 }}>{formatDateTime(log.created_at)}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                          <Text style={{ color: '#fff', fontSize: 13, marginRight: 10 }}>Guilt: {log.guilt_rating}</Text>
                          <Text style={{ color: '#fff', fontSize: 13, marginRight: 10 }}>Regret: {log.regret_rating}</Text>
                          <Text style={{ color: '#fff', fontSize: 13 }}>${log.estimated_cost?.toFixed(2) || 0}</Text>
                        </View>
                        {log.ai_motivation && (
                          <Text style={{ color: '#ffd700', fontSize: 12, fontStyle: 'italic', marginTop: 2 }}>{log.ai_motivation}</Text>
                        )}
                      </View>
                    </View>
                  )).reduce((acc, el, idx, arr) => acc.concat(el, idx < arr.length - 1 ? <View key={'divider-' + idx} style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 8, borderRadius: 1 }} /> : null), [])
                )}
              </View>
            </>
              )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 30,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  summaryCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    paddingTop: 30,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    margin: 5,
    width: '45%',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  chartSection: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 80,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 5,
  },
  bar: {
    width: 20,
    borderRadius: 10,
  },
  barLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  barValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  trendsSection: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  trendCard: {
    marginBottom: 20,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  trendBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  trendProgress: {
    height: '100%',
    borderRadius: 4,
  },
  trendValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
    textAlign: 'right',
  },
  recentSection: {
    margin: 20,
  },
  logCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logFood: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  logDate: {
    fontSize: 12,
    color: '#666',
  },
  logStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  logStat: {
    alignItems: 'center',
  },
  logStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  logStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  logLocation: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  streakScrollContainer: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  streakStage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  streakCard: {
    width: 200,
    height: 260,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  streakCardLocked: {
    opacity: 0.3,
  },
  streakImage: {
    width: '100%',
    height: 185,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  streakImageBlurred: {
    opacity: 0.05,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  streakCardContent: {
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 75,
  },
  streakLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
    color: 'rgba(51, 51, 51, 0.8)',
  },
  streakLabelLocked: {
    color: 'rgba(153, 153, 153, 0.6)',
  },
  streakLabelUnlocked: {
    color: 'rgba(51, 51, 51, 0.8)',
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'rgba(51, 51, 51, 0.9)',
  },
  streakTitleLocked: {
    color: 'rgba(153, 153, 153, 0.7)',
  },
  streakTitleUnlocked: {
    color: 'rgba(51, 51, 51, 0.9)',
  },
  arrowContainer: {
    marginHorizontal: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakMotivation: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 14,
    paddingHorizontal: 4,
  },
  streakMotivationUnlocked: {
    color: '#166534',
    fontWeight: '600',
  },
  streakMotivationLocked: {
    color: '#999',
    fontStyle: 'italic',
  },
  progressIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressDotActive: {
    backgroundColor: colors.accent,
  },
  progressDotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  leftArrowHint: {
    position: 'absolute',
    left: spacing.sm,
    top: '50%',
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },
  lockMessage: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
  },
});