import React from "react";
import DocUploadSection from "../components/doc-upload/doc-upload";
import { LayoutGrid, History, Settings, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router";

const DocUploadPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-white flex flex-col antialiased">
      <header className="w-full border-b border-zinc-100 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded bg-zinc-900 flex items-center justify-center">
            <LayoutGrid className="w-4 h-4 text-white" />
          </div>
          <div>
            <span
              onClick={() => navigate("/")}
              className="text-sm font-semibold text-zinc-900 block tracking-tight cursor-pointer"
            >
              DumpSearch
            </span>
            <span className="text-[11px] font-medium text-zinc-400 block -mt-0.5">
              Workspace
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            className="p-2 text-zinc-500 hover:text-zinc-900 rounded hover:bg-zinc-50 transition-colors"
            title="Upload History"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            className="p-2 text-zinc-500 hover:text-zinc-900 rounded hover:bg-zinc-50 transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            className="p-2 text-zinc-500 hover:text-zinc-900 rounded hover:bg-zinc-50 transition-colors"
            title="Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 max-w-4xl w-full mx-auto">
        <div className="text-center mb-8 max-w-md">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
            Secure Upload Conduit
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mt-4">
            Deposit Your Files
          </h1>
          <p className="text-sm text-zinc-500 mt-1.5">
            Ingest, process, and parse structural documentation seamlessly into
            your active pipeline.
          </p>
        </div>

        <div className="w-full">
          <DocUploadSection />
        </div>
      </main>

      <footer className="w-full py-4 px-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-400">
        <p>© 2026 DumpSearch Systems Inc. End-to-end encryption active.</p>
        <div className="flex gap-4">
          <a href="#privacy" className="hover:underline hover:text-zinc-900">
            Privacy Policy
          </a>
          <a href="#terms" className="hover:underline hover:text-zinc-900">
            Terms of Service
          </a>
        </div>
      </footer>
    </div>
  );
};

export default DocUploadPage;
