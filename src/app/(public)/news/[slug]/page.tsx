import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cmsAPI, ContentPost } from '@/lib/api/cms';
import BlogDetailClient from '@/components/blogs/BlogDetailClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await cmsAPI.getPost(slug);
    if (res.success && res.data) {
      const post = res.data;
      const title = post.seoTitle || `${post.title} | TractorDost News`;
      const description =
        post.seoDescription ||
        post.excerpt ||
        `Read detailed agriculture news and updates on ${post.title} at TractorDost.`;

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          type: 'article',
          publishedTime: post.publishedAt || post.createdAt,
          images: post.featuredImage ? [post.featuredImage] : undefined,
        },
      };
    }
  } catch (error) {
    console.error('Error fetching news metadata:', error);
  }

  return {
    title: 'News Article | TractorDost',
    description: 'Read the latest farm and tractor news on TractorDost.',
  };
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;

  let post: ContentPost | null = null;

  try {
    const res = await cmsAPI.getPost(slug);
    if (res.success && res.data) {
      post = res.data;
    }
  } catch (err) {
    console.error('Failed to load news article:', err);
  }

  if (!post || post.status !== 'PUBLISHED') {
    notFound();
  }

  return <BlogDetailClient post={post} />;
}
