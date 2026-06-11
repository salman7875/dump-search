import SearchBar from "./search-bar";
import logo from "../../assets/logo.png";

const ResultHeader = () => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-zinc-100">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
        <div className="h-8 w-8 rounded bg-zinc-900 flex items-center justify-center text-white font-bold text-base shrink-0">
          <img src={logo} alt="logo png" />
        </div>

        <SearchBar />
      </div>
    </header>
  );
};

export default ResultHeader;
