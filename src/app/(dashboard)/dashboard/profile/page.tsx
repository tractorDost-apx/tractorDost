'use client';

import React from 'react';
import { ProfileViewEdit } from '@/components/profile/ProfileViewEdit';

export default function DashboardProfilePage() {
  return (
    <div className="w-full">
      <ProfileViewEdit inDashboard={true} />
    </div>
  );
}
