import React from 'react';
import PostList from '@/components/cms/posts/PostList';

export const metadata = {
  title: 'Blog & Content Posts | TractorDost Admin',
  description: 'Manage CMS blog articles, news, buying guides, and content posts',
};

export default function PostsPage() {
  return <PostList />;
}
