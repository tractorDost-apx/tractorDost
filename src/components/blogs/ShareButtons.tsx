'use client';

import React, { useState } from 'react';
import { Share2, Check, Copy, MessageCircle } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  url?: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (url) return url;
    if (typeof window !== 'undefined') return window.location.href;
    return '';
  };

  const handleCopyLink = async () => {
    const shareUrl = getShareUrl();
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleWhatsAppShare = () => {
    const shareUrl = getShareUrl();
    const text = `${title}\n\nRead more on TractorDost: ${shareUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1.5 text-xs font-bold text-muted mr-1">
        <Share2 size={14} className="text-[var(--color-brand-green)]" />
        Share:
      </span>

      {/* WhatsApp Button */}
      <button
        type="button"
        onClick={handleWhatsAppShare}
        className="flex items-center gap-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 px-3.5 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-600/30 hover:border-emerald-500/50 transition-all shadow-sm"
      >
        <MessageCircle size={14} />
        <span>WhatsApp</span>
      </button>

      {/* Copy Link Button */}
      <button
        type="button"
        onClick={handleCopyLink}
        className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all shadow-sm ${
          copied
            ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-400'
            : 'border-white/10 bg-white/5 text-muted hover:bg-white/10 hover:text-white'
        }`}
      >
        {copied ? (
          <>
            <Check size={14} className="text-emerald-400" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy size={14} />
            <span>Copy Link</span>
          </>
        )}
      </button>
    </div>
  );
}
