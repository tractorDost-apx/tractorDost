'use client';

import React, { useState, useEffect } from 'react';
import { mediaAPI, Media } from '@/lib/api/media';
import { Image as ImageIcon, Search, Trash2, FileText, CheckCircle } from 'lucide-react';

export default function MediaGalleryPage() {
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const response = await mediaAPI.getAllMedia({ page, limit: 12, search });
      if (response.success) {
        setMediaItems(response.data.data);
        setTotalPages(response.data.totalPages);
        setTotalCount(response.data.totalCount);
      }
    } catch (error) {
      console.error('Failed to fetch media', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchMedia();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, page]);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this media item? This might break images on the site.')) {
      try {
        await mediaAPI.deleteMedia(id);
        fetchMedia();
      } catch (error) {
        alert('Failed to delete media.');
      }
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Media Gallery</h1>
          <p className="text-sm font-bold text-muted mt-1">Manage all uploaded images and documents across the platform.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-panel p-4 rounded-2xl">
        <div className="flex items-center gap-4 text-sm font-bold w-full md:w-auto">
          <div className="flex items-center gap-2 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] px-4 py-2 rounded-xl">
            <ImageIcon size={18} />
            Total Assets: {totalCount}
          </div>
        </div>

        <div className="relative w-full md:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted group-focus-within:text-[var(--color-brand-green)] transition-colors">
            <Search size={16} />
          </div>
          <input 
            type="text" 
            placeholder="Search alt text or caption..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-foreground/5 border border-transparent rounded-full py-2.5 pl-10 pr-4 text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
          />
        </div>
      </div>

      <div className="flex-1">
        {loading ? (
          <div className="w-full h-64 flex items-center justify-center font-bold text-muted">
            Loading media...
          </div>
        ) : mediaItems.length === 0 ? (
          <div className="w-full h-64 flex flex-col items-center justify-center font-bold text-muted glass-panel rounded-2xl gap-2">
            <ImageIcon size={48} className="opacity-20" />
            No media found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mediaItems.map(item => (
              <div key={item.id} className="glass-panel rounded-2xl overflow-hidden group flex flex-col">
                <div className="relative aspect-video bg-foreground/5 flex items-center justify-center overflow-hidden">
                  {item.mediaType === 'pdf' ? (
                    <FileText size={48} className="text-muted" />
                  ) : (
                    <img 
                      src={item.url} 
                      alt={item.altText || 'Media Asset'} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                  )}
                  {item.isPrimary && (
                    <div className="absolute top-2 left-2 bg-[var(--color-brand-green)] text-white text-[10px] font-black uppercase px-2 py-1 rounded-md shadow-md flex items-center gap-1">
                      <CheckCircle size={10} /> Primary
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-sm text-foreground truncate" title={item.altText || item.fileId}>
                      {item.altText || item.fileId?.split('/').pop() || 'Unnamed Asset'}
                    </h3>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="text-muted hover:text-red-500 transition-colors p-1"
                      title="Delete Asset"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex flex-col gap-1 text-[10px] font-bold text-muted uppercase tracking-wider mt-auto">
                    <span>Type: {item.targetType}</span>
                    <span>ID: {item.targetId}</span>
                    <span>Size: {formatSize(item.fileSize)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="glass-panel p-4 rounded-2xl flex items-center justify-between">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 text-sm font-bold rounded-xl bg-foreground/5 hover:bg-foreground/10 disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            Previous
          </button>
          <span className="text-sm font-bold text-muted">Page {page} of {totalPages}</span>
          <button 
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 text-sm font-bold rounded-xl bg-foreground/5 hover:bg-foreground/10 disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
