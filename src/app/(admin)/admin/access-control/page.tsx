'use client';

import React, { useState } from 'react';
import { ShieldCheck, Shield, Key, LayoutGrid, UserPlus } from 'lucide-react';
import RolesTab from '@/components/admin/access-control/RolesTab';
import ModulesTab from '@/components/admin/access-control/ModulesTab';
import PermissionsTab from '@/components/admin/access-control/PermissionsTab';
import OverridesTab from '@/components/admin/access-control/OverridesTab';

type TabKey = 'ROLES' | 'PERMISSIONS' | 'MODULES' | 'OVERRIDES';

export default function AccessControlDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>('ROLES');

  const tabs = [
    { id: 'ROLES', label: 'Roles', icon: Shield },
    { id: 'MODULES', label: 'Modules', icon: LayoutGrid },
    { id: 'PERMISSIONS', label: 'Permissions Matrix', icon: Key },
    { id: 'OVERRIDES', label: 'User Overrides', icon: UserPlus },
  ] as const;

  return (
    <div className="flex flex-col h-full space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="text-[var(--color-brand-green)]" size={36} />
          <h1 className="text-3xl font-black text-foreground">Access Control</h1>
        </div>
        <p className="text-muted font-medium">Manage advanced RBAC permissions, roles, system modules, and specific user overrides.</p>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] overflow-x-auto hidden-scrollbar pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-t-xl transition-all font-bold whitespace-nowrap ${
                isActive 
                  ? 'bg-foreground/5 text-foreground border-b-2 border-[var(--color-brand-green)]' 
                  : 'text-muted hover:text-foreground hover:bg-foreground/5'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-[var(--color-brand-green)]' : ''} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'ROLES' && <RolesTab />}
        {activeTab === 'MODULES' && <ModulesTab />}
        {activeTab === 'PERMISSIONS' && <PermissionsTab />}
        {activeTab === 'OVERRIDES' && <OverridesTab />}
      </div>
    </div>
  );
}
