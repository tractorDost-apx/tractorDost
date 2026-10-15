'use client';

import React, { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Undo2,
  Redo2,
  Code,
  Minus,
} from 'lucide-react';

export interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  editable?: boolean;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = 'Write your article or blog post content here...',
  minHeight = '360px',
  editable = true,
}: RichTextEditorProps) {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[var(--color-brand-green)] underline underline-offset-4 hover:opacity-80 transition-opacity',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-xl border border-white/10 my-4 shadow-lg object-cover',
        },
      }),
      CharacterCount,
    ],
    content,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  // Keep editor content in sync when loaded asynchronously (e.g. edit mode)
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // Only set if different to avoid cursor jumps
      if (editor.getText().trim() === '' && content.trim() !== '') {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      setShowLinkModal(false);
      return;
    }

    const validUrl = /^https?:\/\//i.test(linkUrl) ? linkUrl : `https://${linkUrl}`;
    editor.chain().focus().extendMarkRange('link').setLink({ href: validUrl }).run();
    setLinkUrl('');
    setShowLinkModal(false);
  }, [editor, linkUrl]);

  const addImage = useCallback(() => {
    if (!editor || !imageUrl.trim()) return;
    editor.chain().focus().setImage({ src: imageUrl.trim(), alt: imageAlt.trim() || undefined }).run();
    setImageUrl('');
    setImageAlt('');
    setShowImageModal(false);
  }, [editor, imageUrl, imageAlt]);

  if (!editor) {
    return (
      <div
        className="glass-panel flex items-center justify-center rounded-xl p-8 text-sm text-muted animate-pulse"
        style={{ minHeight }}
      >
        Loading editor...
      </div>
    );
  }

  const words = editor.storage.characterCount.words();
  const characters = editor.storage.characterCount.characters();

  return (
    <div className="flex flex-col rounded-2xl border border-white/10 bg-[#0c120e]/80 shadow-2xl backdrop-blur-md overflow-hidden transition-all focus-within:border-[var(--color-brand-green)]/40 focus-within:ring-2 focus-within:ring-[var(--color-brand-green)]/15">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1 border-b border-white/10 bg-white/[0.03] p-2 sm:px-3">
        <div className="flex flex-wrap items-center gap-1">
          {/* Bold */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            title="Bold"
            className={`rounded-lg p-2 text-sm transition-all ${
              editor.isActive('bold')
                ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                : 'text-muted hover:bg-white/10 hover:text-foreground'
            }`}
          >
            <Bold size={16} />
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            title="Italic"
            className={`rounded-lg p-2 text-sm transition-all ${
              editor.isActive('italic')
                ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                : 'text-muted hover:bg-white/10 hover:text-foreground'
            }`}
          >
            <Italic size={16} />
          </button>

          <div className="mx-1 h-5 w-px bg-white/10" />

          {/* Heading 2 */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading 2"
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-black transition-all ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                : 'text-muted hover:bg-white/10 hover:text-foreground'
            }`}
          >
            <Heading2 size={16} />
            <span>H2</span>
          </button>

          {/* Heading 3 */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Heading 3"
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-black transition-all ${
              editor.isActive('heading', { level: 3 })
                ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                : 'text-muted hover:bg-white/10 hover:text-foreground'
            }`}
          >
            <Heading3 size={16} />
            <span>H3</span>
          </button>

          <div className="mx-1 h-5 w-px bg-white/10" />

          {/* Bullet List */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet List"
            className={`rounded-lg p-2 text-sm transition-all ${
              editor.isActive('bulletList')
                ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                : 'text-muted hover:bg-white/10 hover:text-foreground'
            }`}
          >
            <List size={16} />
          </button>

          {/* Ordered List */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered List"
            className={`rounded-lg p-2 text-sm transition-all ${
              editor.isActive('orderedList')
                ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                : 'text-muted hover:bg-white/10 hover:text-foreground'
            }`}
          >
            <ListOrdered size={16} />
          </button>

          {/* Blockquote */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Quote"
            className={`rounded-lg p-2 text-sm transition-all ${
              editor.isActive('blockquote')
                ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                : 'text-muted hover:bg-white/10 hover:text-foreground'
            }`}
          >
            <Quote size={16} />
          </button>

          {/* Horizontal Rule */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Divider Line"
            className="rounded-lg p-2 text-sm text-muted hover:bg-white/10 hover:text-foreground transition-all"
          >
            <Minus size={16} />
          </button>

          <div className="mx-1 h-5 w-px bg-white/10" />

          {/* Link */}
          <button
            type="button"
            onClick={() => {
              const previousUrl = editor.getAttributes('link').href || '';
              setLinkUrl(previousUrl);
              setShowLinkModal(true);
            }}
            title="Insert Link"
            className={`rounded-lg p-2 text-sm transition-all ${
              editor.isActive('link')
                ? 'bg-[var(--color-brand-green)] text-white shadow-sm'
                : 'text-muted hover:bg-white/10 hover:text-foreground'
            }`}
          >
            <LinkIcon size={16} />
          </button>

          {editor.isActive('link') && (
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetLink().run()}
              title="Remove Link"
              className="rounded-lg p-2 text-sm text-red-400 hover:bg-red-500/10 transition-all"
            >
              <Unlink size={16} />
            </button>
          )}

          {/* Image */}
          <button
            type="button"
            onClick={() => setShowImageModal(true)}
            title="Insert Image by URL"
            className="rounded-lg p-2 text-sm text-muted hover:bg-white/10 hover:text-foreground transition-all"
          >
            <ImageIcon size={16} />
          </button>

          <div className="mx-1 h-5 w-px bg-white/10" />

          {/* Undo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            title="Undo"
            className="rounded-lg p-2 text-sm text-muted hover:bg-white/10 hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <Undo2 size={16} />
          </button>

          {/* Redo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            title="Redo"
            className="rounded-lg p-2 text-sm text-muted hover:bg-white/10 hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <Redo2 size={16} />
          </button>
        </div>

        {/* Word and Character Count */}
        <div className="flex items-center gap-3 px-2 text-xs font-semibold text-muted">
          <span>{words} {words === 1 ? 'word' : 'words'}</span>
          <span className="opacity-40">•</span>
          <span>{characters} {characters === 1 ? 'character' : 'characters'}</span>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="relative p-4 sm:p-6" style={{ minHeight }}>
        <EditorContent
          editor={editor}
          className="prose prose-invert max-w-none focus:outline-none [&_.tiptap]:outline-none [&_.tiptap]:min-h-[280px]
            [&_.tiptap_h2]:text-2xl [&_.tiptap_h2]:font-black [&_.tiptap_h2]:text-white [&_.tiptap_h2]:mt-6 [&_.tiptap_h2]:mb-3
            [&_.tiptap_h3]:text-xl [&_.tiptap_h3]:font-bold [&_.tiptap_h3]:text-white/90 [&_.tiptap_h3]:mt-4 [&_.tiptap_h3]:mb-2
            [&_.tiptap_p]:text-white/80 [&_.tiptap_p]:leading-relaxed [&_.tiptap_p]:my-2.5
            [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-6 [&_.tiptap_ul]:my-3 [&_.tiptap_ul_li]:text-white/80 [&_.tiptap_ul_li]:my-1
            [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-6 [&_.tiptap_ol]:my-3 [&_.tiptap_ol_li]:text-white/80 [&_.tiptap_ol_li]:my-1
            [&_.tiptap_blockquote]:border-l-4 [&_.tiptap_blockquote]:border-[var(--color-brand-green)] [&_.tiptap_blockquote]:bg-white/[0.02] [&_.tiptap_blockquote]:pl-4 [&_.tiptap_blockquote]:py-1.5 [&_.tiptap_blockquote]:my-4 [&_.tiptap_blockquote]:italic [&_.tiptap_blockquote]:text-white/70
            [&_.tiptap_hr]:border-white/10 [&_.tiptap_hr]:my-6
            [&_.tiptap_p.is-editor-empty:first-child::before]:text-white/20 [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.tiptap_p.is-editor-empty:first-child::before]:float-left [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none [&_.tiptap_p.is-editor-empty:first-child::before]:h-0"
        />
      </div>

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 shadow-2xl border border-white/15 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="mb-2 text-lg font-black text-white flex items-center gap-2">
              <LinkIcon size={18} className="text-[var(--color-brand-green)]" />
              Insert Hyperlink
            </h3>
            <p className="mb-4 text-xs text-muted">
              Enter target web address (URL) for the highlighted text.
            </p>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com/tractor-news"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  setLink();
                }
              }}
              className="mb-4 w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:border-[var(--color-brand-green)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-green)]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-muted hover:bg-white/10 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={setLink}
                className="rounded-xl bg-[var(--color-brand-green)] px-5 py-2 text-xs font-bold text-white shadow-md hover:opacity-90 transition-all"
              >
                Apply Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 shadow-2xl border border-white/15 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="mb-2 text-lg font-black text-white flex items-center gap-2">
              <ImageIcon size={18} className="text-[var(--color-brand-green)]" />
              Embed Image from URL
            </h3>
            <p className="mb-4 text-xs text-muted">
              Paste a public image link (e.g. Cloudinary, Unsplash, or CDN).
            </p>
            <div className="flex flex-col gap-3 mb-4">
              <div>
                <label className="text-xs font-bold text-muted mb-1 block">Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/tractor-image.jpg"
                  autoFocus
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:border-[var(--color-brand-green)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-green)]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted mb-1 block">Alt Description (Optional)</label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="e.g. Mahindra 575 DI in action"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:border-[var(--color-brand-green)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-green)]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-muted hover:bg-white/10 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addImage}
                disabled={!imageUrl.trim()}
                className="rounded-xl bg-[var(--color-brand-green)] px-5 py-2 text-xs font-bold text-white shadow-md hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none transition-all"
              >
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
