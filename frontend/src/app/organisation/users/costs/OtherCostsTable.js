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

import React, { useEffect, useState } from 'react'
import { Paper, Typography } from '@mui/material'
import DataEditor, { GridCellKind } from '@glideapps/glide-data-grid'
import { allCells } from '@glideapps/glide-data-grid-cells'
import '@glideapps/glide-data-grid/dist/index.css'
import otherCostsTableService from '../../../../services/otherCosts/other-costs-table-service'
import { checkTextHasNonWhitespaceContent } from '../../../../services/helpers/text/text-util-helper'
import { makeStyles } from 'tss-react/mui'
import juralioColours from '../../../../theme/juralio-colours'
import rawColours from '../../../../theme/raw-colours'
import AddBoxIcon from '@mui/icons-material/AddBox'
import { useTranslation } from 'react-i18next'

const useStyles = makeStyles()(theme => ({
  header: {
    display: 'grid',
    gridTemplateColumns: '2% 78% 20%',
    height: theme.spacing(5),
    width: '100%',
    paddingTop: 16,
    paddingBottom: 16,
    borderBottom: '4px solid',
    borderColor: rawColours.primary.black[100],
  },

  bottomRow: {
    height: '56px',
    width: '100%',
    borderTop: 'groove',
    borderRadius: '0 0 20px 20px',
    color: '#5E9EF8',
    display: 'grid',
    gridTemplateColumns: '2% 48% 50%',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#cfccc6',
    },
  },
}))

export const OtherCostsTable = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const { costs, setButtonDisabled, setOtherCosts, orgId } = props
  const customProps = { customRenderers: allCells }
  const formattedData = costs.map(o => [o.name, '', o.id])
  const [data, setData] = useState(formattedData)

  useEffect(() => {
    setData(costs.map(o => [o.name, '', o.id]))
  }, [costs])

  useEffect(() => {
    setButtonDisabled(false)
    //eslint-disable-next-line
  }, [])

  const tableTheme = {
    textGroupHeader: juralioColours.darkText.primary,
    textHeader: juralioColours.darkText.primary,
    textHeaderSelected: '#000000',
    bgHeader: rawColours.primary.grey.main,
    bgHeaderHasFocus: '#cfccc6',
    bgHeaderHovered: '#cfccc6',
    headerFontStyle: '12px',
  }

  const [numRows, setNumRows] = useState(data.length)
  const columns = [
    {
      title: t('organisationAdmin.costs.otherCosts.otherCostTypes'),
      id: 2,
      width: 750,
    },
    {
      title: t('common.delete'),
      id: 3,
      width: 75,
    },
  ]

  const getContent = React.useCallback(
    cell => {
      const [col, row] = cell
      const dataRow = data[row]
      let d

      if (dataRow === undefined) {
        return {
          kind: GridCellKind.Text,
          allowOverlay: false,
          readonly: true,
          displayData: '',
          data: 'd',
        }
      }
      if (dataRow[col] === undefined) {
        if (col === 1) {
          d = { id: 'x', name: 'Choose Category', colour: 'Green' }
        } else {
          d = 'default'
        }
      } else {
        d = dataRow[col]
      }

      if (col === 1) {
        return {
          kind: GridCellKind.Custom,
          cursor: 'pointer',
          allowOverlay: true,
          readonly: true,
          data: {
            kind: 'button-cell',
            backgroundColor: ['transparent', 'transparent'],
            color: ['grey', 'black'],
            borderColor: 'transparent',
            borderRadius: 9,
            title: 'X',
            onClick: () => {
              const d = data
              const otherCostId = d[row][2]
              otherCostsTableService.deleteOtherCost(otherCostId)
              const c = costs
              c.splice(row, 1)
              d.splice(row, 1)
              setData(d)
              setNumRows(d.length)
              setOtherCosts(c)
            },
          },
          themeOverride: {
            baseFontStyle: '350 18px',
          },
        }
      } else {
        return {
          kind: GridCellKind.Text,
          allowOverlay: true,
          readonly: false,
          displayData: d,
          data: d,
        }
      }
    },
    //eslint-disable-next-line
    [data]
  )

  const onCellEdited = React.useCallback(
    (cell, newValue) => {
      if (
        checkTextHasNonWhitespaceContent(newValue.data) &&
        newValue.data.length <= 20
      ) {
        const [col, row] = cell
        if (newValue.kind === GridCellKind.Text) {
          if (newValue.data === '' && data[row][col] === '') {
            const d = data
            d.splice(d.length - 1, 1)
            setData(d)
            setNumRows(d.length)
            return
          } else {
            data[row][col] = newValue.data
            if (data[row][2] === undefined) {
              otherCostsTableService
                .createOtherCost({
                  name: newValue.data,
                })
                .then(res => {
                  if (res.status === 200) {
                    data[row][2] = res.body.id
                    let newOtherCosts = costs
                    newOtherCosts.push(res.body)
                    setOtherCosts(newOtherCosts)
                  }
                })
            } else {
              otherCostsTableService
                .updateOtherCost(data[row][2], {
                  name: newValue.data,
                })
                .then(res => {
                  let ocList = costs
                  ocList[ocList.findIndex(x => x.id === res.body.id)] = res.body
                  setOtherCosts(ocList)
                })
            }
          }
        } else {
          return
        }
      }
    },
    //eslint-disable-next-line
    [data]
  )

  const onRowAppended = React.useCallback(() => {
    const d = data
    d.push(['', '', undefined])
    setData(d)
    setNumRows(d.length)
    //eslint-disable-next-line
  }, [getContent, numRows])

  return (
    <>
      <div style={{ position: 'relative' }}>
        <Paper
          data-test="other-costs-table"
          style={{
            position: 'relative',
            marginLeft: '100px',
            maxWidth: 825,
            borderRadius: 20,
          }}
        >
          <div className={classes.header}>
            <div />
            <div>
              <div
                style={{
                  color: '#1D1917',
                  fontSize: 20,
                  fontWeight: '500',
                  lineHeight: 32,
                  letterSpacing: 0.15,
                }}
              >
                <Typography>
                  {t('organisationAdmin.costs.otherCosts.otherCosts')}
                </Typography>
              </div>
              <div
                style={{
                  color: rawColours.primary.black[100],
                  fontSize: 14,
                  fontWeight: '400',
                  lineHeight: 20,
                  wordWrap: 'break-word',
                }}
              >
                <Typography>
                  {t('organisationAdmin.costs.otherCosts.otherCostsDesc')}
                </Typography>
              </div>
            </div>
            <div />
          </div>
          <div id="glideTest">
            <DataEditor
              {...customProps}
              validateCell={(_cell, newValue) => {
                if (newValue.data.length <= 20) return true
                return false
              }}
              getCellContent={getContent}
              columns={columns}
              rows={data.length}
              onCellEdited={onCellEdited}
              getCellsForSelection={true}
              onPaste={true}
              theme={tableTheme}
              smoothScrollX={true}
            />
          </div>
          <div className={classes.bottomRow} onClick={onRowAppended}>
            <div />
            <div style={{ display: 'inline-flex', paddingTop: '16px' }}>
              <AddBoxIcon />
              <Typography>{t('common.new')}</Typography>
            </div>
            <div />
          </div>
        </Paper>
      </div>
    </>
  )
}
export default OtherCostsTable
