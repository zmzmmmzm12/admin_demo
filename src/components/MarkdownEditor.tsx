import MDEditor from '@uiw/react-md-editor'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  hasError?: boolean
  height?: number
}

export function MarkdownEditor({ value, onChange, hasError = false, height = 520 }: MarkdownEditorProps) {
  return (
    <div className="wmde-markdown-var">
      <MDEditor
        value={value}
        onChange={(next) => onChange(next ?? '')}
        preview="live"
        height={height}
        style={hasError ? { border: '1px solid rgb(244 63 94)', borderRadius: '6px' } : undefined}
        commandsFilter={(command) => (command.name === 'image' ? false : command)}
      />
    </div>
  )
}
