import { useMemo } from "react";

const PAGE_GROUP_SIZE = 5;

interface PaginationProps {
  total: number;
  curr: number;
  limit: number;
  movePage: (page: number) => void;
}

export function Pagination({ total, curr, limit, movePage }: PaginationProps) {
  const totalPages = useMemo(
    () => (limit > 0 ? Math.ceil(total / limit) : 0),
    [limit, total],
  );

  const currentPage = curr;
  const maxPage =
    currentPage === 0
      ? PAGE_GROUP_SIZE
      : currentPage % PAGE_GROUP_SIZE === 0
        ? currentPage
        : Math.floor(currentPage / PAGE_GROUP_SIZE) * PAGE_GROUP_SIZE +
          PAGE_GROUP_SIZE;

  const onPage = (nextPage: number) => {
    if (curr !== nextPage) {
      movePage(nextPage);
    }
  };

  const onPrev = () => {
    if (totalPages === 0 || maxPage === PAGE_GROUP_SIZE) return;
    const nextPage = maxPage - PAGE_GROUP_SIZE * 2 + 1;
    onPage(nextPage);
  };

  const onNext = () => {
    if (totalPages === 0 || maxPage >= totalPages) return;
    onPage(maxPage + 1);
  };

  const onFirst = () => {
    if (totalPages === 0 || maxPage === PAGE_GROUP_SIZE) return;
    onPage(1);
  };

  const onLast = () => {
    if (totalPages === 0 || maxPage >= totalPages) return;
    onPage(totalPages);
  };

  const pageGroupStart = Math.max(maxPage - PAGE_GROUP_SIZE + 1, 1);
  const pageGroupEnd = Math.min(maxPage, totalPages);
  const pages = Array.from(
    { length: Math.max(pageGroupEnd - pageGroupStart + 1, 0) },
    (_, index) => pageGroupStart + index,
  );

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
        disabled={totalPages === 0 || maxPage === PAGE_GROUP_SIZE}
        onClick={onFirst}
        aria-label="first page"
      >
        <span className="material-symbols-outlined text-xl">first_page</span>
      </button>

      <button
        type="button"
        className="flex size-7 cursor-pointer items-center justify-center rounded-md border border-gray-400 text-gray-400 disabled:cursor-not-allowed disabled:opacity-25"
        disabled={totalPages === 0 || maxPage === PAGE_GROUP_SIZE}
        onClick={onPrev}
        aria-label="previous page group"
      >
        <span className="material-symbols-outlined text-xl">chevron_left</span>
      </button>

      {pages.length === 0 ? (
        <div
          className="flex h-7 min-w-[1.75rem] cursor-default items-center justify-center rounded-md border border-indigo-500 px-2 text-sm tabular-nums text-indigo-500 dark:border-indigo-400 dark:text-indigo-300"
          aria-current="page"
        >
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
            aria-current={currentPage === page ? "page" : undefined}
            aria-label={`page ${page}`}
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
        aria-label="next page group"
      >
        <span className="material-symbols-outlined text-xl">chevron_right</span>
      </button>

      <button
        type="button"
        className="flex size-7 cursor-pointer items-center justify-center rounded-md border border-gray-400 text-gray-400 disabled:cursor-not-allowed disabled:opacity-25"
        disabled={totalPages === 0 || maxPage >= totalPages}
        onClick={onLast}
        aria-label="last page"
      >
        <span className="material-symbols-outlined text-xl">last_page</span>
      </button>
    </div>
  );
}
