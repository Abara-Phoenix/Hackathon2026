function AiStatusBadge({ status }) {
  const state = status?.state ?? 'checking'
  const label = state === 'connected'
    ? 'AI ready'
    : state === 'configured'
      ? 'AI configured'
      : state === 'fallback' ? 'Seeded mode' : 'Checking AI'

  return (
    <span
      className={`ai-status ai-status--${state}`}
      title={status?.model
        ? `${status.message} Model: ${status.model}.`
        : status?.message}
    >
      <span className="ai-status__dot" aria-hidden="true" />
      {label}
    </span>
  )
}

export default AiStatusBadge
