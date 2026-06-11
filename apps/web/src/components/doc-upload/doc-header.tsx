import { HelpCircle, History, Settings } from "lucide-react";
import { useNavigate } from "react-router";

import logo from "../../assets/logo.png";

const DocHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="w-full border-b border-zinc-100 bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded bg-zinc-900 flex items-center justify-center">
          <img src={logo} className="" />
        </div>
        <div>
          <span
            onClick={() => navigate("/")}
            className="text-sm font-semibold text-zinc-900 block tracking-tight cursor-pointer"
          >
            DumpSearch
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
  );
};

export default DocHeader;
