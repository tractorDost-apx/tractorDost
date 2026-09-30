import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Activity,
  Calendar,
  FileText,
  ShoppingBag,
  MessageSquare,
  Phone,
  Check,
  AlertCircle,
  User as UserIcon,
} from 'lucide-react';
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
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
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
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
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

  const SectionTitle = ({
    icon: Icon,
    title,
    colorClass = 'text-[var(--color-brand-green)]',
  }: {
    icon: any;
    title: string;
    colorClass?: string;
  }) => (
    <div className="text-foreground border-foreground/10 mb-4 flex items-center gap-2 border-b pb-2">
      <Icon size={18} className={colorClass} />
      <h3 className="text-sm font-black tracking-wider uppercase">{title}</h3>
    </div>
  );

  return (
    <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm sm:p-6">
      <div
        className="animate-fade-in border-foreground/10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border shadow-2xl"
        style={{ background: 'var(--background)' }}
      >
        {/* Sticky Header */}
        <div className="border-foreground/10 bg-background z-10 flex shrink-0 items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-foreground text-2xl font-black tracking-tight">Edit User Master</h2>
            <p className="text-muted mt-1 text-sm font-bold">ID: #{user.id}</p>
          </div>
          <button
            onClick={onClose}
            className="bg-foreground/5 hover:bg-foreground/10 text-foreground flex h-10 w-10 items-center justify-center rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-500">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <form id="edit-user-form" onSubmit={handleSubmit} className="flex flex-col gap-10">
            {/* SECTION 1: Identity & Access */}
            <section>
              <SectionTitle icon={UserIcon} title="Identity & Access" />

              <div className="bg-foreground/[0.02] border-foreground/5 grid grid-cols-1 gap-6 rounded-2xl border p-6 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted text-xs font-bold tracking-wider uppercase">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="bg-background border-foreground/10 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-bold transition-all focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 focus:outline-none"
                    placeholder="Enter full name"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-muted text-xs font-bold tracking-wider uppercase">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-background border-foreground/10 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-bold transition-all focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 focus:outline-none"
                    placeholder="Enter email address"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-muted text-xs font-bold tracking-wider uppercase">
                    Mobile (Read-only)
                  </label>
                  <input
                    type="text"
                    value={user.mobile?.toString() || ''}
                    disabled
                    className="bg-background border-foreground/10 text-foreground w-full cursor-not-allowed rounded-xl border px-4 py-3 text-sm font-bold opacity-60"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-muted text-xs font-bold tracking-wider uppercase">
                    Role
                  </label>
                  <select
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleChange}
                    className="bg-background border-foreground/10 text-foreground w-full appearance-none rounded-xl border px-4 py-3 text-sm font-bold transition-all focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 focus:outline-none"
                  >
                    <option value="">Select a role...</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                    {roles.length === 0 && <option value={user.roleId}>{user.role?.name}</option>}
                  </select>
                </div>

                <div className="pt-2 md:col-span-2">
                  <label className="bg-background border-foreground/10 flex max-w-sm cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors hover:border-[var(--color-brand-green)]/50">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="peer sr-only"
                      />
                      <div className="border-foreground/20 flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all peer-checked:border-[var(--color-brand-green)] peer-checked:bg-[var(--color-brand-green)]">
                        <Check
                          size={14}
                          className="scale-50 text-white opacity-0 transition-all peer-checked:scale-100 peer-checked:opacity-100"
                          strokeWidth={4}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-foreground text-sm font-bold">Active Status</span>
                      <span className="text-muted text-[10px]">User can access the platform</span>
                    </div>
                  </label>
                </div>
              </div>
            </section>

            {/* SECTION 2: Stats */}
            <section>
              <SectionTitle
                icon={Activity}
                title="User Activity Stats"
                colorClass="text-[var(--color-brand-orange)]"
              />

              {!stats ? (
                <div className="flex animate-pulse gap-4">
                  <div className="bg-foreground/5 h-24 flex-1 rounded-2xl"></div>
                  <div className="bg-foreground/5 h-24 flex-1 rounded-2xl"></div>
                  <div className="bg-foreground/5 h-24 flex-1 rounded-2xl"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="bg-foreground/[0.02] border-foreground/10 flex flex-col gap-2 rounded-2xl border p-5 shadow-sm transition-colors hover:border-[var(--color-brand-green)]/30">
                    <div className="text-muted flex items-center gap-2 text-[10px] font-black tracking-wider uppercase">
                      <ShoppingBag size={14} className="text-[var(--color-brand-green)]" /> Listings
                    </div>
                    <div className="text-foreground text-3xl font-black">{stats.totalListings}</div>
                  </div>

                  <div className="bg-foreground/[0.02] border-foreground/10 flex flex-col gap-2 rounded-2xl border p-5 shadow-sm transition-colors hover:border-[var(--color-brand-green)]/30">
                    <div className="text-muted flex items-center gap-2 text-[10px] font-black tracking-wider uppercase">
                      <MessageSquare size={14} className="text-blue-500" /> Enquiries
                    </div>
                    <div className="text-foreground text-3xl font-black">
                      {stats.totalEnquiries}
                    </div>
                  </div>

                  <div className="bg-foreground/[0.02] border-foreground/10 flex flex-col gap-2 rounded-2xl border p-5 shadow-sm transition-colors hover:border-[var(--color-brand-green)]/30">
                    <div className="text-muted flex items-center gap-2 text-[10px] font-black tracking-wider uppercase">
                      <Phone size={14} className="text-rose-500" /> Leads
                    </div>
                    <div className="text-foreground text-3xl font-black">{stats.totalLeads}</div>
                  </div>

                  <div className="bg-foreground/[0.02] border-foreground/10 flex flex-col gap-2 rounded-2xl border p-5 shadow-sm transition-colors hover:border-[var(--color-brand-green)]/30">
                    <div className="text-muted flex items-center gap-2 text-[10px] font-black tracking-wider uppercase">
                      <FileText size={14} className="text-purple-500" /> Loans
                    </div>
                    <div className="text-foreground text-3xl font-black">
                      {stats.totalLoanApplications}
                    </div>
                  </div>

                  <div className="bg-background border-foreground/10 text-muted col-span-2 flex items-center justify-center gap-3 rounded-xl border p-4 text-sm font-bold shadow-sm md:col-span-4">
                    <Calendar size={16} className="text-[var(--color-brand-orange)]" />
                    Member Since:{' '}
                    <span className="text-foreground">
                      {new Date(stats.memberSince).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              )}
            </section>
          </form>
        </div>

        {/* Sticky Footer */}
        <div className="border-foreground/10 bg-background z-10 flex shrink-0 justify-end gap-3 border-t px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-foreground bg-foreground/5 hover:bg-foreground/10 rounded-xl px-6 py-2.5 font-bold transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-user-form"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-8 py-2.5 font-black text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(29,191,115,0.3)] disabled:transform-none disabled:opacity-50 disabled:shadow-none"
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
