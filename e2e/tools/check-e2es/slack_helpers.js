/* eslint-disable import/prefer-default-export */
import { spawnSync } from 'child_process'

export const sendMessageToSlackCIAlerts = text => {
  const payload = JSON.stringify({ text: text })
  const curlProcess = spawnSync(
    'curl',
    [
      '-X',
      'POST',
      '-H',
      "'Content-type: application/json'",
      '--data',
      `'${payload}'`,
      process.env.SLACK_WEBHOOK_URL,
    ],
    { shell: true }
  )

  // console.log(curlProcess.stdout.toString())
  // console.log(curlProcess.stderr.toString())
  // console.log(curlProcess.status)
}
