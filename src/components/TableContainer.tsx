import { useEffect, useRef } from "react";

type TableContainerProps = {
  children: React.ReactNode;
  tableClassName?: string;
  wrapperClassName?: string;
};

export function TableContainer({
  children,
  tableClassName = "w-full",
  wrapperClassName = "px-5",
}: TableContainerProps) {
  const maskRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = maskRef.current;
    if (!el) return;

    const EPS = 1;

    const applyMask = (mask: string) => {
      el.style.maskImage = mask;
      el.style.maskRepeat = "no-repeat";
    };

    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const hasOverflow = scrollWidth - clientWidth > EPS;

      if (!hasOverflow) {
        applyMask("");
        return;
      }

      const atLeft = scrollLeft <= EPS;
      const atRight = scrollLeft + clientWidth >= scrollWidth - EPS;

      if (atLeft) {
        applyMask("linear-gradient(to right, black 90%, transparent 100%)");
      } else if (atRight) {
        applyMask("linear-gradient(to right, transparent 0%, black 10%)");
      } else {
        applyMask(
          "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
        );
      }
    };

    update();
    const onScroll = () => update();
    const ro = new ResizeObserver(() => update());

    el.addEventListener("scroll", onScroll, { passive: true });
    ro.observe(el);
    window.addEventListener("resize", update);

    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className={wrapperClassName}>
      <div
        className="scroll-custom-container overflow-x-auto overflow-y-hidden pb-2"
        ref={maskRef}
      >
        <table className={tableClassName}>{children}</table>
      </div>
    </div>
  );
}
