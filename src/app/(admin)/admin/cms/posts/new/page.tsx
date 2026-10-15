import React from 'react';
import PostForm from '@/components/cms/posts/PostForm';

export const metadata = {
  title: 'Create New Post | TractorDost Admin',
  description: 'Write and publish new content post',
};

export default function NewPostPage() {
  return <PostForm mode="create" />;
}
