'use client';

import React, { useState } from 'react';
import { useAuth } from '@/store/AuthContext';
import { User, Mail, Phone, Globe, Camera, CheckCircle2 } from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';

export default function ProfilePage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="animate-fade-in mx-auto flex h-full w-full max-w-2xl flex-col">
      <div className="mb-8">
        <h1 className="text-foreground mb-2 text-3xl font-black">My Profile</h1>
        <p className="text-muted font-medium">Manage your personal information and preferences.</p>
      </div>

      <div className="mb-8 flex flex-col items-center">
        <div className="group relative cursor-pointer">
          <div className="bg-foreground/5 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[var(--border-brand)] transition-all group-hover:border-[var(--color-brand-green)]">
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <User
                size={40}
                className="text-muted transition-colors group-hover:text-[var(--color-brand-green)]"
              />
            )}
          </div>
          <div className="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-brand-green)] text-white shadow-lg">
            <Camera size={14} />
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="text-muted mb-2 ml-1 block text-sm font-bold">Full Name</label>
          <div className="relative">
            <User className="text-muted absolute top-1/2 left-4 -translate-y-1/2" size={20} />
            <input
              type="text"
              defaultValue={user?.fullName || ''}
              className="bg-foreground/5 text-foreground h-14 w-full rounded-2xl border border-[var(--border-subtle)] pr-4 pl-12 font-bold transition-all focus:border-[var(--color-brand-green)] focus:outline-none"
              placeholder="Enter your full name"
            />
          </div>
        </div>

        <div>
          <label className="text-muted mb-2 ml-1 block text-sm font-bold">Mobile Number</label>
          <div className="relative">
            <Phone className="text-muted absolute top-1/2 left-4 -translate-y-1/2" size={20} />
            <input
              type="text"
              defaultValue={user?.mobile ? String(user.mobile) : ''}
              disabled
              className="bg-foreground/5 text-muted h-14 w-full cursor-not-allowed rounded-2xl border border-[var(--border-subtle)] pr-4 pl-12 font-bold"
            />
          </div>
          <p className="text-muted mt-1 ml-1 text-xs">Mobile number cannot be changed.</p>
        </div>

        <div>
          <label className="text-muted mb-2 ml-1 block text-sm font-bold">Email Address</label>
          <div className="relative">
            <Mail className="text-muted absolute top-1/2 left-4 -translate-y-1/2" size={20} />
            <input
              type="email"
              defaultValue={user?.email || ''}
              className="bg-foreground/5 text-foreground h-14 w-full rounded-2xl border border-[var(--border-subtle)] pr-4 pl-12 font-bold transition-all focus:border-[var(--color-brand-green)] focus:outline-none"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div>
          <label className="text-muted mb-2 ml-1 block text-sm font-bold">Preferred Language</label>
          <div className="relative">
            <Globe className="text-muted absolute top-1/2 left-4 -translate-y-1/2" size={20} />
            <select
              defaultValue={user?.preferredLanguage || 'English'}
              className="bg-foreground/5 text-foreground h-14 w-full appearance-none rounded-2xl border border-[var(--border-subtle)] pr-4 pl-12 font-bold transition-all focus:border-[var(--color-brand-green)] focus:outline-none"
            >
              <option value="English">English</option>
              <option value="Marathi">मराठी (Marathi)</option>
              <option value="Hindi">हिंदी (Hindi)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          {success ? (
            <p className="flex items-center gap-2 font-bold text-[var(--color-brand-green)]">
              <CheckCircle2 size={20} /> Saved successfully!
            </p>
          ) : (
            <div />
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="spatial-button flex h-12 items-center gap-2 rounded-xl px-8 font-bold"
          >
            {isLoading ? <TractorLoader size={20} /> : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
