import { Link } from "react-router-dom";

interface HeaderListLinkProps {
  to: string;
}

export function HeaderListLink({ to }: HeaderListLinkProps) {
  return (
    <Link
      to={to}
      className="flex items-center justify-center"
      aria-label="back to list"
    >
      <span className="material-symbols-outlined text-lg text-slate-600 dark:text-slate-400">
        arrow_back_ios
      </span>
    </Link>
  );
}
