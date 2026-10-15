import React from 'react';
import CategoryList from '@/components/cms/categories/CategoryList';

export const metadata = {
  title: 'Content Categories | TractorDost Admin',
  description: 'Manage CMS categories and taxonomy hierarchies',
};

export default function CategoriesPage() {
  return <CategoryList />;
}
