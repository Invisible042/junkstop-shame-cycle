import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CommunityPost {
  id: number;
  content: string;
  photo_url?: string;
  likes_count: number;
  created_at: string;
  liked_by_user: boolean;
}

export default function CommunityScreen() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likeClickCounts, setLikeClickCounts] = useState<{ [postId: number]: number }>({});
  const [likeDisabled, setLikeDisabled] = useState<{ [postId: number]: boolean }>({});
  const likeTimeouts = useRef<{ [postId: number]: NodeJS.Timeout }>({});
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [replyingToPost, setReplyingToPost] = useState<CommunityPost | null>(null);
  const [replyInput, setReplyInput] = useState('');
  const [replyIsAnonymous, setReplyIsAnonymous] = useState(true);
  const [replies, setReplies] = useState<any[]>([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [replySubmitting, setReplySubmitting] = useState(false);
  const STORAGE_KEY = '@junkstop/community_posts';

  const fetchPosts = async () => {
    try {
      const data = await apiRequest('/api/community/posts?limit=20');
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const submitPost = async () => {
    if (!newPostContent.trim()) {
      Alert.alert('Error', 'Please write something before posting');
      return;
    }

    setIsSubmitting(true);
    try {
      const newPost = await apiRequest('/api/community/posts', {
        method: 'POST',
        data: {
          content: newPostContent,
          is_anonymous: isAnonymous,
        },
      });

      setPosts((prev) => [newPost, ...prev]);
      setNewPostContent('');
      setShowNewPost(false);
      Alert.alert('Success', 'Your post has been shared with the community!');
    } catch (error) {
      Alert.alert('Error', 'Failed to post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId: number, liked: boolean) => {
    // Throttling logic
    if (likeDisabled[postId]) return;
    setLikeClickCounts((prev) => {
      const count = (prev[postId] || 0) + 1;
      if (count >= 4) {
        setLikeDisabled((prevDisabled) => ({ ...prevDisabled, [postId]: true }));
        // Set timeout to re-enable after 10 seconds
        if (likeTimeouts.current[postId]) clearTimeout(likeTimeouts.current[postId]);
        likeTimeouts.current[postId] = setTimeout(() => {
          setLikeDisabled((prevDisabled) => ({ ...prevDisabled, [postId]: false }));
          setLikeClickCounts((prevCounts) => ({ ...prevCounts, [postId]: 0 }));
        }, 10000);
      }
      return { ...prev, [postId]: count };
    });

    // Optimistically update UI
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes_count: Math.max(0, post.likes_count + (liked ? -1 : 1)),
              liked_by_user: !liked,
            }
          : post
      )
    );

    try {
      let response;
      if (liked) {
        response = await apiRequest(`/api/community/posts/${postId}/like`, {
          method: 'DELETE',
        });
      } else {
        response = await apiRequest(`/api/community/posts/${postId}/like`, {
          method: 'POST',
        });
      }
      // Optionally, update with backend count in case of drift
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, likes_count: Math.max(0, response.likes_count) }
            : post
        )
      );
    } catch (error) {
      // Do nothing, leave UI as is until refresh
    }
  };

  const openReplyModal = async (post: CommunityPost) => {
    setReplyingToPost(post);
    setReplyModalVisible(true);
    setReplyInput('');
    setReplyIsAnonymous(true);
    setRepliesLoading(true);
    try {
      const data = await apiRequest(`/api/community/posts/${post.id}/replies`);
      setReplies(data);
    } catch (e) {
      setReplies([]);
    } finally {
      setRepliesLoading(false);
    }
  };

  const submitReply = async () => {
    if (!replyInput.trim() || !replyingToPost) return;
    setReplySubmitting(true);
    // Optimistically update UI
    const newReply = {
      id: Date.now(),
      post_id: replyingToPost.id,
      user_id: 'me', // or current user id if available
      content: replyInput,
      is_anonymous: replyIsAnonymous,
      created_at: new Date().toISOString(),
      optimistic: true,
    };
    setReplies((prev) => [...prev, newReply]);
    setReplyInput('');
    try {
      const data = await apiRequest(`/api/community/posts/${replyingToPost.id}/replies`, {
        method: 'POST',
        data: { content: newReply.content, is_anonymous: newReply.is_anonymous },
      });
      // Replace optimistic reply with real one
      setReplies((prev) => prev.map(r => r.id === newReply.id ? data : r));
    } catch (e) {
      // Optionally show error or remove optimistic reply
    }
    setReplySubmitting(false);
  };

  // Sanitize posts to ensure UI consistency
  const sanitizePosts = (posts: CommunityPost[]) =>
    posts.map(post => ({
      ...post,
      liked_by_user: post.likes_count > 0 ? post.liked_by_user : false,
      likes_count: Math.max(0, post.likes_count),
    }));

  // Load posts from AsyncStorage on mount
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const cached = await AsyncStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          setPosts(sanitizePosts(parsed));
        } else {
          // No cache, fetch from backend
          await fetchAndCachePosts();
        }
      } catch (e) {
        // Fallback to fetch if storage fails
        await fetchAndCachePosts();
      }
    };
    loadPosts();
  }, []);

  // Fetch from backend and update AsyncStorage
  const fetchAndCachePosts = async () => {
    try {
      const data = await apiRequest('/api/community/posts?limit=20');
      const sanitized = sanitizePosts(data);
      setPosts(sanitized);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#8e44ad', '#9b59b6']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Community</Text>
        <Text style={styles.headerSubtitle}>Share your journey with others</Text>
        <TouchableOpacity
          style={styles.newPostButton}
          onPress={() => setShowNewPost(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.newPostButtonText}>Share</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.postsContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {posts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No posts yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Be the first to share your story with the community
            </Text>
          </View>
        ) : (
          posts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.authorInfo}>
                  <Ionicons name="person-circle" size={32} color="#8e44ad" />
                  <Text style={styles.authorName}>Anonymous User</Text>
                </View>
                <Text style={styles.postTime}>{formatDate(post.created_at)}</Text>
              </View>

              <Text style={styles.postContent}>{post.content}</Text>

              <View style={styles.postActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleLike(post.id, post.liked_by_user)}
                  disabled={likeDisabled[post.id]}
                >
                  <Ionicons name={post.liked_by_user ? "heart" : "heart-outline"} size={20} color={post.liked_by_user ? "#e74c3c" : "#666"} />
                  <Text style={styles.actionText}>{post.likes_count}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => openReplyModal(post)}>
                  <Ionicons name="chatbubble-outline" size={20} color="#666" />
                  <Text style={styles.actionText}>Reply</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="share-outline" size={20} color="#666" />
                  <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showNewPost}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowNewPost(false)}>
              <Text style={styles.modalCancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Post</Text>
            <TouchableOpacity
              onPress={submitPost}
              disabled={isSubmitting || !newPostContent.trim()}
            >
              <Text style={[
                styles.modalPostButton,
                (!newPostContent.trim() || isSubmitting) && styles.modalPostButtonDisabled
              ]}>
                {isSubmitting ? 'Posting...' : 'Post'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.postInput}
              multiline
              placeholder="Share your thoughts, struggles, or victories..."
              placeholderTextColor="#999"
              value={newPostContent}
              onChangeText={setNewPostContent}
              autoFocus
            />

            <View style={styles.postOptions}>
              <TouchableOpacity
                style={styles.anonymousToggle}
                onPress={() => setIsAnonymous(!isAnonymous)}
              >
                <Ionicons
                  name={isAnonymous ? "checkmark-circle" : "ellipse-outline"}
                  size={24}
                  color={isAnonymous ? "#8e44ad" : "#ccc"}
                />
                <Text style={styles.anonymousText}>Post anonymously</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.guidelines}>
              <Text style={styles.guidelinesTitle}>Community Guidelines</Text>
              <Text style={styles.guidelinesText}>
                • Be supportive and encouraging
              </Text>
              <Text style={styles.guidelinesText}>
                • Share your experiences honestly
              </Text>
              <Text style={styles.guidelinesText}>
                • No judgment or criticism of others
              </Text>
              <Text style={styles.guidelinesText}>
                • Keep personal information private
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Reply Modal */}
      <Modal
        visible={replyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setReplyModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center' }}>
          <View style={{ backgroundColor: '#fff', margin: 20, borderRadius: 12, padding: 20, maxHeight: '80%' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Replies</Text>
            {repliesLoading ? (
              <ActivityIndicator size="small" color="#8e44ad" />
            ) : (
              <ScrollView style={{ maxHeight: 200, marginBottom: 10 }}>
                {replies.length === 0 ? (
                  <Text style={{ color: '#888', textAlign: 'center', marginVertical: 10 }}>No replies yet</Text>
                ) : (
                  replies.map((reply) => (
                    <View key={reply.id} style={{ marginBottom: 12, backgroundColor: '#f8f8fa', borderRadius: 8, padding: 10 }}>
                      <Text style={{ fontWeight: '600', color: '#333' }}>{reply.is_anonymous ? 'Anonymous' : `User ${reply.user_id}`}</Text>
                      <Text style={{ color: '#444', marginVertical: 2 }}>{reply.content}</Text>
                      <Text style={{ fontSize: 12, color: '#aaa' }}>{formatDate(reply.created_at)}</Text>
                    </View>
                  ))
                )}
              </ScrollView>
            )}
            <TextInput
              style={{ borderColor: '#ccc', borderWidth: 1, borderRadius: 8, padding: 8, marginBottom: 10, minHeight: 40 }}
              placeholder="Write a reply..."
              value={replyInput}
              onChangeText={setReplyInput}
              editable={!replySubmitting}
              multiline
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <TouchableOpacity onPress={() => setReplyIsAnonymous(!replyIsAnonymous)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name={replyIsAnonymous ? 'checkmark-circle' : 'ellipse-outline'} size={20} color={replyIsAnonymous ? '#8e44ad' : '#ccc'} />
                <Text style={{ marginLeft: 6 }}>Reply anonymously</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={() => setReplyModalVisible(false)} style={{ marginRight: 16 }}>
                <Text style={{ color: '#888' }}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={submitReply}
                disabled={replySubmitting || !replyInput.trim()}
                style={{ backgroundColor: '#8e44ad', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{replySubmitting ? 'Posting...' : 'Reply'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    position: 'absolute',
    bottom: 40,
    left: 20,
  },
  newPostButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  newPostButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 5,
  },
  postsContainer: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 15,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
    paddingHorizontal: 40,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  postTime: {
    fontSize: 12,
    color: '#999',
  },
  postContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 15,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalCancelButton: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalPostButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8e44ad',
  },
  modalPostButtonDisabled: {
    color: '#ccc',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  postInput: {
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
    minHeight: 150,
    marginBottom: 20,
  },
  postOptions: {
    marginBottom: 30,
  },
  anonymousToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  anonymousText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  guidelines: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  guidelinesText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});