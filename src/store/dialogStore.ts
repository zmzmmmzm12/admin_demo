import { create } from 'zustand'

interface AlertState {
  open: boolean
  message: string
  onClose?: () => void
}

interface ConfirmState {
  open: boolean
  message: string
  onConfirm?: () => void
  onCancel?: () => void
}

interface DialogStoreState {
  alert: AlertState
  confirm: ConfirmState
  openAlert: (message: string, onClose?: () => void) => void
  closeAlert: () => void
  openConfirm: (message: string, onConfirm?: () => void, onCancel?: () => void) => void
  checkConfirm: () => void
  closeConfirm: () => void
}

export const useDialogStore = create<DialogStoreState>((set, get) => ({
  alert: {
    open: false,
    message: '',
  },
  confirm: {
    open: false,
    message: '',
  },

  openAlert: (message, onClose) =>
    set(() => ({
      alert: {
        open: true,
        message,
        onClose,
      },
    })),

  closeAlert: () => {
    const onClose = get().alert.onClose
    onClose?.()

    set(() => ({
      alert: {
        open: false,
        message: '',
      },
    }))
  },

  openConfirm: (message, onConfirm, onCancel) =>
    set(() => ({
      confirm: {
        open: true,
        message,
        onConfirm,
        onCancel,
      },
    })),

  checkConfirm: () => {
    const onConfirm = get().confirm.onConfirm
    onConfirm?.()

    set(() => ({
      confirm: {
        open: false,
        message: '',
      },
    }))
  },

  closeConfirm: () => {
    const onCancel = get().confirm.onCancel
    onCancel?.()

    set(() => ({
      confirm: {
        open: false,
        message: '',
      },
    }))
  },
}))

export function useDialogActions() {
  const openAlert = useDialogStore((state) => state.openAlert)
  const openConfirm = useDialogStore((state) => state.openConfirm)

  return { openAlert, openConfirm }
}
