import React from "react";
import DocUploadSection from "../components/doc-upload/doc-upload";
import { LayoutGrid, History, Settings, HelpCircle } from "lucide-react";

const DocUploadPage: React.FC = () => {
  return (
    <div className="relative min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 flex flex-col antialiased overflow-x-hidden">
      
      {/* Aesthetic Background Accents */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-40%] left-[-20%] w-[80%] h-[80%] rounded-full bg-gradient-to-tr from-indigo-200/30 to-violet-200/10 dark:from-indigo-950/20 dark:to-transparent blur-[120px]" />
        <div className="absolute bottom-[-40%] right-[-20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-fuchsia-200/20 to-indigo-200/20 dark:from-purple-950/10 dark:to-transparent blur-[120px]" />
      </div>

      {/* Modern Global Navigation Header */}
      <header className="w-full border-b border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <LayoutGrid className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 block tracking-tight">DocuVault</span>
            <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 block -mt-0.5">Workspace</span>
          </div>
        </div>

        {/* Minimal Actions */}
        <div className="flex items-center gap-1">
          <button className="p-2 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors" title="Upload History">
            <History className="w-4 h-4" />
          </button>
          <button className="p-2 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors" title="Settings">
            <Settings className="w-4 h-4" />
          </button>
          <button className="p-2 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors" title="Help">
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 max-w-4xl w-full mx-auto animate-fade-in">
        
        {/* Screen Intro Context */}
        <div className="text-center mb-8 max-w-md">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100/40 dark:border-indigo-900/30">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Secure Upload Conduit
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mt-3">
            Deposit Your Files
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Injest, process, and parse structural documentation seamlessly into your active pipeline.
          </p>
        </div>

        {/* The Uploader Component */}
        <div className="w-full">
          <DocUploadSection />
        </div>

      </main>

      {/* Subtle Utility Footer */}
      <footer className="w-full py-4 px-6 border-t border-zinc-200/40 dark:border-zinc-900/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-400 dark:text-zinc-500">
        <p>© 2026 DocuVault Systems Inc. All encryption end-to-end.</p>
        <div className="flex gap-4">
          <a href="#privacy" className="hover:underline hover:text-zinc-600 dark:hover:text-zinc-300">Privacy Policy</a>
          <a href="#terms" className="hover:underline hover:text-zinc-600 dark:hover:text-zinc-300">Terms of Service</a>
        </div>
      </footer>

    </div>
  );
};


export default DocUploadPage