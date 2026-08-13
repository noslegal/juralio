/*
 * Copyright 2026 Graeme and Joanna Johnston
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Golden-file regression: runs every report fixture through the xlsx writer,
 * normalises the output into a compact semantic model and compares it against
 * the committed snapshot under snapshots/. The snapshots were captured from
 * the previous writer (SheetJS Pro, removed for licensing reasons) and are
 * the ground truth that exports must not change — see semantic-compare.js for
 * what is compared.
 *
 * To bless an intentional change to the exports, regenerate the snapshots:
 *   UPDATE_PARITY_SNAPSHOTS=1 npx jest parity
 * then review the JSON diff before committing.
 */
import { saveAs } from 'file-saver'
import fs from 'fs'
import path from 'path'
import { freezeClock, parityCases, tStub } from './parity-cases'
import {
  diffWorkbooks,
  normaliseWorkbook,
  stableSnapshotJson,
  toSnapshot,
} from './semantic-compare'

jest.mock('file-saver', () => ({ saveAs: jest.fn() }))

freezeClock()

const SNAPSHOT_DIR = path.join(__dirname, 'snapshots')
const UPDATE = !!process.env.UPDATE_PARITY_SNAPSHOTS

// jsdom's Blob has no arrayBuffer(); go through FileReader instead
const blobToBuffer = blob =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(Buffer.from(reader.result))
    reader.onerror = reject
    reader.readAsArrayBuffer(blob)
  })

// Date is frozen, so bound the wait by iterations not time
const waitForSave = async () => {
  for (let attempts = 0; attempts < 600; attempts++) {
    if (saveAs.mock.calls.length > 0) {
      return saveAs.mock.calls[0]
    }
    await new Promise(resolve => setTimeout(resolve, 25))
  }
  throw new Error('saveAs was not called within 15s')
}

describe('xlsx writer parity vs snapshots', () => {
  beforeEach(() => {
    saveAs.mockClear()
  })

  parityCases.forEach(parityCase => {
    it(
      parityCase.id,
      async () => {
        parityCase.run(tStub)
        const [blob] = await waitForSave()
        const actualModel = await normaliseWorkbook(await blobToBuffer(blob))

        const snapshotPath = path.join(SNAPSHOT_DIR, `${parityCase.id}.json`)

        if (UPDATE) {
          fs.writeFileSync(snapshotPath, stableSnapshotJson(actualModel))
          return
        }

        // round-trip both sides through JSON so null/undefined normalise the
        // same way on each
        const expected = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'))
        const actual = JSON.parse(JSON.stringify(toSnapshot(actualModel)))

        expect(diffWorkbooks(expected, actual)).toEqual([])
      },
      30000
    )
  })
})
