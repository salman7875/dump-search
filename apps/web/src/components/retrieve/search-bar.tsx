import { Search } from "lucide-react";
import React, { useState } from "react";

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState<string>(
    "React 19 Server Components best practices 2026",
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };
  return (
    <form onSubmit={handleSearch} className="flex-1 relative">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-400">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSearchQuery(e.target.value)
        }
        className="w-full pl-11 pr-4 py-2.5 bg-zinc-50 focus:bg-white border border-zinc-200 focus:border-zinc-900 rounded-md text-sm font-normal focus:outline-none transition-colors"
        placeholder="Search anything..."
      />
    </form>
  );
};

export default SearchBar;
