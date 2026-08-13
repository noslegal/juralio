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

import React, { useEffect, useRef } from 'react'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { InputBase, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { CATEGORY_COLOURS } from '../../constants'
import RateCardHeader from './RateCardHeader'
import useRateSourceStyles from './useRateSourceStyles'

const ManualRateTable = ({ orgGrades, rates, setRates, currency }) => {
  const { classes, cx } = useRateSourceStyles()
  const { t } = useTranslation()
  const initialisedManualRef = useRef(false)

  // Initialise manual rates from org grades on first entry to manual mode
  // (or when previously-saved rates don't have a gradeId — they came from the
  // old free-text shape). This component only mounts in manual mode, so the
  // ref resets naturally when the user switches away and back.
  useEffect(() => {
    if (initialisedManualRef.current) return
    if (!orgGrades || orgGrades.length === 0) return
    const current = rates || []
    const hasGradeRows = current.some(r => r.gradeId != null)
    if (hasGradeRows) {
      // Subsequent projections load only the grades that carried a rate in the
      // source table — grades that were unused (null rate) were never saved.
      // Merge those missing org grades back in as hidden rows so they sit
      // behind the show-all toggle and can be given a rate if needed.
      const presentIds = new Set(current.map(r => r.gradeId))
      const missing = orgGrades
        .filter(g => !presentIds.has(g.id))
        .map(g => ({
          id: 'grade-' + g.id,
          gradeId: g.id,
          role: g.name,
          colour_idx: g.colour_idx ?? 0,
          rate: '',
          hidden: true,
        }))
      if (missing.length > 0) setRates([...current, ...missing])
      initialisedManualRef.current = true
      return
    }
    setRates(
      orgGrades.map(g => ({
        id: 'grade-' + g.id,
        gradeId: g.id,
        role: g.name,
        colour_idx: g.colour_idx ?? 0,
        rate: '',
        hidden: false,
      }))
    )
    initialisedManualRef.current = true
  }, [orgGrades, rates, setRates])

  const updateManualRate = (id, patch) =>
    setRates((rates || []).map(r => (r.id === id ? { ...r, ...patch } : r)))

  const visibleManualRates = (rates || []).filter(r => !r.hidden)
  const hiddenCount = (rates || []).filter(r => r.hidden).length

  const applyPastedText = (text, rateId) => {
    if (!text) return
    const lines = text.split(/\r\n|\n/)
    const values = lines
      .map(line => {
        const cell = (line.split('\t')[0] || '').trim()
        return cell.replace(/[^0-9.]/g, '')
      })
      .filter(v => v.length > 0)
    if (values.length === 0) return
    const startIdx = visibleManualRates.findIndex(r => r.id === rateId)
    if (startIdx < 0) return
    const next = [...(rates || [])]
    values.forEach((v, i) => {
      const target = visibleManualRates[startIdx + i]
      if (!target) return
      const fullIdx = next.findIndex(r => r.id === target.id)
      if (fullIdx >= 0) next[fullIdx] = { ...next[fullIdx], rate: v }
    })
    setRates(next)
  }

  const handleShowAll = () => {
    setRates((rates || []).map(r => ({ ...r, hidden: false })))
  }

  const sourceMiddle = (
    <div className={classes.rateCardBasedOnRow}>
      <Typography
        component="span"
        variant="inherit"
        className={classes.rateCardBasedOnLabel}
      >
        {t('fixedFeeSetup.rateSource.customRates')}
      </Typography>
    </div>
  )

  return (
    <div className={classes.section}>
      {(!orgGrades || orgGrades.length === 0) &&
      visibleManualRates.length === 0 ? (
        <Typography component="div" className={classes.empty}>
          {t('fixedFeeSetup.rateSource.loadingGrades')}
        </Typography>
      ) : (
        <div className={classes.rateCard}>
          <RateCardHeader middleNode={sourceMiddle} currencyCode={currency} />
          <table className={classes.rateTable}>
            <thead>
              <tr className={classes.rateTableHeadRow}>
                <th className={cx(classes.rateTableHeadCell, classes.hideCol)}>
                  {hiddenCount > 0 && (
                    <button
                      type="button"
                      className={classes.showAllButton}
                      onClick={handleShowAll}
                    >
                      {t('fixedFeeSetup.rateSource.showAllHidden', {
                        count: hiddenCount,
                      })}
                    </button>
                  )}
                </th>
                <th className={classes.rateTableHeadCell}>
                  {t('fixedFeeSetup.rateSource.role')}
                </th>
                <th
                  className={cx(
                    classes.rateTableHeadCell,
                    classes.rateTableHeadCellRight
                  )}
                >
                  {t('fixedFeeSetup.rateSource.agreedRates')}
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleManualRates.map(r => {
                const colour =
                  CATEGORY_COLOURS[r.colour_idx ?? 10] || CATEGORY_COLOURS[10]
                return (
                  <tr key={r.id} className={classes.rateTableRow}>
                    <td className={cx(classes.rateTableCell, classes.hideCol)}>
                      <button
                        type="button"
                        className={classes.hideButton}
                        aria-label={t('fixedFeeSetup.rateSource.hideGrade')}
                        onClick={() => updateManualRate(r.id, { hidden: true })}
                      >
                        <VisibilityOffIcon fontSize="small" />
                      </button>
                    </td>
                    <td className={classes.rateTableCell}>
                      <span
                        className={classes.gradeChip}
                        style={{
                          background: colour.secondary,
                          color: colour.text,
                        }}
                      >
                        {r.role || '—'}
                      </span>
                    </td>
                    <td
                      className={cx(
                        classes.rateTableCell,
                        classes.rateTableCellRight
                      )}
                    >
                      <InputBase
                        className={classes.manualRateInputRoot}
                        classes={{ input: classes.manualRateInputInput }}
                        placeholder="—"
                        value={r.rate || ''}
                        onChange={e =>
                          updateManualRate(r.id, {
                            rate: e.target.value.replace(/[^\d.]/g, ''),
                          })
                        }
                        inputProps={{
                          'data-test': 'manual-rate-input',
                          inputMode: 'decimal',
                          onPaste: e => {
                            e.stopPropagation()
                            e.preventDefault()
                            const text = e.clipboardData.getData('text')
                            applyPastedText(text, r.id)
                          },
                          onKeyDown: e => {
                            if (
                              (e.ctrlKey || e.metaKey) &&
                              e.key.toLowerCase() === 'v'
                            ) {
                              e.stopPropagation()
                              e.preventDefault()
                              if (
                                navigator.clipboard &&
                                navigator.clipboard.readText
                              ) {
                                navigator.clipboard
                                  .readText()
                                  .then(text => applyPastedText(text, r.id))
                              }
                            }
                          },
                        }}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <Typography component="div" className={classes.fieldHelp}>
            {t('fixedFeeSetup.rateSource.manualRatesHelp')}
          </Typography>
        </div>
      )}
    </div>
  )
}

export default ManualRateTable
