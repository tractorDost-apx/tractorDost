'use client';

import React, { useState } from 'react';
import { useAuth } from '@/store/AuthContext';
import { User, Mail, Phone, Globe, Camera, Loader2, CheckCircle2 } from 'lucide-react';

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
    <div className="flex flex-col h-full animate-fade-in max-w-2xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground mb-2">My Profile</h1>
        <p className="text-muted font-medium">Manage your personal information and preferences.</p>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="relative group cursor-pointer">
          <div className="h-28 w-28 rounded-full bg-foreground/5 border-2 border-dashed border-[var(--border-brand)] flex items-center justify-center overflow-hidden transition-all group-hover:border-[var(--color-brand-green)]">
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={40} className="text-muted group-hover:text-[var(--color-brand-green)] transition-colors" />
            )}
          </div>
          <div className="absolute bottom-0 right-0 h-8 w-8 bg-[var(--color-brand-green)] rounded-full flex items-center justify-center text-white shadow-lg">
            <Camera size={14} />
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="text-sm font-bold text-muted ml-1 mb-2 block">Full Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
            <input 
              type="text" 
              defaultValue={user?.fullName || ''}
              className="w-full h-14 bg-foreground/5 border border-[var(--border-subtle)] rounded-2xl pl-12 pr-4 font-bold text-foreground focus:outline-none focus:border-[var(--color-brand-green)] transition-all"
              placeholder="Enter your full name"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-muted ml-1 mb-2 block">Mobile Number</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
            <input 
              type="text" 
              defaultValue={user?.mobile ? String(user.mobile) : ''}
              disabled
              className="w-full h-14 bg-foreground/5 border border-[var(--border-subtle)] rounded-2xl pl-12 pr-4 font-bold text-muted cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-muted mt-1 ml-1">Mobile number cannot be changed.</p>
        </div>

        <div>
          <label className="text-sm font-bold text-muted ml-1 mb-2 block">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
            <input 
              type="email" 
              defaultValue={user?.email || ''}
              className="w-full h-14 bg-foreground/5 border border-[var(--border-subtle)] rounded-2xl pl-12 pr-4 font-bold text-foreground focus:outline-none focus:border-[var(--color-brand-green)] transition-all"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-muted ml-1 mb-2 block">Preferred Language</label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
            <select 
              defaultValue={user?.preferredLanguage || 'English'}
              className="w-full h-14 bg-foreground/5 border border-[var(--border-subtle)] rounded-2xl pl-12 pr-4 font-bold text-foreground focus:outline-none focus:border-[var(--color-brand-green)] transition-all appearance-none"
            >
              <option value="English">English</option>
              <option value="Marathi">मराठी (Marathi)</option>
              <option value="Hindi">हिंदी (Hindi)</option>
            </select>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between">
          {success ? (
            <p className="text-[var(--color-brand-green)] font-bold flex items-center gap-2">
              <CheckCircle2 size={20} /> Saved successfully!
            </p>
          ) : <div />}
          
          <button 
            type="submit"
            disabled={isLoading}
            className="spatial-button h-12 px-8 rounded-xl font-bold flex items-center gap-2"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
