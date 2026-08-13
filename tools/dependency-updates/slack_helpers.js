const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL

export const sendMessageToSlackCIAlerts = async text => {
  const res = await fetch(SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '<unreadable>')
    throw new Error(`Slack webhook returned HTTP ${res.status}: ${body}`)
  }
}
