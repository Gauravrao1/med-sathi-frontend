import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../i18n/I18nProvider';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../api/client';
import { MessageSquare, Plus, Send, ChevronDown, ChevronUp, Heart, Share2, Paperclip, X, FileText, Video } from 'lucide-react';
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
  video_url?: string;
  post_type?: string;
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

  // UI States
  const [expandedTexts, setExpandedTexts] = useState<Record<string, boolean>>({});
  const [animatingLikes, setAnimatingLikes] = useState<Record<string, boolean>>({});
  const [replyingTo, setReplyingTo] = useState<{postId: string, commentId: string, userName: string} | null>(null);

  // Create post form
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newPostType, setNewPostType] = useState('discussion');
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
      const data = await apiClient.request<Comment[]>('/community/posts/' + postId + '/comments');
      setComments(prev => ({ ...prev, [postId]: data }));
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  const handleExpandPost = (postId: string) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
      setReplyingTo(null);
    } else {
      setExpandedPost(postId);
      setReplyingTo(null);
      if (!comments[postId]) {
        fetchComments(postId);
      }
    }
  };

  const handleLike = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Animation
    setAnimatingLikes(prev => ({ ...prev, [postId]: true }));
    setTimeout(() => {
      setAnimatingLikes(prev => ({ ...prev, [postId]: false }));
    }, 300);

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
      await apiClient.request('/community/posts/' + postId + '/like', { method: 'POST' });
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
          url: window.location.origin + '/community/' + post.id
        });
      } else {
        await navigator.clipboard.writeText(window.location.origin + '/community/' + post.id);
        alert("Link copied to clipboard!");
      }
      await apiClient.request('/community/posts/' + post.id + '/share', { method: 'POST' });
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
        formData.append('post_type', newPostType);
        formData.append('video_url', newVideoUrl);
        formData.append('attachment', newFile);
        
        const token = localStorage.getItem('token');
        const res = await fetch('/api/community/posts', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token
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
            tags: tagsArray,
            post_type: newPostType,
            video_url: newVideoUrl
          })
        });
      }

      setShowCreateModal(false);
      setNewTitle('');
      setNewBody('');
      setNewTags('');
      setNewVideoUrl('');
      setNewPostType('discussion');
      setNewFile(null);
      fetchPosts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!newComment.trim()) return;
    try {
      const payload: any = { body: newComment };
      if (replyingTo && replyingTo.postId === postId) {
        payload.parent_comment_id = replyingTo.commentId;
      }
      await apiClient.request('/community/posts/' + postId + '/comments', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setNewComment('');
      setReplyingTo(null);
      fetchComments(postId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const timeAgo = (ts: number) => {
    if (!ts) return '';
    const ms = ts < 10000000000 ? ts * 1000 : ts;
    const diff = Date.now() - ms;
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'Just now';
    if (min < 60) return min + 'm ago';
    const hr = Math.floor(min / 60);
    if (hr < 24) return hr + 'h ago';
    const day = Math.floor(hr / 24);
    if (day < 30) return day + 'd ago';
    const mo = Math.floor(day / 30);
    if (mo < 12) return mo + 'mo ago';
    return Math.floor(mo / 12) + 'y ago';
  };

  const getUserAvatar = (name: string = 'User') => {
    const initial = name.charAt(0).toUpperCase();
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
    const colorIndex = name.length % colors.length;
    return (
      <div className={"w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 " + colors[colorIndex]}>
        {initial}
      </div>
    );
  };

  const getPostTypeBadge = (type?: string) => {
    switch(type) {
      case 'question': return <span className="bg-orange-100 text-orange-800 text-[10px] px-2 py-0.5 rounded-full font-medium">❓ Question</span>;
      case 'experience': return <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded-full font-medium">📢 Experience</span>;
      case 'discussion':
      default: return <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-medium">💬 Discussion</span>;
    }
  };

  const renderVideo = (url?: string) => {
    if (!url) return null;
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (youtubeMatch) {
      return (
        <div className="mt-3 relative w-full pt-[56.25%] rounded-lg overflow-hidden bg-gray-900">
          <iframe 
            className="absolute top-0 left-0 w-full h-full"
            src={"https://www.youtube.com/embed/" + youtubeMatch[1]} 
            frameBorder="0" 
            allowFullScreen
          />
        </div>
      );
    }
    return (
      <div className="mt-3 rounded-lg overflow-hidden bg-black flex justify-center">
        <video src={url} controls className="max-h-60 w-full" />
      </div>
    );
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
      <div className="bg-teal-600 text-white p-6 flex items-center justify-between shadow-md">
        <h1 className="text-2xl font-bold">{t('bottomNav.community')}</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-white/20 p-2.5 rounded-xl active:bg-white/30 transition-colors"
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
          posts.map(post => {
            const isTextExpanded = expandedTexts[post.id];
            const isLongText = post.body && post.body.length > 150;
            const displayText = isTextExpanded || !isLongText ? post.body : post.body.slice(0, 150) + '...';

            return (
              <div key={post.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div 
                  onClick={() => handleExpandPost(post.id)}
                  className="w-full text-left p-4 cursor-pointer block"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getUserAvatar(post.user_name)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-900">{post.user_name || 'Anonymous User'}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500 font-medium">{timeAgo(post.created_at)}</span>
                        </div>
                        <div className="mt-0.5">
                          {getPostTypeBadge(post.post_type)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 text-[15px] leading-snug">{post.title}</h3>
                  <div className="mt-2">
                    <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">
                      {displayText}
                    </p>
                    {isLongText && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedTexts(prev => ({ ...prev, [post.id]: !isTextExpanded }));
                        }}
                        className="text-teal-600 text-sm font-medium mt-1 hover:underline focus:outline-none"
                      >
                        {isTextExpanded ? 'Show less' : 'Read more'}
                      </button>
                    )}
                  </div>
                  
                  {renderVideo(post.video_url)}
                  {renderFilePreview(post)}

                  <div className="flex gap-1.5 flex-wrap mt-3">
                    {(typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags || []).map((tag: string, i: number) => (
                      <span key={i} className="bg-gray-100 text-gray-600 text-[11px] px-2.5 py-1 rounded-full font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-5">
                      <button 
                        onClick={(e) => handleLike(post.id, e)}
                        className={"flex items-center gap-1.5 text-sm font-medium transition-colors " + (post.liked ? 'text-rose-500' : 'text-gray-500 hover:text-gray-700')}
                      >
                        <Heart 
                          size={18} 
                          fill={post.liked ? "currentColor" : "none"} 
                          className={"transition-transform duration-300 " + (animatingLikes[post.id] ? 'scale-150' : 'scale-100')} 
                        />
                        <span>{post.likes || 0}</span>
                      </button>
                      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                        <MessageSquare size={18} />
                        <span>{post.comment_count || 0}</span>
                      </div>
                      <button 
                        onClick={(e) => handleShare(post, e)}
                        className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
                      >
                        <Share2 size={18} />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                {expandedPost === post.id && (
                  <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                    <div className="space-y-4">
                      {(comments[post.id] || []).map(comment => (
                        <div
                          key={comment.id}
                          className={"bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm " + (comment.parent_comment_id ? 'ml-8 border-l-2 border-l-teal-400' : '')}
                        >
                          <div className="flex items-center gap-2.5 mb-2">
                            {getUserAvatar(comment.user_name)}
                            <div className="flex flex-col">
                              <span className="font-bold text-[13px] text-gray-900">{comment.user_name || 'User'}</span>
                              <span className="text-[10px] text-gray-400 font-medium">{timeAgo(comment.created_at)}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed ml-10">{comment.body}</p>
                          <div className="flex items-center gap-4 mt-2 ml-10">
                            {!comment.parent_comment_id && (
                              <button 
                                onClick={() => setReplyingTo({postId: post.id, commentId: comment.id, userName: comment.user_name || 'User'})}
                                className="text-xs text-gray-500 font-bold hover:text-teal-600 transition-colors"
                              >
                                Reply
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {(comments[post.id] || []).length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-4">No comments yet. Start the conversation!</p>
                      )}
                    </div>

                    {/* Add Comment */}
                    <div className="mt-4 bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-2">
                      {replyingTo && replyingTo.postId === post.id && (
                        <div className="flex items-center justify-between bg-teal-50 px-3 py-1.5 rounded-lg text-xs text-teal-700 font-medium mb-1">
                          <span>Replying to {replyingTo.userName}</span>
                          <button onClick={() => setReplyingTo(null)} className="p-0.5 hover:bg-teal-100 rounded-full">
                            <X size={12} />
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newComment}
                          onChange={e => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="flex-1 bg-transparent px-2 py-1.5 text-sm focus:outline-none"
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
                          className="bg-teal-600 text-white p-2 rounded-lg disabled:opacity-50 hover:bg-teal-700 transition-colors shrink-0"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl p-5 max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Create Post</h2>
              <button 
                onClick={() => {
                  setShowCreateModal(false);
                  setNewFile(null);
                  setNewVideoUrl('');
                }} 
                className="bg-gray-100 text-gray-500 p-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-4 pr-1">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Post Type</label>
                <select
                  value={newPostType}
                  onChange={e => setNewPostType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium text-gray-700"
                >
                  <option value="discussion">💬 Discussion</option>
                  <option value="question">❓ Question</option>
                  <option value="experience">📢 Experience</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Give your post a title"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Content</label>
                <textarea
                  value={newBody}
                  onChange={e => setNewBody(e.target.value)}
                  placeholder="What do you want to share?"
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none resize-none transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Tags</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={e => setNewTags(e.target.value)}
                  placeholder="e.g. fever, headache (comma-separated)"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Video URL (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Video size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={newVideoUrl}
                    onChange={e => setNewVideoUrl(e.target.value)}
                    placeholder="YouTube or direct video link"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* File Upload Area */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Attachment (Optional)</label>
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
                  <div className="flex items-center justify-between p-3 border border-teal-200 bg-teal-50 rounded-xl">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText size={18} className="text-teal-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-teal-800 truncate">{newFile.name}</span>
                    </div>
                    <button 
                      onClick={() => setNewFile(null)}
                      className="p-1.5 text-teal-600 hover:text-rose-500 hover:bg-teal-100 rounded-full transition-colors flex-shrink-0 ml-2"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 text-sm font-bold text-teal-600 border-2 border-dashed border-teal-200 bg-teal-50/50 px-4 py-4 rounded-xl hover:bg-teal-50 hover:border-teal-300 transition-all"
                  >
                    <Paperclip size={18} />
                    Attach Image or Document
                  </button>
                )}
              </div>

              {error && <p className="text-rose-500 text-sm font-medium p-3 bg-rose-50 rounded-xl border border-rose-100">{error}</p>}
            </div>

            <button
              onClick={handleCreatePost}
              disabled={!newTitle.trim() || !newBody.trim()}
              className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold text-[15px] disabled:opacity-50 hover:bg-teal-700 active:bg-teal-800 transition-colors mt-5 shrink-0 shadow-sm"
            >
              Post to Community
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
