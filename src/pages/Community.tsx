import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../i18n/I18nProvider';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../api/client';
import { MessageSquare, Plus, Send, ChevronDown, ChevronUp, Heart, Share2, Paperclip, X, FileText } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';

interface CommunityPost {
  id: string;
  user_id: string;
  user_name?: string;
  medicine_id?: number;
  title: string;
  body: string;
  tags: string[] | string;
  created_at: number;
  comment_count?: number;
  likes?: number;
  shares?: number;
  liked?: boolean;
  attachment_url?: string;
  attachment_type?: string;
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  user_name?: string;
  body: string;
  parent_comment_id: string | null;
  created_at: number;
}

export const Community: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');

  // Create post form
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await apiClient.request<CommunityPost[]>('/community/posts');
      setPosts(data);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const data = await apiClient.request<Comment[]>(`/community/posts/${postId}/comments`);
      setComments(prev => ({ ...prev, [postId]: data }));
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  const handleExpandPost = (postId: string) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
      if (!comments[postId]) {
        fetchComments(postId);
      }
    }
  };

  const handleLike = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Optimistic UI update
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const isLiked = p.liked;
        return {
          ...p,
          liked: !isLiked,
          likes: (p.likes || 0) + (isLiked ? -1 : 1)
        };
      }
      return p;
    }));

    try {
      await apiClient.request(`/community/posts/${postId}/like`, { method: 'POST' });
    } catch (err) {
      // Revert on failure
      fetchPosts();
    }
  };

  const handleShare = async (post: CommunityPost, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Optimistic UI update for share count
    setPosts(prev => prev.map(p => {
      if (p.id === post.id) {
        return { ...p, shares: (p.shares || 0) + 1 };
      }
      return p;
    }));

    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.body,
          url: `${window.location.origin}/community/${post.id}`
        });
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/community/${post.id}`);
        // Optionally show a toast here
      }
      await apiClient.request(`/community/posts/${post.id}/share`, { method: 'POST' });
    } catch (err) {
      console.error('Share failed', err);
    }
  };

  const handleCreatePost = async () => {
    if (!newTitle.trim() || !newBody.trim()) return;
    try {
      const tagsArray = newTags.split(',').map(t => t.trim()).filter(Boolean);

      if (newFile) {
        const formData = new FormData();
        formData.append('title', newTitle);
        formData.append('body', newBody);
        formData.append('tags', JSON.stringify(tagsArray));
        formData.append('attachment', newFile);
        
        const token = localStorage.getItem('token');
        const res = await fetch('/api/community/posts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        if (!res.ok) throw new Error('Failed to create post');
      } else {
        await apiClient.request('/community/posts', {
          method: 'POST',
          body: JSON.stringify({
            title: newTitle,
            body: newBody,
            tags: tagsArray
          })
        });
      }

      setShowCreateModal(false);
      setNewTitle('');
      setNewBody('');
      setNewTags('');
      setNewFile(null);
      fetchPosts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!newComment.trim()) return;
    try {
      await apiClient.request(`/community/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body: newComment })
      });
      setNewComment('');
      fetchComments(postId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatDate = (ts: number) => {
    // Auto-detect seconds vs milliseconds (timestamps before year 2100 in seconds are < 4102444800)
    const ms = ts < 10000000000 ? ts * 1000 : ts;
    return new Date(ms).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const renderFilePreview = (post: CommunityPost) => {
    if (!post.attachment_url) return null;
    
    if (post.attachment_type === 'image') {
      return (
        <div className="mt-3 rounded-lg overflow-hidden border border-gray-100 max-h-60 bg-gray-50 flex justify-center">
          <img src={post.attachment_url} alt="Post attachment" className="object-contain max-h-60" />
        </div>
      );
    } else if (post.attachment_type === 'video') {
      return (
        <div className="mt-3 rounded-lg overflow-hidden border border-gray-100 max-h-60 bg-black flex justify-center">
          <video src={post.attachment_url} controls className="object-contain max-h-60 w-full" />
        </div>
      );
    } else {
      return (
        <a 
          href={post.attachment_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-3 flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-blue-600 hover:underline"
          onClick={e => e.stopPropagation()}
        >
          <FileText size={16} />
          View Attached File
        </a>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-teal-600 text-white p-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('bottomNav.community')}</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-white/20 p-2.5 rounded-xl active:bg-white/30"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {loading ? (
          <div className="text-center py-10 text-gray-500">{t('common.loading')}</div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No community posts yet"
            description="Be the first to start a conversation!"
          />
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div 
                onClick={() => handleExpandPost(post.id)}
                className="w-full text-left p-4 cursor-pointer block"
              >
                <h3 className="font-bold text-gray-900 text-sm leading-snug">{post.title}</h3>
                <p className="text-gray-600 text-xs mt-1 whitespace-pre-line">{post.body}</p>
                
                {renderFilePreview(post)}

                <div className="flex items-center justify-between mt-4">
                  <div className="flex gap-1.5 flex-wrap">
                    {(typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags || []).map((tag: string, i: number) => (
                      <span key={i} className="bg-teal-50 text-teal-700 text-[10px] px-2 py-0.5 rounded-full font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => handleLike(post.id, e)}
                      className={`flex items-center gap-1.5 text-xs font-medium ${post.liked ? 'text-rose-500' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <Heart size={16} fill={post.liked ? "currentColor" : "none"} />
                      <span>{post.likes || 0}</span>
                    </button>
                    <button 
                      onClick={(e) => handleShare(post, e)}
                      className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
                    >
                      <Share2 size={16} />
                      <span>{post.shares || 0}</span>
                    </button>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                      <MessageSquare size={16} />
                      <span>{post.comment_count || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <span className="text-[10px] mr-1">{formatDate(post.created_at)}</span>
                    {expandedPost === post.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              {expandedPost === post.id && (
                <div className="border-t border-gray-100 bg-gray-50 p-4">
                  <div className="space-y-3">
                    {(comments[post.id] || []).map(comment => (
                      <div
                        key={comment.id}
                        className={`bg-white p-3 rounded-lg border border-gray-100 ${
                          comment.parent_comment_id ? 'ml-6' : ''
                        }`}
                      >
                        <p className="text-sm text-gray-800">{comment.body}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(comment.created_at)}</p>
                      </div>
                    ))}
                    {(comments[post.id] || []).length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-2">No comments yet</p>
                    )}
                  </div>

                  {/* Add Comment */}
                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddComment(post.id);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      disabled={!newComment.trim()}
                      className="bg-teal-600 text-white p-2.5 rounded-lg disabled:opacity-50"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-5 max-h-[80vh] flex flex-col shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Create Post</h2>
              <button 
                onClick={() => {
                  setShowCreateModal(false);
                  setNewFile(null);
                }} 
                className="bg-gray-100 text-gray-500 p-2 rounded-full hover:bg-gray-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3">
              <input
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Post title"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-colors"
              />
              <textarea
                value={newBody}
                onChange={e => setNewBody(e.target.value)}
                placeholder="What's on your mind?"
                rows={4}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none resize-none transition-colors"
              />
              <input
                type="text"
                value={newTags}
                onChange={e => setNewTags(e.target.value)}
                placeholder="Tags (comma-separated)"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-colors"
              />

              {/* File Upload Area */}
              <div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setNewFile(e.target.files[0]);
                    }
                  }}
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  className="hidden"
                />
                
                {newFile ? (
                  <div className="flex items-center justify-between p-3 border border-gray-200 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText size={18} className="text-teal-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700 truncate">{newFile.name}</span>
                    </div>
                    <button 
                      onClick={() => setNewFile(null)}
                      className="p-1 text-gray-400 hover:text-rose-500 ml-2 flex-shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 text-sm font-medium text-teal-600 bg-teal-50 px-4 py-2.5 rounded-xl hover:bg-teal-100 transition-colors"
                  >
                    <Paperclip size={18} />
                    Attach File or Image
                  </button>
                )}
              </div>

              {error && <p className="text-red-500 text-sm px-1">{error}</p>}
            </div>

            <button
              onClick={handleCreatePost}
              disabled={!newTitle.trim() || !newBody.trim()}
              className="w-full bg-teal-600 text-white py-3.5 rounded-xl font-bold disabled:opacity-50 active:bg-teal-700 mt-4 shrink-0"
            >
              Post to Community
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
