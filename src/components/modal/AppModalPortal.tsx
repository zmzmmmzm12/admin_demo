import { createPortal } from 'react-dom'

interface AppModalPortalProps {
  children: React.ReactNode
}

export function AppModalPortal({ children }: AppModalPortalProps) {
  if (typeof document === 'undefined') {
    return null
  }

  const portalRoot = document.getElementById('modal') ?? document.body
  return createPortal(children, portalRoot)
}
