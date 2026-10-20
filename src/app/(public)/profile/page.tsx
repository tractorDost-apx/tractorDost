'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ProfileViewEdit } from '@/components/profile/ProfileViewEdit';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto max-w-6xl py-4 sm:py-8">
        <ProfileViewEdit />
      </div>
    </ProtectedRoute>
  );
}
