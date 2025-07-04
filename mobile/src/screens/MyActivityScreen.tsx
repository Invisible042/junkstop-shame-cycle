import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { apiRequest } from '../utils/api';
import { Ionicons } from '@expo/vector-icons';

export default function MyActivityScreen({ navigation }: { navigation: any }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<{ [key: string]: boolean }>({});

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [userPosts, userReplies] = await Promise.all([
        apiRequest('/api/user/posts'),
        apiRequest('/api/user/replies'),
      ]);
      setPosts(userPosts);
      setReplies(userReplies);
    } catch (e: any) {
      setError(e.message || 'Failed to load activity');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeletePost = async (postId: number) => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          setDeleting((prev) => ({ ...prev, ['post-' + postId]: true }));
          try {
            await apiRequest(`/api/community/posts/${postId}`, { method: 'DELETE' });
            setPosts((prev) => prev.filter((p) => p.id !== postId));
          } catch (e) {
            Alert.alert('Error', 'Failed to delete post');
          }
          setDeleting((prev) => ({ ...prev, ['post-' + postId]: false }));
        }
      }
    ]);
  };

  const handleDeleteReply = async (replyId: number) => {
    Alert.alert('Delete Reply', 'Are you sure you want to delete this reply?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          setDeleting((prev) => ({ ...prev, ['reply-' + replyId]: true }));
          try {
            await apiRequest(`/api/community/replies/${replyId}`, { method: 'DELETE' });
            setReplies((prev) => prev.filter((r) => r.id !== replyId));
          } catch (e) {
            Alert.alert('Error', 'Failed to delete reply');
          }
          setDeleting((prev) => ({ ...prev, ['reply-' + replyId]: false }));
        }
      }
    ]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>My Activity</Text>
      {loading ? <ActivityIndicator size="large" color="#8e44ad" style={{ marginTop: 40 }} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={styles.sectionTitle}>My Posts</Text>
      {posts.length === 0 && !loading ? <Text style={styles.empty}>No posts yet.</Text> : null}
      {posts.map((post) => (
        <View key={post.id} style={styles.card}>
          <Text style={styles.cardContent}>{post.content}</Text>
          <Text style={styles.cardMeta}>Posted on {formatDate(post.created_at)}</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeletePost(post.id)}
            disabled={deleting['post-' + post.id]}
          >
            <Ionicons name="trash" size={18} color="#fff" />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      ))}
      <Text style={styles.sectionTitle}>My Replies</Text>
      {replies.length === 0 && !loading ? <Text style={styles.empty}>No replies yet.</Text> : null}
      {replies.map((reply) => (
        <View key={reply.id} style={styles.card}>
          <Text style={styles.cardContent}>{reply.content}</Text>
          <Text style={styles.cardMeta}>On post #{reply.post_id} • {formatDate(reply.created_at)}</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteReply(reply.id)}
            disabled={deleting['reply-' + reply.id]}
          >
            <Ionicons name="trash" size={18} color="#fff" />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#222',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
    color: '#8e44ad',
  },
  card: {
    backgroundColor: '#fafafa',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  cardContent: {
    fontSize: 15,
    color: '#333',
    marginBottom: 6,
  },
  cardMeta: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  error: {
    color: '#e74c3c',
    textAlign: 'center',
    marginVertical: 12,
  },
  empty: {
    color: '#888',
    textAlign: 'center',
    marginBottom: 12,
  },
}); 