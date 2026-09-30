'use client';

import React, { useState, useEffect } from 'react';
import { mediaAPI, Media } from '@/lib/api/media';
import { Image as ImageIcon, Search, Trash2, FileText, CheckCircle } from 'lucide-react';
import Pagination from '@/components/shared/Pagination';

export default function MediaGalleryPage() {
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const response = await mediaAPI.getAllMedia({ page, limit: 12, search });
      if (response.success) {
        setMediaItems(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalCount(response.data.totalCount || 0);
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
    if (
      confirm(
        'Are you sure you want to delete this media item? This might break images on the site.'
      )
    ) {
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
    <div className="animate-fade-in flex h-full w-full flex-col gap-6 pb-12">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground text-3xl font-black tracking-tight">Media Gallery</h1>
          <p className="text-muted mt-1 text-sm font-bold">
            Manage all uploaded images and documents across the platform.
          </p>
        </div>
      </div>

      <div className="glass-panel flex flex-col items-center justify-between gap-4 rounded-2xl p-4 md:flex-row">
        <div className="flex w-full items-center gap-4 text-sm font-bold md:w-auto">
          <div className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)]/10 px-4 py-2 text-[var(--color-brand-green)]">
            <ImageIcon size={18} />
            Total Assets: {totalCount}
          </div>
        </div>

        <div className="group relative w-full md:w-80">
          <div className="text-muted pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 transition-colors group-focus-within:text-[var(--color-brand-green)]">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search alt text or caption..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="bg-foreground/5 text-foreground placeholder:text-muted focus:bg-background w-full rounded-full border border-transparent py-2.5 pr-4 pl-10 text-sm font-medium transition-all focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1">
        {loading ? (
          <div className="text-muted flex h-64 w-full items-center justify-center font-bold">
            Loading media...
          </div>
        ) : mediaItems.length === 0 ? (
          <div className="text-muted glass-panel flex h-64 w-full flex-col items-center justify-center gap-2 rounded-2xl font-bold">
            <ImageIcon size={48} className="opacity-20" />
            No media found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {mediaItems.map((item) => (
              <div
                key={item.id}
                className="glass-panel group flex flex-col overflow-hidden rounded-2xl"
              >
                <div className="bg-foreground/5 relative flex aspect-video items-center justify-center overflow-hidden">
                  {item.mediaType === 'pdf' ? (
                    <FileText size={48} className="text-muted" />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.altText || 'Media Asset'}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  )}
                  {item.isPrimary && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-[var(--color-brand-green)] px-2 py-1 text-[10px] font-black text-white uppercase shadow-md">
                      <CheckCircle size={10} /> Primary
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className="text-foreground truncate text-sm font-bold"
                      title={item.altText || item.fileId}
                    >
                      {item.altText || item.fileId?.split('/').pop() || 'Unnamed Asset'}
                    </h3>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-muted p-1 transition-colors hover:text-red-500"
                      title="Delete Asset"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="text-muted mt-auto flex flex-col gap-1 text-[10px] font-bold tracking-wider uppercase">
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
        <div className="glass-panel flex items-center justify-between rounded-2xl p-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="bg-foreground/5 hover:bg-foreground/10 rounded-xl px-4 py-2 text-sm font-bold transition-colors disabled:pointer-events-none disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-muted text-sm font-bold">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="bg-foreground/5 hover:bg-foreground/10 rounded-xl px-4 py-2 text-sm font-bold transition-colors disabled:pointer-events-none disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
