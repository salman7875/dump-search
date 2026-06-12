import { Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSearch } from "../../context/search-context";

const SearchBar = () => {
  const [input, setInput] = useState("");
  const { setSearch } = useSearch();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(input);
    }, 300);
    return () => clearTimeout(timer);
  }, [input]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 relative">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-400">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={input}
        onChange={handleSearch}
        className="w-full pl-11 pr-4 py-2.5 bg-zinc-50 focus:bg-white border border-zinc-200 focus:border-zinc-900 rounded-md text-sm font-normal focus:outline-none transition-colors"
        placeholder="Search anything..."
      />
    </form>
  );
};

export default SearchBar;
