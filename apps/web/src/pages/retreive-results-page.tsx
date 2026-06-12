import ResultHeader from "../components/retrieve/result-header";
import ResultList from "../components/retrieve/result-list";
import { SearchContextProvider } from "../context/search-context";

const RetreiveResultsPage: React.FC = () => {
  return (
    <SearchContextProvider>
      <div className="min-h-screen bg-white text-zinc-900 antialiased font-sans">
        <ResultHeader />
        <ResultList />
      </div>
    </SearchContextProvider>
  );
};

export default RetreiveResultsPage;
