import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Comment {
  id: number;
  author: string;
  authorEmail?: string;
  content: string;
  createdAt?: string;
}

interface CommentsSectionProps {
  comments: Comment[];
  onSend: (comment: string) => void;
  onDelete: (commentId: number) => void;
  isAuthenticated: boolean;
  currentUserEmail?: string;
}

export default function CommentsSection({
  comments,
  onSend,
  onDelete,
  isAuthenticated,
  currentUserEmail,
}: CommentsSectionProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input.trim());
      setInput('');
    }
  };

  return (
    <div className="mt-6 w-full">
      <h3 className="text-lg font-bold mb-2">{t('material.comments')}</h3>
      {isAuthenticated ? (
        <form onSubmit={send} className="flex gap-2 mb-4">
          <input
            className="flex-1 border rounded px-3 py-2"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('comments.add_comment_placeholder')}
          />
          <button
            type="submit"
            className="bg-purple-600 text-white px-5 py-2 rounded hover:bg-purple-700"
          >
            {t('material.submitComment')}
          </button>
        </form>
      ) : (
        <div className="mb-4 text-gray-500 italic">
          <a
            href="/login"
            className="text-purple-700 underline hover:text-purple-900 font-medium"
          >
            {t('comments.login')}
          </a>{" "}
          {t('comments.to_comment')}
        </div>
      )}
      <div className="space-y-3">
        {comments.length === 0 && (
          <div className="text-gray-500 italic">{t('comments.no_comments')}</div>
        )}
        {comments.map((c, i) => (
          <div key={c.id ?? i} className="bg-gray-100 rounded px-3 py-2 relative group">
            <div className="font-semibold text-gray-700">
              {c.author || t('comments.anonymous')}
            </div>
            <div className="text-gray-900">{c.content}</div>
            <div className="text-xs text-gray-400">
              {c.createdAt && new Date(c.createdAt).toLocaleDateString()}
            </div>
            {/* Show delete only if current user is author */}
            {isAuthenticated && c.authorEmail === currentUserEmail && (
              <button
                className="absolute top-2 right-2 text-xs text-red-500 bg-red-100 rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition"
                onClick={() => {
                  if (window.confirm(t('comments.confirmDelete'))) {
                    onDelete(c.id);
                  }
                }}
                title={t('material.deleteComment')}
              >
                {t('comments.delete')}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
