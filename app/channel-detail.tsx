import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Plus } from 'lucide-react-native';
import { channelsService } from '@/services/channelsService';
import { Channel, ChannelPost } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '@/constants/theme';

export default function ChannelDetailScreen() {
  const { channelId, channelSlug } = useLocalSearchParams();
  const { user } = useAuth();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [posts, setPosts] = useState<ChannelPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadChannelData();
  }, [channelSlug]);

  const loadChannelData = async () => {
    try {
      setLoading(true);
      const channelData = await channelsService.getChannelBySlug(channelSlug as string);
      if (channelData) {
        setChannel(channelData);
        const postsData = await channelsService.getChannelPosts(channelData.id);
        setPosts(postsData);
      }
    } catch (error) {
      console.error('Error loading channel data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!user || !channel || !newPostTitle.trim()) {
      Alert.alert('Error', 'Please fill in the title');
      return;
    }

    try {
      setCreating(true);
      const post = await channelsService.createPost(user.id, {
        channel_id: channel.id,
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
        post_type: channel.slug,
      });

      if (post) {
        setPosts([post, ...posts]);
        setNewPostTitle('');
        setNewPostContent('');
        setShowCreatePost(false);
        Alert.alert('Success', 'Post created successfully');
      } else {
        Alert.alert('Error', 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!channel) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Channel not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>{channel.icon}</Text>
          <Text style={styles.headerTitle}>{channel.name}</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowCreatePost(!showCreatePost)}
          style={styles.iconButton}
        >
          <Plus size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.descriptionCard}>
          <Text style={styles.description}>{channel.description}</Text>
        </View>

        {showCreatePost && (
          <View style={styles.createPostCard}>
            <Text style={styles.createPostTitle}>Create New Post</Text>
            <TextInput
              style={styles.input}
              placeholder="Title"
              placeholderTextColor={COLORS.textSecondary}
              value={newPostTitle}
              onChangeText={setNewPostTitle}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              placeholderTextColor={COLORS.textSecondary}
              value={newPostContent}
              onChangeText={setNewPostContent}
              multiline
              numberOfLines={4}
            />
            <View style={styles.createPostButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => {
                  setShowCreatePost(false);
                  setNewPostTitle('');
                  setNewPostContent('');
                }}
              >
                <Text style={styles.buttonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={handleCreatePost}
                disabled={creating}
              >
                <Text style={styles.buttonPrimaryText}>
                  {creating ? 'Creating...' : 'Create Post'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.postsSection}>
          <Text style={styles.sectionTitle}>Posts ({posts.length})</Text>
          {posts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No posts yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Be the first to create a post in this channel
              </Text>
            </View>
          ) : (
            posts.map((post) => (
              <View key={post.id} style={styles.postCard}>
                <Text style={styles.postTitle}>{post.title}</Text>
                {post.content && <Text style={styles.postContent}>{post.content}</Text>}
                <Text style={styles.postDate}>
                  {new Date(post.created_at).toLocaleDateString()}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl + 20,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
  },
  descriptionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  createPostCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  createPostTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  createPostButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  button: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonSecondary: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buttonPrimaryText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.onPrimary,
  },
  buttonSecondaryText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  postsSection: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  emptyState: {
    padding: SPACING.xl * 2,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  emptyStateSubtext: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  postCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  postTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  postContent: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  postDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textTertiary,
  },
});
