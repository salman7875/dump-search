import ResultHeader from "../components/retrieve/result-header";
import ResultList from "../components/retrieve/result-list";

const RetreiveResultsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-zinc-900 antialiased font-sans">
      <ResultHeader />
      <ResultList />
    </div>
  );
};

export default RetreiveResultsPage;
