import type { ChangeEvent } from "react";

interface AppCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function AppCheckbox({
  checked,
  onChange,
  disabled,
  className,
  ariaLabel,
}: AppCheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      disabled={disabled}
      aria-label={ariaLabel}
      className={
        className ??
        "relative h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 checked:border-indigo-500 checked:bg-indigo-500 checked:before:content-[''] checked:before:absolute checked:before:top-[calc(50%-1px)] checked:before:left-1/2 checked:before:-translate-x-1/2 checked:before:-translate-y-1/2 checked:before:rotate-45 checked:before:w-1.5 checked:before:h-2.5 checked:before:border-b-2 checked:before:border-r-2 checked:before:border-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-border dark:bg-dark-surface dark:checked:border-indigo-500 dark:checked:bg-indigo-500"
      }
      onChange={(event) => onChange(event.target.checked, event)}
    />
  );
}
