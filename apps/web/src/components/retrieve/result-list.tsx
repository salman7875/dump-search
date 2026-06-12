import ResultItem from "./result-item";
import { useEffect, useState } from "react";
import { useSearch } from "../../context/search-context";
import { API } from "../../api/api";
import type { RetrieveData } from "../../types/api.types";

const ResultList = () => {
  const [data, setData] = useState<RetrieveData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { search } = useSearch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        if (!search) return;
        const res = await API.getResult(search);
        if (!res.success) {
          throw new Error(res?.message ?? "Something went wrong!");
        }
        setData(res.data as RetrieveData[]);
      } catch (error) {
        // @ts-ignore
        setError((error?.message as string) || "Something went wrong!");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [search]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <div className="space-y-10">
        {data.map((result: RetrieveData) => (
          <ResultItem result={result} />
        ))}
      </div>
    </main>
  );
};

export default ResultList;
