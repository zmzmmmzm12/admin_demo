import { useEffect, useRef } from 'react'
import { AppModalPortal } from './AppModalPortal'
import styles from './AppModal.module.scss'

let bodyLockCount = 0
let lockedScrollY = 0
let prevBodyStyle: {
  position: string
  top: string
  overflowY: string
  width: string
} | null = null

function lockBodyScroll() {
  if (bodyLockCount === 0) {
    const body = document.body
    prevBodyStyle = {
      position: body.style.position,
      top: body.style.top,
      overflowY: body.style.overflowY,
      width: body.style.width,
    }

    lockedScrollY = window.scrollY
    body.style.position = 'fixed'
    body.style.top = `-${lockedScrollY}px`
    body.style.overflowY = 'scroll'
    body.style.width = '100%'
  }

  bodyLockCount += 1
}

function unlockBodyScroll() {
  if (bodyLockCount === 0) {
    return
  }

  bodyLockCount -= 1
  if (bodyLockCount > 0) {
    return
  }

  const body = document.body
  const savedStyle = prevBodyStyle

  if (savedStyle) {
    body.style.position = savedStyle.position
    body.style.top = savedStyle.top
    body.style.overflowY = savedStyle.overflowY
    body.style.width = savedStyle.width
  } else {
    body.style.removeProperty('position')
    body.style.removeProperty('top')
    body.style.removeProperty('overflow-y')
    body.style.removeProperty('width')
  }

  window.scrollTo(0, lockedScrollY)
  prevBodyStyle = null
}

interface AppModalProps {
  open: boolean
  children: React.ReactNode
  onClose?: () => void
  closeOnBackdrop?: boolean
  zIndex?: number
}

export function AppModal({
  open,
  children,
  onClose,
  closeOnBackdrop = true,
  zIndex = 90,
}: AppModalProps) {
  const backgroundRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    lockBodyScroll()
    return () => {
      unlockBodyScroll()
    }
  }, [open])

  if (!open) {
    return null
  }

  return (
    <AppModalPortal>
      <div
        ref={backgroundRef}
        className={styles.container}
        style={{ zIndex }}
        onClick={(event) => {
          if (!closeOnBackdrop || !onClose) {
            return
          }

          if (event.target === backgroundRef.current) {
            onClose()
          }
        }}
      >
        <div className={styles.wrapper}>
          <div className={styles.inner}>
            <div className={styles.content}>{children}</div>
          </div>
        </div>
      </div>
    </AppModalPortal>
  )
}
