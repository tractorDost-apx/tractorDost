'use client';

import React, { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { cmsAPI, ContentPost } from '@/lib/api/cms';
import PostCard from './PostCard';

interface RelatedPostsProps {
  currentPostId: number;
  categoryId?: number | null;
  categoryName?: string;
}

export default function RelatedPosts({
  currentPostId,
  categoryId,
  categoryName,
}: RelatedPostsProps) {
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRelated() {
      setLoading(true);
      try {
        let list: ContentPost[] = [];

        // 1. Try fetching from the same category
        if (categoryId) {
          const res = await cmsAPI.getPosts({
            categoryId,
            status: 'PUBLISHED',
            limit: 5,
            sortBy: 'createdAt',
            sortOrder: 'desc',
          });
          if (res.success && Array.isArray(res.data)) {
            list = res.data.filter((p) => p.id !== currentPostId);
          }
        }

        // 2. If fewer than 3, fetch latest published posts to supplement
        if (list.length < 3) {
          const fallbackRes = await cmsAPI.getPosts({
            status: 'PUBLISHED',
            limit: 6,
            sortBy: 'createdAt',
            sortOrder: 'desc',
          });
          if (fallbackRes.success && Array.isArray(fallbackRes.data)) {
            const extra = fallbackRes.data.filter(
              (p) => p.id !== currentPostId && !list.some((existing) => existing.id === p.id)
            );
            list = [...list, ...extra];
          }
        }

        setPosts(list.slice(0, 3));
      } catch (err) {
        console.error('Failed to load related posts', err);
      } finally {
        setLoading(false);
      }
    }

    loadRelated();
  }, [currentPostId, categoryId]);

  if (loading) {
    return (
      <div className="mt-16 border-t border-zinc-200 dark:border-white/10 pt-10">
        <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-6">Related Articles</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-80 rounded-2xl animate-pulse bg-zinc-100 border border-zinc-200 dark:bg-white/5 dark:border-white/5"
            />
          ))}
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 border-t border-zinc-200 dark:border-white/10 pt-10">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-[var(--color-brand-green)]">
            Explore More Insights
          </span>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
            Related {categoryName ? `to ${categoryName}` : 'Articles'}
          </h2>
        </div>
        <span className="text-xs text-zinc-500 dark:text-muted">
          Recommended reading handpicked for farmers & tractor owners
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
