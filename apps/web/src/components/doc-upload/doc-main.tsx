import DocUploadSection from "./doc-upload";

const DocMain = () => {
  return (
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
  );
};

export default DocMain;
