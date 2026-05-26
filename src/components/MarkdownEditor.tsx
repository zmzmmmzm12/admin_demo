import { useMemo } from 'react'
import MDEditor, { commands, type ICommand } from '@uiw/react-md-editor'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  hasError?: boolean
  height?: number
}

export function MarkdownEditor({ value, onChange, hasError = false, height = 520 }: MarkdownEditorProps) {
  const imageCommand: ICommand = useMemo(
    () => ({
      ...commands.image,
      buttonProps: {
        ...commands.image.buttonProps,
        'aria-label': 'Insert image markdown',
      },
    }),
    [],
  )

  return (
    <MDEditor
      value={value}
      onChange={(next) => onChange(next ?? '')}
      preview="live"
      height={height}
      style={hasError ? { border: '1px solid rgb(244 63 94)', borderRadius: '6px' } : undefined}
      commandsFilter={(command) => (command.name === 'image' ? imageCommand : command)}
    />
  )
}
