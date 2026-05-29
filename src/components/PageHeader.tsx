interface PageHeaderProps {
  title: string
  description: string
  titleAction?: React.ReactNode
}

export function PageHeader({ title, description, titleAction }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap px-3">
      <div className="flex w-full flex-wrap items-center gap-2 pb-5">
        <div className="flex items-center gap-2">
          {titleAction}
          <div className="text-lg font-semibold text-slate-600 dark:text-slate-300">{title}</div>
        </div>
        <div className="ml-auto text-sm text-slate-500 dark:text-slate-400">{description}</div>
      </div>
    </header>
  )
}
