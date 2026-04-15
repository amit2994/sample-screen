import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Comment {
  id: string;
  module_name: string;
  screen_id: string;
  field_id?: string;
  field_label?: string;
  section_name?: string;
  element_id?: string;
  x_position: number;
  y_position: number;
  comment_text: string;
  created_by: string;
  created_at: string;
  status: 'open' | 'resolved';
  parent_id?: string;
  replies?: Comment[];
}

// Check if Supabase is configured (client is null when not configured)
const isSupabaseConfigured = () => supabase !== null;

// In-memory fallback store when Supabase is not configured
let localComments: Comment[] = [];

export function useComments(screenId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase!
          .from('comments')
          .select('*')
          .eq('screen_id', screenId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setComments(data || []);
      } else {
        // Local fallback
        setComments(localComments.filter((c) => c.screen_id === screenId));
      }
    } catch (err) {
      console.warn('Failed to fetch comments, using local store:', err);
      setComments(localComments.filter((c) => c.screen_id === screenId));
    } finally {
      setLoading(false);
    }
  }, [screenId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (
    comment: Omit<Comment, 'id' | 'created_at' | 'status' | 'replies'>
  ) => {
    const newComment: Comment = {
      ...comment,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      status: 'open',
    };

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase!.from('comments').insert(newComment);
        if (error) throw error;
      } else {
        localComments.push(newComment);
      }
    } catch (err) {
      console.warn('Supabase insert failed, saving locally:', err);
      localComments.push(newComment);
    }

    await fetchComments();
    return newComment;
  };

  const resolveComment = async (id: string) => {
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase!
          .from('comments')
          .update({ status: 'resolved' })
          .eq('id', id);
        if (error) throw error;
      } else {
        localComments = localComments.map((c) =>
          c.id === id ? { ...c, status: 'resolved' as const } : c
        );
      }
    } catch (err) {
      console.warn('Resolve failed, updating locally:', err);
      localComments = localComments.map((c) =>
        c.id === id ? { ...c, status: 'resolved' as const } : c
      );
    }
    await fetchComments();
  };

  const deleteComment = async (id: string) => {
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase!.from('comments').delete().eq('id', id);
        if (error) throw error;
      } else {
        localComments = localComments.filter((c) => c.id !== id);
      }
    } catch (err) {
      console.warn('Delete failed, removing locally:', err);
      localComments = localComments.filter((c) => c.id !== id);
    }
    await fetchComments();
  };

  return { comments, loading, addComment, resolveComment, deleteComment, refetch: fetchComments };
}

export function useAllComments() {
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAllComments = useCallback(async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase!
          .from('comments')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAllComments(data || []);
      } else {
        // Local fallback
        const sorted = [...localComments].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setAllComments(sorted);
      }
    } catch (err) {
      console.warn('Failed to fetch all comments, using local store:', err);
      const sorted = [...localComments].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setAllComments(sorted);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllComments();
  }, [fetchAllComments]);

  return { allComments, loading, refetch: fetchAllComments };
}
