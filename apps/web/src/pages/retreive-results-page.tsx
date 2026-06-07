import React, { useState, type ChangeEvent, type FormEvent } from "react";
import { 
  Search, SlidersHorizontal, Globe, FileText, Image, 
  Video, MoreHorizontal, ArrowUpRight, ShieldCheck, 
  ChevronDown, Sparkles 
} from "lucide-react";
import type { AIOverview, RetreiveResult } from "../types/retreive.type";


const RetreiveResultsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("React 19 Server Components best practices 2026");
  const [activeTab, setActiveTab] = useState<string>("All");

  // --- Mock Results Data ---
  const mockResults: RetreiveResult[] = [
    {
      id: "1",
      title: "Mastering React 19 Server Components: Production Architecture",
      url: "https://nextjs.org/docs/app/building-your-application/rendering/server-components",
      displayUrl: "nextjs.org › docs › building-your-application",
      snippet: "Dive deep into the architectural paradigms of React 19 Server Components (RSC). Learn how to optimize data fetching layers, manage asynchronous data caching boundaries, and serialize properties without inflating client-side bundle payloads.",
      updatedAt: "2 weeks ago",
      category: "Documentation",
      tags: ["React 19", "RSC", "Next.js"]
    },
    {
      id: "2",
      title: "The Ultimate Guide to Async Actions and Form Handling in React 19",
      url: "https://react.dev/reference/react/useActionState",
      displayUrl: "react.dev › reference › react › useActionState",
      snippet: "Explore the new architectural hooks in React 19. A detailed breakdown of useActionState, useFormStatus, and optimal implementation of transition elements to elevate UI state tracking natively without third-party libraries.",
      updatedAt: "May 2026",
      category: "Reference"
    },
    {
      id: "3",
      title: "Performance Benchmarks: Client Rendering vs. React Server Components",
      url: "https://vercel.com/blog/react-19-rsc-performance-benchmarks",
      displayUrl: "vercel.com › blog › react-19-rsc-performance",
      snippet: "Empirical analysis tracking Total Blocking Time (TBT), First Contentful Paint (FCP), and Cumulative Layout Shift (CLS) comparing modular SPA apps against streaming React Server Components in high-concurrency environments.",
      updatedAt: "3 days ago",
      category: "Analysis",
      tags: ["Performance", "Web-Vitals"]
    }
  ];

  const aiOverview: AIOverview = {
    summary: "React 19 Server Components (RSCs) shift component rendering to the build phase or server infrastructure, drastically dropping client-side hydration cost. In 2026, the standard practice emphasizes streaming chunks directly and leveraging native server-actions for secure mutation environments.",
    keyTakeaways: [
      "Zero impact on client bundles: Dependencies remain isolated on server runtimes.",
      "Data proximity: Fetching runs directly alongside database configurations to minimize round-trip latencies.",
      "Native security: Data layers pass over secure serial boundaries instinctively."
    ]
  };

  const tabs = [
    { id: "All", label: "All Results", icon: Globe },
    { id: "Docs", label: "Documentation", icon: FileText },
    { id: "Images", label: "Images", icon: Image },
    { id: "Videos", label: "Videos", icon: Video }
  ];

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    // Trigger your search query engine or API integration here
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased selection:bg-indigo-500/20">
      
      {/* Top Search Bar Header Stickiness */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/60 dark:border-zinc-800/60 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-linear-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-lg shadow-sm">
              Ω
            </div>
            <span className="text-md font-bold tracking-tight hidden sm:inline-block bg-linear-to-r from-zinc-900 to-zinc-600 dark:from-zinc-50 dark:to-zinc-400 bg-clip-text text-transparent">
              DumpSearch
            </span>
          </div>

          {/* Core Search Input Form */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-20 py-2.5 bg-zinc-50 hover:bg-zinc-100/70 focus:bg-white dark:bg-zinc-900 dark:hover:bg-zinc-800/60 dark:focus:bg-zinc-900/80 border border-zinc-200 focus:border-indigo-500 dark:border-zinc-800 dark:focus:border-indigo-500 rounded-full shadow-inner-sm text-sm font-medium focus:outline-none transition-all duration-200"
              placeholder="Search anything..."
            />
            <div className="absolute right-2.5 inset-y-1.5 flex gap-1">
              <button 
                type="button" 
                className="px-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-full hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors"
                title="Search Filters"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* Dynamic Filtering Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-6 text-sm overflow-x-auto no-scrollbar md:pl-10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 py-3 border-b-2 font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive 
                      ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400" 
                      : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
            <button className="flex items-center gap-1 py-3 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 font-medium">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container Layout split */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Results Feed & Engine Telemetry */}
        <section className="lg:col-span-7 space-y-8 md:pl-10">
          
          {/* Engine Telemetry Info */}
          <div className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
            About 1,420,000 architectural vectors resolved (0.18 seconds)
          </div>

          {/* SERP Results Loop */}
          <div className="space-y-7">
            {mockResults.map((result) => (
              <article key={result.id} className="group relative flex flex-col items-start">
                
                {/* Meta-context & Verified Status */}
                <div className="flex items-center gap-2 mb-1.5 max-w-full">
                  <div className="w-4 h-4 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3 h-3 text-indigo-500" />
                  </div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-xs md:max-w-md">
                    {result.displayUrl}
                  </span>
                  <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 rounded font-mono shrink-0">
                    {result.updatedAt}
                  </span>
                </div>

                {/* Hyperlinked Actionable Header */}
                <a 
                  href={result.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group-hover:underline text-indigo-600 visited:text-purple-700 dark:text-indigo-400 dark:visited:text-purple-400 font-semibold text-lg leading-tight tracking-tight block"
                >
                  {result.title}
                </a>

                {/* Snippet Narrative Paragraph */}
                <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
                  {result.snippet}
                </p>

                {/* Attribute tags if any exist */}
                {result.tags && (
                  <div className="flex items-center gap-1.5 mt-3">
                    {result.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 px-2 py-0.5 rounded-full text-zinc-500 dark:text-zinc-400 font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>

          {/* Simple Pagination Footer Vector */}
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
            <button className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg text-sm font-semibold transition-colors">
              Previous
            </button>
            <div className="flex items-center gap-1 text-sm font-semibold text-zinc-400">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">1</span>
              <span className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer text-zinc-600 dark:text-zinc-400">2</span>
              <span className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer text-zinc-600 dark:text-zinc-400">3</span>
            </div>
            <button className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-lg text-sm font-semibold transition-colors">
              Next
            </button>
          </div>
        </section>

        {/* RIGHT COLUMN: Intelligent Sidebar / AI Overview Knowledge Panel */}
        <aside className="lg:col-span-5 space-y-6">
          <div className="border border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/20 dark:bg-indigo-950/10 rounded-2xl p-5 shadow-sm relative overflow-hidden backdrop-blur-sm">
            
            {/* Top Right Design Detail Blur */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-indigo-500/10 to-transparent blur-xl pointer-events-none" />

            {/* Panel Heading */}
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm tracking-tight mb-3">
              <Sparkles className="w-4 h-4 fill-indigo-500/20" />
              <span>AI Synthesized Summary</span>
            </div>

            {/* Summary Text Content Block */}
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
              {aiOverview.summary}
            </p>

            {/* Bullet Point Metrics */}
            <hr className="my-4 border-indigo-100/60 dark:border-indigo-950/80" />
            
            <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2.5">Key Insights</h4>
            <ul className="space-y-2.5">
              {aiOverview.keyTakeaways.map((takeaway, index) => (
                <li key={index} className="flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-400 leading-normal">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
            
            {/* Link-out Panel Footer */}
            <div className="mt-5 pt-3.5 border-t border-indigo-100/40 dark:border-indigo-950/40 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <span className="flex items-center gap-1 hover:underline cursor-pointer">
                Explore deep canvas insights <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Accessory Widget Card: Quick Search Advice */}
          <div className="border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 bg-zinc-50/40 dark:bg-zinc-900/10">
            <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">People Also Ask</h3>
            <div className="space-y-1 text-sm font-medium">
              {["What's new in React 19 concurrent features?", "Should I use Server Components for basic static blogs?", "How to deploy Server Actions with secure authentication?"].map((question, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0 border-zinc-100 dark:border-zinc-900 text-zinc-700 hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400 cursor-pointer group transition-colors">
                  <span>{question}</span>
                  <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-inherit transform -rotate-90" />
                </div>
              ))}
            </div>
          </div>
        </aside>

      </main>
    </div>
  );
};

export default RetreiveResultsPage