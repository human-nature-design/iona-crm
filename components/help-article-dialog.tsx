'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';

interface HelpArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articlePath: string;
  title: string;
}

// MDX components for custom styling
const mdxComponents = {
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="text-3xl font-bold text-white mb-6">{children}</h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-2xl font-semibold text-white mb-4 mt-8">{children}</h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-xl font-semibold text-white mb-3 mt-6">{children}</h3>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="text-gray-300 mb-4 leading-relaxed">{children}</p>
  ),
  code: ({ children }: { children: React.ReactNode }) => (
    <code className="bg-gray-800 text-purple-300 px-2 py-1 rounded text-sm font-mono">
      {children}
    </code>
  ),
  pre: ({ children }: { children: React.ReactNode }) => (
    <pre className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-4 overflow-x-auto">
      <code className="text-gray-300 text-sm font-mono">{children}</code>
    </pre>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2 ml-4">
      {children}
    </ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-2 ml-4">
      {children}
    </ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="text-gray-300">{children}</li>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="border-l-4 border-purple-500 pl-4 my-4 italic text-gray-400">
      {children}
    </blockquote>
  ),
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="text-white font-semibold">{children}</strong>
  ),
  em: ({ children }: { children: React.ReactNode }) => (
    <em className="text-gray-300 italic">{children}</em>
  ),
  hr: () => <hr className="border-gray-700 my-8" />,
  a: ({ href, children }: { href?: string; children: React.ReactNode }) => (
    <a 
      href={href} 
      className="text-purple-400 hover:text-purple-300 underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
};

export default function HelpArticleDialog({ 
  open, 
  onOpenChange, 
  articlePath, 
  title 
}: HelpArticleDialogProps) {
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && articlePath) {
      loadArticle();
    }
  }, [open, articlePath]);

  const loadArticle = async () => {
    setLoading(true);
    setError(null);

    try {
      // Extract slug from articlePath
      const slug = articlePath.split('/').pop()?.replace('.mdx', '') || '';

      // Fetch article content from new content API (try help first, then blog)
      let response = await fetch(`/api/content/help/${slug}`);
      if (!response.ok) {
        response = await fetch(`/api/content/blog/${slug}`);
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch article: ${response.status}`);
      }

      const { mdxSource } = await response.json();
      
      // MDX is already serialized on the server
      setMdxSource(mdxSource);
    } catch (err) {
      console.error('Error loading article:', err);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="
          w-screen h-screen max-w-none max-h-none m-0 p-0 rounded-none
          md:w-[calc(100vw-300px-100px)] md:h-[calc(100vh-100px)] md:max-w-[1500px] md:rounded-lg md:m-auto
          bg-gray-900 border border-gray-700
        "
        showCloseButton={false}
      >
        {/* Header with navigation */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-700 bg-gray-900">
          <div className="flex items-center gap-3">
            {/* Mobile back button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="md:hidden text-gray-300 hover:text-white hover:bg-gray-800 p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <DialogTitle className="text-white text-lg md:text-xl font-semibold">
                {title}
              </DialogTitle>
              {/* Breadcrumb for mobile */}
              <div className="md:hidden text-sm text-gray-400 mt-1">
                ← Back to Home
              </div>
            </div>
          </div>
          
          {/* Desktop close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="hidden md:flex text-gray-300 hover:text-white hover:bg-gray-800 p-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="prose prose-invert max-w-none">
            {loading && (
              <div className="text-gray-400 text-center py-8">
                Loading article...
              </div>
            )}
            
            {error && (
              <div className="text-red-400 text-center py-8">
                {error}
              </div>
            )}
            
            {mdxSource && (
              <MDXRemote {...mdxSource} components={mdxComponents} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 