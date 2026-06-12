import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface SearchContextType {
  search: string;
  setSearch: (val: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [search, setSearch] = useState<string>("");

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
  }, []);

  const value = useMemo(
    () => ({
      search,
      setSearch: handleSearch,
    }),
    [search, handleSearch],
  );

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};

export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);

  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchContextProvider");
  }

  return context;
};
