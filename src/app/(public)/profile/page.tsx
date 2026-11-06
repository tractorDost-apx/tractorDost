'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ProfileViewEdit } from '@/components/profile/ProfileViewEdit';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto max-w-6xl pt-0 sm:pt-1 lg:pt-2 pb-16">
        <ProfileViewEdit />
      </div>
    </ProtectedRoute>
  );
}
