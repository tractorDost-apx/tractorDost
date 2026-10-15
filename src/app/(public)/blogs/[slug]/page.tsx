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
      const title = post.seoTitle || `${post.title} | TractorDost Blog`;
      const description =
        post.seoDescription ||
        post.excerpt ||
        `Read detailed farming insights and guide on ${post.title} at TractorDost.`;

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
    console.error('Error fetching blog post metadata:', error);
  }

  return {
    title: 'Blog Post | TractorDost',
    description: 'Read the latest farming insights and tractor guides on TractorDost.',
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  let post: ContentPost | null = null;

  try {
    const res = await cmsAPI.getPost(slug);
    if (res.success && res.data) {
      post = res.data;
    }
  } catch (err) {
    console.error('Failed to load blog post:', err);
  }

  // Only show published posts publicly
  if (!post || post.status !== 'PUBLISHED') {
    notFound();
  }

  return <BlogDetailClient post={post} />;
}
