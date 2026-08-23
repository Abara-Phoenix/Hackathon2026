import 'katex/dist/katex.min.css'
import { parseMathText, renderMathMarkup } from '../utils/mathText.js'

function MathText({ children, className = '' }) {
  const segments = parseMathText(children)
  const classes = ['math-text', className].filter(Boolean).join(' ')

  return (
    <span className={classes}>
      {segments.map((segment, index) => (
        segment.type === 'math' ? (
          <span
            className={`math-text__formula${segment.displayMode ? ' math-text__formula--display' : ''}`}
            // KaTeX escapes untrusted input because trust is disabled in renderMathMarkup.
            dangerouslySetInnerHTML={{
              __html: renderMathMarkup(segment.value, segment.displayMode),
            }}
            key={`${segment.type}-${index}`}
          />
        ) : (
          <span className="math-text__plain" key={`${segment.type}-${index}`}>
            {segment.value}
          </span>
        )
      ))}
    </span>
  )
}

export default MathText
