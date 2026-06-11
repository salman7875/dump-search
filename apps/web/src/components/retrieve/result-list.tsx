import { ShieldCheck } from "lucide-react";
import type { RetreiveResult } from "../../types/retreive.type";
import ResultItem from "./result-item";

const mockResults: RetreiveResult[] = [
  {
    id: "1",
    title: "Mastering React 19 Server Components: Production Architecture",
    url: "https://nextjs.org/docs/app/building-your-application/rendering/server-components",
    displayUrl: "nextjs.org › docs › building-your-application",
    snippet:
      "Dive deep into the architectural paradigms of React 19 Server Components (RSC). Learn how to optimize data fetching layers, manage asynchronous data caching boundaries, and serialize properties without inflating client-side bundle payloads.",
    updatedAt: "2 weeks ago",
    category: "Documentation",
    tags: ["React 19", "RSC", "Next.js"],
  },
  {
    id: "2",
    title: "The Ultimate Guide to Async Actions and Form Handling in React 19",
    url: "https://react.dev/reference/react/useActionState",
    displayUrl: "react.dev › reference › react › useActionState",
    snippet:
      "Explore the new architectural hooks in React 19. A detailed breakdown of useActionState, useFormStatus, and optimal implementation of transition elements to elevate UI state tracking natively without third-party libraries.",
    updatedAt: "May 2026",
    category: "Reference",
  },
  {
    id: "3",
    title:
      "Performance Benchmarks: Client Rendering vs. React Server Components",
    url: "https://vercel.com/blog/react-19-rsc-performance-benchmarks",
    displayUrl: "vercel.com › blog › react-19-rsc-performance",
    snippet:
      "Empirical analysis tracking Total Blocking Time (TBT), First Contentful Paint (FCP), and Cumulative Layout Shift (CLS) comparing modular SPA apps against streaming React Server Components in high-concurrency environments.",
    updatedAt: "3 days ago",
    category: "Analysis",
    tags: ["Performance", "Web-Vitals"],
  },
];

const ResultList = () => {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <div className="space-y-10">
        {mockResults.map((result: RetreiveResult) => (
          <ResultItem result={result} />
        ))}
      </div>
    </main>
  );
};

export default ResultList;
