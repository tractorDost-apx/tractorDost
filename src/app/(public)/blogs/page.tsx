import React from 'react';
import { Metadata } from 'next';
import BlogListClient from '@/components/blogs/BlogListClient';

export const metadata: Metadata = {
  title: 'Tractor Blogs, News & Buying Guides | TractorDost',
  description:
    'Read the latest farming insights, tractor comparisons, news, and maintenance guides crafted for Indian agriculture and farmers.',
  keywords:
    'tractor blogs, farming tips, tractor news, tractor comparison, agricultural guides, TractorDost',
  openGraph: {
    title: 'Tractor Blogs, News & Buying Guides | TractorDost',
    description:
      'Explore expert guides, reviews, and agriculture tips crafted for Indian farmers.',
    type: 'website',
  },
};

export default function BlogsPage() {
  return <BlogListClient />;
}
