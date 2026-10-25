'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Newspaper,
  Tv,
  Layers,
  Sparkles,
  ArrowRight,
  Plus,
  Eye,
  Calendar,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { cmsAPI, ContentPost } from '@/lib/api/cms';
import { TractorLoader } from '@/components/ui/TractorLoader';

export default function AdminContentDashboardPage() {
  const [recentPosts, setRecentPosts] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    blogs: 0,
    news: 0,
    videos: 0,
    stories: 0,
    totalViews: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const [blogsRes, newsRes, videosRes, storiesRes] = await Promise.allSettled([
          cmsAPI.getPosts({ postType: 'BLOG', limit: 5 }),
          cmsAPI.getPosts({ postType: 'NEWS', limit: 5 }),
          cmsAPI.getPosts({ postType: 'VIDEO', limit: 5 }),
          cmsAPI.getPosts({ postType: 'WEB_STORY', limit: 5 }),
        ]);

        const blogs = blogsRes.status === 'fulfilled' ? blogsRes.value.data || [] : [];
        const news = newsRes.status === 'fulfilled' ? newsRes.value.data || [] : [];
        const videos = videosRes.status === 'fulfilled' ? videosRes.value.data || [] : [];
        const stories = storiesRes.status === 'fulfilled' ? storiesRes.value.data || [] : [];

        const all = [...blogs, ...news, ...videos, ...stories];
        all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRecentPosts(all.slice(0, 10));

        const totalViews = all.reduce((sum, p) => sum + (p.viewsCount || 0), 0);
        setStats({
          blogs: blogs.length,
          news: news.length,
          videos: videos.length,
          stories: stories.length,
          totalViews,
        });
      } catch (err) {
        console.error('Failed to load CMS content stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const SECTIONS = [
    {
      title: 'Blog Articles',
      desc: 'In-depth tractor buying guides, maintenance checklists, and field test analysis.',
      count: stats.blogs,
      href: '/admin/content/blogs',
      icon: FileText,
      color: 'text-lime-400 bg-lime-400/10',
    },
    {
      title: 'Agricultural News',
      desc: 'Government subsidy schemes, OEM price hikes, and industry developments.',
      count: stats.news,
      href: '/admin/content/news',
      icon: Newspaper,
      color: 'text-amber-400 bg-amber-400/10',
    },
    {
      title: 'Promotional Banners',
      desc: 'Manage homepage hero carousels and dealer advertising campaigns.',
      count: 'Active',
      href: '/admin/banners',
      icon: Sparkles,
      color: 'text-purple-400 bg-purple-400/10',
    },
    {
      title: 'SEO Meta & Schema',
      desc: 'Configure canonical tags, schema markups, and OpenGraph social previews.',
      count: 'Ready',
      href: '/admin/seo',
      icon: TrendingUp,
      color: 'text-blue-400 bg-blue-400/10',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-lime-400/10 text-lime-400">
            <FileText size={18} />
          </span>
          <h1 className="text-2xl font-black text-foreground">Content Management System (CMS)</h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Publish and organize editorial blogs, agricultural news, tractor field review videos, and web stories.
        </p>
      </div>

      {/* Section Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {SECTIONS.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <Link
              key={idx}
              href={sec.href}
              className="group flex flex-col justify-between rounded-3xl border border-border/60 bg-card/60 p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-lime-400/50 hover:shadow-xl"
            >
              <div>
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${sec.color}`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-foreground text-lg font-black group-hover:text-lime-400 transition-colors">
                  {sec.title}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed mt-1">
                  {sec.desc}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border/30 pt-3 text-xs">
                <span className="font-bold text-foreground">{sec.count}</span>
                <span className="text-lime-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Manage &rarr;
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Posts Table */}
      <div className="rounded-3xl border border-border/60 bg-card/60 p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-black text-foreground">Recent Editorial Publications</h2>
          <div className="flex gap-2">
            <Link
              href="/admin/content/blogs"
              className="rounded-xl bg-lime-400 px-4 py-2 text-xs font-black uppercase text-black hover:bg-lime-300 transition-all"
            >
              + New Blog
            </Link>
            <Link
              href="/admin/content/news"
              className="rounded-xl border border-border/60 bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-secondary transition-all"
            >
              + New News
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <TractorLoader size={36} />
            <p className="text-muted-foreground mt-3 text-xs font-bold">Loading content items...</p>
          </div>
        ) : recentPosts.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No published content entries found. Create your first blog or news article above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/40 text-muted-foreground uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="pb-3 font-bold">Title</th>
                  <th className="pb-3 font-bold">Type</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold">Views</th>
                  <th className="pb-3 font-bold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {recentPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3.5 pr-4 font-bold text-foreground max-w-md truncate">
                      {post.title}
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="rounded-md bg-secondary/80 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                        {post.postType}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          post.status === 'PUBLISHED'
                            ? 'bg-lime-400/15 text-lime-400'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-muted-foreground">
                      {post.viewsCount || 0}
                    </td>
                    <td className="py-3.5 text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
