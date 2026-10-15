'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import PostForm from '@/components/cms/posts/PostForm';
import { cmsAPI, ContentPost } from '@/lib/api/cms';

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const idStr = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const postId = idStr ? Number(idStr) : NaN;

  const [post, setPost] = useState<ContentPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId || isNaN(postId)) {
      setError('Invalid post ID provided.');
      setLoading(false);
      return;
    }

    async function loadPost() {
      setLoading(true);
      try {
        const res = await cmsAPI.getPost(postId);
        if (res.success && res.data) {
          setPost(res.data);
        } else {
          setError('Post not found.');
        }
      } catch (err: any) {
        console.error('Failed to load post', err);
        setError(err?.response?.data?.message || 'Failed to load post.');
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-brand-green)] border-t-transparent" />
        <span className="text-xs font-bold text-muted">Loading post details...</span>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="glass-panel mx-auto flex max-w-lg flex-col items-center justify-center gap-4 rounded-2xl p-8 text-center shadow-xl">
        <AlertCircle size={36} className="text-red-400" />
        <h2 className="text-lg font-black text-white">Post Not Found</h2>
        <p className="text-xs text-muted leading-relaxed">
          {error || "The post you are trying to edit does not exist or has been removed."}
        </p>
        <Link
          href="/admin/cms/posts"
          className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition-all"
        >
          <ArrowLeft size={14} />
          <span>Return to Blog Posts</span>
        </Link>
      </div>
    );
  }

  return <PostForm mode="edit" initialData={post} postId={postId} />;
}
