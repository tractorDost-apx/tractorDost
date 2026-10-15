import React from 'react';
import FaqManagement from '@/components/cms/faqs/FaqManagement';

export const metadata = {
  title: 'FAQ Management | TractorDost Admin',
  description: 'Manage frequently asked questions, answers, and target categories across TractorDost',
};

export default function FaqsAdminPage() {
  return <FaqManagement />;
}
