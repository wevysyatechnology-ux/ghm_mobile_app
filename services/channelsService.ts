import { supabase } from '@/lib/supabase';
import { Channel, ChannelPost } from '@/types/database';

export interface ChannelPostInput {
  channel_id: string;
  title: string;
  content: string;
  post_type: string;
  metadata?: Record<string, any>;
}

export const channelsService = {
  async getAllChannels(): Promise<Channel[]> {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching channels:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching channels:', error);
      return [];
    }
  },

  async getChannelBySlug(slug: string): Promise<Channel | null> {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching channel:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching channel:', error);
      return null;
    }
  },

  async getChannelPosts(channelId: string): Promise<ChannelPost[]> {
    try {
      const { data, error } = await supabase
        .from('channel_posts')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching channel posts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching channel posts:', error);
      return [];
    }
  },

  async createPost(userId: string, post: ChannelPostInput): Promise<ChannelPost | null> {
    try {
      const { data, error } = await supabase
        .from('channel_posts')
        .insert({
          user_id: userId,
          channel_id: post.channel_id,
          title: post.title,
          content: post.content,
          post_type: post.post_type,
          metadata: post.metadata || {},
          status: 'active',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating post:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating post:', error);
      return null;
    }
  },

  async updatePost(
    postId: string,
    updates: Partial<Pick<ChannelPost, 'title' | 'content' | 'status' | 'metadata'>>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('channel_posts')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', postId);

      if (error) {
        console.error('Error updating post:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating post:', error);
      return false;
    }
  },

  async deletePost(postId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('channel_posts').delete().eq('id', postId);

      if (error) {
        console.error('Error deleting post:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  },

  async getUserPosts(userId: string): Promise<ChannelPost[]> {
    try {
      const { data, error } = await supabase
        .from('channel_posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user posts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user posts:', error);
      return [];
    }
  },
};
