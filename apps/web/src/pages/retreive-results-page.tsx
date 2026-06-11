import React, { useState, type ChangeEvent, type FormEvent } from "react";
import { Search, ShieldCheck } from "lucide-react";
import type { RetreiveResult } from "../types/retreive.type";

const mockResults: RetreiveResult[] = [
  {
    id: "1",
    title: "Mastering React 19 Server Components: Production Architecture",
    url: "https://nextjs.org/docs/app/building-your-application/rendering/server-components",
    displayUrl: "nextjs.org › docs › building-your-application",
    snippet:
      "Dive deep into the architectural paradigms of React 19 Server Components (RSC). Learn how to optimize data fetching layers, manage asynchronous data caching boundaries, and serialize properties without inflating client-side bundle payloads.",
    updatedAt: "2 weeks ago",
    category: "Documentation",
    tags: ["React 19", "RSC", "Next.js"],
  },
  {
    id: "2",
    title: "The Ultimate Guide to Async Actions and Form Handling in React 19",
    url: "https://react.dev/reference/react/useActionState",
    displayUrl: "react.dev › reference › react › useActionState",
    snippet:
      "Explore the new architectural hooks in React 19. A detailed breakdown of useActionState, useFormStatus, and optimal implementation of transition elements to elevate UI state tracking natively without third-party libraries.",
    updatedAt: "May 2026",
    category: "Reference",
  },
  {
    id: "3",
    title:
      "Performance Benchmarks: Client Rendering vs. React Server Components",
    url: "https://vercel.com/blog/react-19-rsc-performance-benchmarks",
    displayUrl: "vercel.com › blog › react-19-rsc-performance",
    snippet:
      "Empirical analysis tracking Total Blocking Time (TBT), First Contentful Paint (FCP), and Cumulative Layout Shift (CLS) comparing modular SPA apps against streaming React Server Components in high-concurrency environments.",
    updatedAt: "3 days ago",
    category: "Analysis",
    tags: ["Performance", "Web-Vitals"],
  },
];

const RetreiveResultsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>(
    "React 19 Server Components best practices 2026",
  );

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 antialiased font-sans">
      <header className="sticky top-0 z-50 bg-white border-b border-zinc-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <div className="h-8 w-8 rounded bg-zinc-900 flex items-center justify-center text-white font-bold text-base shrink-0">
            Ω
          </div>

          <form onSubmit={handleSearch} className="flex-1 relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
              className="w-full pl-11 pr-4 py-2.5 bg-zinc-50 focus:bg-white border border-zinc-200 focus:border-zinc-900 rounded-md text-sm font-normal focus:outline-none transition-colors"
              placeholder="Search anything..."
            />
          </form>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="space-y-10">
          {mockResults.map((result) => (
            <article
              key={result.id}
              className="flex flex-col items-start group"
            >
              <div className="flex items-center gap-2 mb-1.5 text-zinc-500 text-xs">
                <div className="w-4 h-4 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3 h-3 text-zinc-600" />
                </div>
                <span className="truncate max-w-md font-normal">
                  {result.displayUrl}
                </span>
                <span className="text-zinc-300">|</span>
                <span className="text-[11px] font-medium text-zinc-400">
                  {result.updatedAt}
                </span>
              </div>

              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-900 group-hover:text-zinc-600 font-semibold text-lg leading-tight tracking-tight transition-colors"
              >
                {result.title}
              </a>

              <p className="mt-2 text-sm text-zinc-600 leading-relaxed max-w-2xl">
                {result.snippet}
              </p>

              {result.tags && (
                <div className="flex items-center gap-1.5 mt-3">
                  {result.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded text-zinc-500 font-medium tracking-tight"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};

export default RetreiveResultsPage;
