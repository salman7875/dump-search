const ResultTag = ({ tags }: { tags: string[] }) => {
  return (
    <div className="flex items-center gap-1.5 mt-3">
      {tags.map((tag, idx) => (
        <span
          key={idx}
          className="text-xs bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded text-zinc-500 font-medium tracking-tight"
        >
          {tag}
        </span>
      ))}
    </div>
  );
};

export default ResultTag;
