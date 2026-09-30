"use client";

import React, { useRef } from "react";
import {
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Code,
  Quote,
} from "lucide-react";

export default function BioSection({ aboutText, setAboutText }) {
  const textareaRef = useRef(null);

  const wordCount = aboutText?.trim()
    ? aboutText
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0).length
    : 0;

  const insertMarkdown = (prefix, suffix = "") => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selection = text.substring(start, end);

    const replacement = `${prefix}${selection || "text"}${suffix}`;
    const newText =
      text.substring(0, start) + replacement + text.substring(end);
    setAboutText(newText);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selection ? selection.length : 4),
      );
    }, 0);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-7 space-y-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight">
            About & Biography
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Highlight your background, philosophy, and proven deliverables
          </p>
        </div>
        <span className="text-xs text-muted-foreground font-medium pt-1">
          Markdown Supported
        </span>
      </div>

      {/* Markdown Toolbar */}
      <div className="space-y-0">
        <div className="flex items-center justify-between bg-muted/40 border border-border border-b-0 rounded-t-xl px-3 py-2 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <button
              type="button"
              onClick={() => insertMarkdown("**", "**")}
              className="p-1.5 hover:bg-muted hover:text-foreground rounded transition-colors"
              title="Bold"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("*", "*")}
              className="p-1.5 hover:bg-muted hover:text-foreground rounded transition-colors"
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("[", "](url)")}
              className="p-1.5 hover:bg-muted hover:text-foreground rounded transition-colors"
              title="Insert Link"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
            <span className="w-px h-3.5 bg-border mx-1" />
            <button
              type="button"
              onClick={() => insertMarkdown("\n• ")}
              className="p-1.5 hover:bg-muted hover:text-foreground rounded transition-colors"
              title="Bullet List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("\n1. ")}
              className="p-1.5 hover:bg-muted hover:text-foreground rounded transition-colors"
              title="Numbered List"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("`", "`")}
              className="p-1.5 hover:bg-muted hover:text-foreground rounded transition-colors"
              title="Code"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown("\n> ")}
              className="p-1.5 hover:bg-muted hover:text-foreground rounded transition-colors"
              title="Quote"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="text-[11px] font-mono text-muted-foreground">
            {wordCount} / 2,000 words
          </span>
        </div>

        <textarea
          ref={textareaRef}
          value={aboutText}
          onChange={(e) => setAboutText(e.target.value)}
          placeholder="Tell us about your background, experience, and how you deliver value..."
          className="w-full min-h-[170px] rounded-t-none rounded-b-xl bg-background/50 border border-border p-4 text-xs md:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-y leading-relaxed font-sans"
        />
      </div>
    </div>
  );
}
