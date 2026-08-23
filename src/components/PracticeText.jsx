import MathText from './MathText.jsx'

const INLINE_CODE_PATTERN = /(`[^`\n]+`)/g

function PracticeText({ children, codeAware = false, className = '' }) {
  if (!codeAware || typeof children !== 'string') {
    return <MathText className={className}>{children}</MathText>
  }

  const classes = ['practice-text', 'practice-text--code-aware', className]
    .filter(Boolean)
    .join(' ')
  const segments = children.split(INLINE_CODE_PATTERN).filter(Boolean)

  return (
    <span className={classes}>
      {segments.map((segment, index) => (
        segment.startsWith('`') && segment.endsWith('`') ? (
          <code className="practice-text__inline-code" key={`code-${index}`}>
            {segment.slice(1, -1)}
          </code>
        ) : (
          <MathText key={`text-${index}`}>{segment}</MathText>
        )
      ))}
    </span>
  )
}

export default PracticeText
