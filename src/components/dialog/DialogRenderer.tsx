import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDialogStore } from '../../store/dialogStore'

function ModalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/35 px-3">
      <div className="relative w-[320px] max-w-[calc(100vw-20px)] rounded-md bg-white shadow-lg dark:bg-slate-800">
        {children}
      </div>
    </div>
  )
}

export function DialogRenderer() {
  const { t } = useTranslation()

  const alert = useDialogStore((state) => state.alert)
  const closeAlert = useDialogStore((state) => state.closeAlert)

  const confirm = useDialogStore((state) => state.confirm)
  const checkConfirm = useDialogStore((state) => state.checkConfirm)
  const closeConfirm = useDialogStore((state) => state.closeConfirm)

  const anyOpen = alert.open || confirm.open

  useEffect(() => {
    if (!anyOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [anyOpen])

  return (
    <>
      {alert.open && (
        <ModalShell>
          <div className="absolute -top-6 left-[calc(50%-24px)] flex items-center justify-center rounded-full border-4 border-indigo-500 bg-white p-2 text-indigo-500 dark:bg-slate-800">
            <span className="material-symbols-outlined">priority_high</span>
          </div>

          <div className="whitespace-pre-wrap px-4 pb-3 pt-10 text-sm leading-normal text-slate-700 dark:text-white">
            {alert.message}
          </div>

          <div className="flex items-center justify-end p-4 pt-2">
            <button
              type="button"
              className="cursor-pointer rounded-md bg-indigo-500 px-3 py-1 text-xs font-semibold text-white"
              onClick={closeAlert}
            >
              {t('확인')}
            </button>
          </div>
        </ModalShell>
      )}

      {confirm.open && (
        <ModalShell>
          <div className="absolute -top-6 left-[calc(50%-24px)] flex items-center justify-center rounded-full border-4 border-indigo-500 bg-white p-2 text-indigo-500 dark:bg-slate-800">
            <span className="material-symbols-outlined">question_mark</span>
          </div>

          <div className="whitespace-pre-wrap px-4 pb-3 pt-10 text-sm leading-normal text-slate-700 dark:text-white">
            {confirm.message}
          </div>

          <div className="flex items-center justify-end gap-1 p-4 pt-2">
            <button
              type="button"
              className="cursor-pointer rounded-md bg-indigo-500 px-3 py-1 text-xs font-semibold text-white"
              onClick={checkConfirm}
            >
              {t('확인')}
            </button>
            <button
              type="button"
              className="cursor-pointer rounded-md bg-slate-400 px-3 py-1 text-xs font-semibold text-white"
              onClick={closeConfirm}
            >
              {t('취소')}
            </button>
          </div>
        </ModalShell>
      )}
    </>
  )
}
