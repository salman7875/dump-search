const DocFooter = () => {
  return (
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
  );
};

export default DocFooter;
