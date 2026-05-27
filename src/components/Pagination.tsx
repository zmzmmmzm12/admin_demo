import { useEffect, useMemo, useState } from "react";

interface PaginationProps {
  total: number;
  curr: number;
  limit: number;
  movePage: (page: number) => void;
}

export function Pagination({ total, curr, limit, movePage }: PaginationProps) {
  const totalPages = useMemo(
    () => Math.floor(total / limit) + (total % limit !== 0 ? 1 : 0),
    [limit, total],
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [maxPage, setMaxPage] = useState(5);

  const onPage = (nextPage: number) => {
    setCurrentPage(nextPage);
    setMaxPage(
      nextPage === 0
        ? 5
        : nextPage % 5 === 0
          ? nextPage
          : Math.floor(nextPage / 5) * 5 + 5,
    );

    if (curr !== nextPage) {
      movePage(nextPage);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    onPage(curr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curr]);

  const onPrev = () => {
    if (totalPages === 0 || maxPage === 5) return;
    const nextPage = maxPage - 9;
    setCurrentPage(nextPage);
    setMaxPage(maxPage - 5);
    onPage(nextPage);
  };

  const onNext = () => {
    if (totalPages === 0 || maxPage >= totalPages) return;
    onPage(maxPage + 1);
    setMaxPage(maxPage + 5);
  };

  const onFirst = () => {
    if (totalPages === 0 || maxPage === 5) return;
    setCurrentPage(1);
    setMaxPage(5);
    onPage(1);
  };

  const onLast = () => {
    if (totalPages === 0 || maxPage >= totalPages) return;
    setMaxPage(totalPages);
    onPage(totalPages);
  };

  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  ).filter((item) => !(maxPage - item < 0 || maxPage - item >= 5));

  return (
    <div className="flex items-center justify-center gap-1 p-5 pb-8">
      {/*
        Keep cursor behavior explicit per control:
        - interactive: cursor-pointer
        - unavailable: disabled + cursor-not-allowed
      */}
      <button
        type="button"
        className="flex size-7 cursor-pointer items-center justify-center rounded-md border border-gray-400 text-gray-400 disabled:cursor-not-allowed disabled:opacity-25"
        disabled={totalPages === 0 || maxPage === 5}
        onClick={onFirst}
      >
        <span className="material-symbols-outlined text-xl">first_page</span>
      </button>

      <button
        type="button"
        className="flex size-7 cursor-pointer items-center justify-center rounded-md border border-gray-400 text-gray-400 disabled:cursor-not-allowed disabled:opacity-25"
        disabled={totalPages === 0 || maxPage === 5}
        onClick={onPrev}
      >
        <span className="material-symbols-outlined text-xl">chevron_left</span>
      </button>

      {pages.length === 0 ? (
        <div className="flex h-7 min-w-[1.75rem] cursor-default items-center justify-center rounded-md border border-indigo-500 px-2 text-sm tabular-nums text-indigo-500 dark:border-indigo-400 dark:text-indigo-300">
          {currentPage}
        </div>
      ) : (
        pages.map((page) => (
          <button
            type="button"
            key={page}
            className={`flex h-7 min-w-[1.75rem] cursor-pointer items-center justify-center rounded-md border px-2 text-sm tabular-nums disabled:cursor-not-allowed ${
              currentPage === page
                ? "border-indigo-500 text-indigo-500 dark:border-indigo-400 dark:text-indigo-300"
                : "border-gray-400 text-gray-400 dark:border-slate-500 dark:text-slate-400"
            }`}
            disabled={currentPage === page}
            onClick={() => onPage(page)}
          >
            {page}
          </button>
        ))
      )}

      <button
        type="button"
        className="flex size-7 cursor-pointer items-center justify-center rounded-md border border-gray-400 text-gray-400 disabled:cursor-not-allowed disabled:opacity-25"
        disabled={totalPages === 0 || maxPage >= totalPages}
        onClick={onNext}
      >
        <span className="material-symbols-outlined text-xl">chevron_right</span>
      </button>

      <button
        type="button"
        className="flex size-7 cursor-pointer items-center justify-center rounded-md border border-gray-400 text-gray-400 disabled:cursor-not-allowed disabled:opacity-25"
        disabled={totalPages === 0 || maxPage >= totalPages}
        onClick={onLast}
      >
        <span className="material-symbols-outlined text-xl">last_page</span>
      </button>
    </div>
  );
}
