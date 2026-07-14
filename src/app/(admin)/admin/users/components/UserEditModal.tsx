import React, { useState, useEffect } from 'react';
import { X, Save, Activity, Calendar, FileText, ShoppingBag, MessageSquare, Phone, Check, AlertCircle, User as UserIcon } from 'lucide-react';
import { User } from '@/types/models/user';
import { usersAPI, UserStats } from '@/lib/api/users';
import { apiClient } from '@/lib/api/axios/axios';
import { TractorLoader } from '@/components/ui/TractorLoader';

interface UserEditModalProps {
  user: User;
  onClose: () => void;
  onSaved: () => void;
}

export function UserEditModal({ user, onClose, onSaved }: UserEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [roles, setRoles] = useState<{id: number, name: string}[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    email: user.email || '',
    isActive: user.isActive,
    roleId: user.roleId || '',
  });

  useEffect(() => {
    const fetchStatsAndRoles = async () => {
      try {
        const statsRes = await usersAPI.getUserStats(user.id);
        if (statsRes.success) {
          setStats(statsRes.data);
        }

        const rolesRes = await apiClient.get('/roles/getAll');
        if (rolesRes.data?.data?.roles) {
          setRoles(rolesRes.data.data.roles);
        }
      } catch (err) {
        console.error('Failed to fetch modal data', err);
      }
    };
    
    fetchStatsAndRoles();
  }, [user.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const dataToUpdate = {
        ...formData,
        roleId: formData.roleId ? Number(formData.roleId) : undefined,
      };
      
      const res = await usersAPI.updateUserById(user.id, dataToUpdate);
      if (res.success) {
        onSaved();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const SectionTitle = ({ icon: Icon, title, colorClass = "text-[var(--color-brand-green)]" }: { icon: any, title: string, colorClass?: string }) => (
    <div className="flex items-center gap-2 text-foreground mb-4 border-b border-foreground/10 pb-2">
      <Icon size={18} className={colorClass} />
      <h3 className="font-black text-sm uppercase tracking-wider">{title}</h3>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl animate-fade-in shadow-2xl border border-foreground/10 overflow-hidden"
        style={{ background: 'var(--background)' }}
      >
        {/* Sticky Header */}
        <div className="px-6 py-5 border-b border-foreground/10 flex justify-between items-center bg-background shrink-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">Edit User Master</h2>
            <p className="text-sm font-bold text-muted mt-1">ID: #{user.id}</p>
          </div>
          <button 
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto p-6 md:p-8 flex-1">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-500">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <form id="edit-user-form" onSubmit={handleSubmit} className="flex flex-col gap-10">
            
            {/* SECTION 1: Identity & Access */}
            <section>
              <SectionTitle icon={UserIcon} title="Identity & Access" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-foreground/[0.02] p-6 rounded-2xl border border-foreground/5">
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text" 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-background border border-foreground/10 rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
                    placeholder="Enter full name"
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">Email</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-background border border-foreground/10 rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
                    placeholder="Enter email address"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">Mobile (Read-only)</label>
                  <input 
                    type="text" 
                    value={user.mobile?.toString() || ''}
                    disabled
                    className="w-full bg-background border border-foreground/10 rounded-xl px-4 py-3 text-sm font-bold text-foreground opacity-60 cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted uppercase tracking-wider">Role</label>
                  <select 
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleChange}
                    className="w-full bg-background border border-foreground/10 rounded-xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all appearance-none"
                  >
                    <option value="">Select a role...</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                    {roles.length === 0 && <option value={user.roleId}>{user.role?.name}</option>}
                  </select>
                </div>

                <div className="md:col-span-2 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-background border border-foreground/10 hover:border-[var(--color-brand-green)]/50 transition-colors max-w-sm">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        name="isActive" 
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="peer sr-only" 
                      />
                      <div className="w-6 h-6 rounded-md border-2 border-foreground/20 peer-checked:bg-[var(--color-brand-green)] peer-checked:border-[var(--color-brand-green)] transition-all flex items-center justify-center">
                        <Check size={14} className="text-white opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-100 transition-all" strokeWidth={4} />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-foreground">Active Status</span>
                      <span className="text-[10px] text-muted">User can access the platform</span>
                    </div>
                  </label>
                </div>

              </div>
            </section>

            {/* SECTION 2: Stats */}
            <section>
              <SectionTitle icon={Activity} title="User Activity Stats" colorClass="text-[var(--color-brand-orange)]" />
              
              {!stats ? (
                <div className="animate-pulse flex gap-4">
                  <div className="h-24 bg-foreground/5 rounded-2xl flex-1"></div>
                  <div className="h-24 bg-foreground/5 rounded-2xl flex-1"></div>
                  <div className="h-24 bg-foreground/5 rounded-2xl flex-1"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-foreground/[0.02] border border-foreground/10 p-5 rounded-2xl flex flex-col gap-2 hover:border-[var(--color-brand-green)]/30 transition-colors shadow-sm">
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-wider">
                      <ShoppingBag size={14} className="text-[var(--color-brand-green)]" /> Listings
                    </div>
                    <div className="text-3xl font-black text-foreground">{stats.totalListings}</div>
                  </div>

                  <div className="bg-foreground/[0.02] border border-foreground/10 p-5 rounded-2xl flex flex-col gap-2 hover:border-[var(--color-brand-green)]/30 transition-colors shadow-sm">
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-wider">
                      <MessageSquare size={14} className="text-blue-500" /> Enquiries
                    </div>
                    <div className="text-3xl font-black text-foreground">{stats.totalEnquiries}</div>
                  </div>

                  <div className="bg-foreground/[0.02] border border-foreground/10 p-5 rounded-2xl flex flex-col gap-2 hover:border-[var(--color-brand-green)]/30 transition-colors shadow-sm">
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-wider">
                      <Phone size={14} className="text-rose-500" /> Leads
                    </div>
                    <div className="text-3xl font-black text-foreground">{stats.totalLeads}</div>
                  </div>

                  <div className="bg-foreground/[0.02] border border-foreground/10 p-5 rounded-2xl flex flex-col gap-2 hover:border-[var(--color-brand-green)]/30 transition-colors shadow-sm">
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-wider">
                      <FileText size={14} className="text-purple-500" /> Loans
                    </div>
                    <div className="text-3xl font-black text-foreground">{stats.totalLoanApplications}</div>
                  </div>
                  
                  <div className="col-span-2 md:col-span-4 bg-background border border-foreground/10 p-4 rounded-xl flex items-center gap-3 justify-center text-sm font-bold text-muted shadow-sm">
                    <Calendar size={16} className="text-[var(--color-brand-orange)]" />
                    Member Since: <span className="text-foreground">{new Date(stats.memberSince).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
              )}
            </section>

          </form>
        </div>

        {/* Sticky Footer */}
        <div className="px-6 py-4 border-t border-foreground/10 bg-background shrink-0 flex justify-end gap-3 z-10">
          <button 
            type="button" 
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl font-bold text-foreground bg-foreground/5 hover:bg-foreground/10 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="edit-user-form"
            disabled={loading}
            className="px-8 py-2.5 rounded-xl font-black text-white bg-[var(--color-brand-green)] hover:shadow-[0_10px_20px_rgba(29,191,115,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none disabled:shadow-none flex items-center gap-2"
          >
            {loading ? (
              <>
                <TractorLoader size={16} className="text-white" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
