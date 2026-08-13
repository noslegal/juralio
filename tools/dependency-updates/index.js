import { execFile } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { sendMessageToSlackCIAlerts } from './slack_helpers.js'

const execFileAsync = promisify(execFile)

// Repo root is two levels up from tools/dependency-updates.
const REPO_ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '../..')

// Directories we never descend into when hunting for package.json files.
const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'out', '.next'])

// Each manifest is posted as its own Slack message so nothing is truncated. As
// a safety net, an individual message is split further if it would exceed this
// character budget (Slack's hard limit is ~40k; we stay well under).
const MAX_MESSAGE_CHARS = 3500

// Walk the repo and collect every package.json directory (excluding the
// directories above). Returns absolute directory paths.
async function findManifestDirs(dir) {
  const found = []
  const entries = await fs.readdir(dir, { withFileTypes: true })

  let hasManifest = false
  for (const entry of entries) {
    if (entry.isFile() && entry.name === 'package.json') {
      hasManifest = true
    }
  }
  if (hasManifest) {
    found.push(dir)
  }

  for (const entry of entries) {
    if (entry.isDirectory() && !IGNORED_DIRS.has(entry.name)) {
      found.push(...(await findManifestDirs(path.join(dir, entry.name))))
    }
  }

  return found
}

// Run `npm outdated --json` in a directory. npm exits 1 when updates exist, so
// we ignore the exit code and parse stdout regardless.
async function getOutdated(dir) {
  try {
    const { stdout } = await execFileAsync('npm', ['outdated', '--json'], {
      cwd: dir,
      maxBuffer: 10 * 1024 * 1024,
    })
    return stdout ? JSON.parse(stdout) : {}
  } catch (err) {
    // exit code 1 still carries the JSON payload on stdout.
    if (err.stdout) {
      try {
        return JSON.parse(err.stdout)
      } catch {
        // fall through to the error path below
      }
    }
    throw new Error(err.shortMessage || err.message)
  }
}

// An update is "available" when the latest published version differs from what
// our manifest currently allows (wanted), or from what is installed (current).
function collectUpdates(outdated) {
  const updates = []
  for (const [name, info] of Object.entries(outdated)) {
    // `npm outdated --json` can return an array when a package is required at
    // multiple versions — normalise to a single entry.
    const entry = Array.isArray(info) ? info[0] : info
    if (!entry || !entry.latest) continue

    const baseline = entry.current || entry.wanted
    if (baseline && baseline !== entry.latest) {
      updates.push({
        name,
        current: entry.current || entry.wanted || '—',
        latest: entry.latest,
      })
    }
  }
  updates.sort((a, b) => a.name.localeCompare(b.name))
  return updates
}

// Split a manifest's update lines into messages that each stay under the
// character budget, keeping whole lines together. `header` is repeated on every
// chunk (with a " (cont.)" marker on continuations) so each message stands alone.
function buildChunks(header, lines) {
  const chunks = []
  let current = []
  let length = header.length

  for (const line of lines) {
    if (current.length > 0 && length + line.length + 1 > MAX_MESSAGE_CHARS) {
      chunks.push(current)
      current = []
      length = header.length
    }
    current.push(line)
    length += line.length + 1
  }
  if (current.length > 0) chunks.push(current)

  return chunks.map((chunkLines, i) => {
    const heading = i === 0 ? header : `${header} (cont.)`
    return `${heading}\n${chunkLines.join('\n')}`
  })
}

// Post a message, logging failures without aborting the whole run so one bad
// post does not drop the remaining manifests' summaries.
async function post(message) {
  try {
    await sendMessageToSlackCIAlerts(message)
    return true
  } catch (err) {
    console.error(`failed to post Slack message: ${err.message}`)
    return false
  }
}

async function run() {
  const manifestDirs = await findManifestDirs(REPO_ROOT)
  console.log(`scanning ${manifestDirs.length} manifest(s) for updates`)

  const sections = []
  const errors = []
  let totalUpdates = 0

  for (const dir of manifestDirs) {
    const relative = path.relative(REPO_ROOT, dir) || '.'
    try {
      const outdated = await getOutdated(dir)
      const updates = collectUpdates(outdated)
      if (updates.length === 0) {
        console.log(`${relative}: up to date`)
        continue
      }
      totalUpdates += updates.length
      console.log(`${relative}: ${updates.length} update(s) available`)

      const lines = updates.map(u => `   • ${u.name}: ${u.current} → ${u.latest}`)
      sections.push({ relative, count: updates.length, lines })
    } catch (err) {
      console.error(`${relative}: scan failed (${err.message})`)
      errors.push(`${relative}: ${err.message}`)
    }
  }

  let allPosted = true

  if (totalUpdates === 0 && errors.length === 0) {
    allPosted = await post(
      'Weekly Dependency Updates :package:\nAll dependencies are up to date :white_check_mark:'
    )
  } else {
    // Lead-in summary, then one message per manifest so nothing is truncated.
    const summaryLines = sections.map(s => `   • *${s.relative}*: ${s.count}`)
    let summary = `Weekly Dependency Updates :package:\n${totalUpdates} update(s) available across ${sections.length} package(s):\n${summaryLines.join('\n')}`
    if (errors.length > 0) {
      summary += `\n\n:warning: ${errors.length} manifest(s) could not be scanned:\n${errors.map(e => `   • ${e}`).join('\n')}`
    }
    allPosted = (await post(summary)) && allPosted

    for (const section of sections) {
      const header = `*${section.relative}* — ${section.count} update(s) available`
      for (const message of buildChunks(header, section.lines)) {
        allPosted = (await post(message)) && allPosted
      }
    }
  }

  if (allPosted) {
    console.log('posted summary to Slack')
  } else {
    process.exit(1)
  }
}

run()
