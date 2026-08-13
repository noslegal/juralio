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
import rateTypeTableService from '../../../../services/rateType/rate-type-table-service'
import { checkTextHasNonWhitespaceContent } from '../../../../services/helpers/text/text-util-helper'
import { makeStyles } from 'tss-react/mui'
import juralioColours from '../../../../theme/juralio-colours'
import rawColours from '../../../../theme/raw-colours'
import { POSITIONS } from '../../../constants'

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
  },
}))

export const RateTypeTable = props => {
  const { classes } = useStyles()
  const { rateTypes, setButtonDisabled, orgId, setRateTypes, position } = props
  const customProps = { customRenderers: allCells }

  const tags = [
    {
      tag: position.name === POSITIONS.CLIENT.name ? 'Target' : 'Standard',
      color: rawColours.primary.black[200],
      textColorDark: rawColours.primary.grey[100],
    },
    {
      tag: 'Break-even',
      color: rawColours.primary.grey.main,
      textColorDark: rawColours.primary.black.black,
    },
    {
      tag: 'Premium',
      color: rawColours.primary.grey[100],
      textColorDark: rawColours.primary.black.black,
    },
    {
      tag:
        position.name === POSITIONS.CLIENT.name
          ? 'Agreed - Advisor'
          : 'Agreed - Client',
      color:
        position.name === POSITIONS.CLIENT.name
          ? 'rgba(24, 73, 169, 1)'
          : 'rgba(78,91,166, 0.7)',
      textColorDark: '#D1E9FF',
    },
    {
      tag: 'Agreed - Matter',
      color: '#D1E9FF',
      textColorDark: '#1849A9',
    },
  ]

  const meanings = [
    'The standard, target or benchmark hourly rate people should seek in this organisation',
    'A rate approximating the full economic cost of an hour of time',
    'A stretch target which people should seek for certain types of premium work',
    'The rate agreed with a client for all their matters or a subset',
    'The rate agreed with a client for a specific matter (sometimes as an exception  from the client rate, if any)',
  ]

  const getTagIndex = o => {
    if (o.isStandard) {
      return 0
    } else if (o.isBreakeven) {
      return 1
    } else if (o.isPremium) {
      return 2
    } else if (o.isAgreedClient) {
      return 3
    } else if (o.isAgreedMatter) {
      return 4
    }
  }

  const formattedData = rateTypes.map(o => [
    o.name,
    tags[getTagIndex(o)],
    meanings[getTagIndex(o)],
    true,
    o.id,
  ])
  const [data, setData] = useState(formattedData)

  const tableTheme = {
    textGroupHeader: juralioColours.darkText.primary,
    textHeader: juralioColours.darkText.primary,
    textHeaderSelected: '#000000',
    bgHeader: rawColours.primary.grey.main,
    bgHeaderHasFocus: '#cfccc6',
    bgHeaderHovered: '#cfccc6',
    headerFontStyle: '12px',
  }

  useEffect(() => {
    setData(
      rateTypes.map(o => [
        o.name,
        tags[getTagIndex(o)],
        meanings[getTagIndex(o)],
        true,
        o.id,
      ])
    )
    //eslint-disable-next-line
  }, [rateTypes])

  useEffect(() => {
    setButtonDisabled(false)
    //eslint-disable-next-line
  }, [])

  const columns = [
    {
      title: 'Your terminology',
      id: 1,
      width: 120,
    },
    {
      title: 'System name',
      id: 2,
      width: 120,
    },
    {
      title: 'Meaning',
      id: 2,
      width: 450,
    },
    {
      title: 'Status',
      id: 2,
      width: 60,
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
      if (col === 0) {
        return {
          kind: GridCellKind.Text,
          cursor: 'pointer',
          allowOverlay: true,
          readonly: false,
          displayData: d,
          data: d,
        }
      } else if (col === 1) {
        return {
          kind: GridCellKind.Custom,
          allowOverlay: false,
          copyData: '',
          data: {
            kind: 'tags-cell',
            possibleTags: tags,
            readonly: true,
            tags: [d.tag],
          },
          themeOverride: {
            textDark: d.textColorDark,
            bgCell: '#F1F1EE',
          },
        }
      } else if (col === 2) {
        return {
          kind: GridCellKind.Text,
          allowOverlay: false,
          readonly: true,
          allowWrapping: true,
          displayData: d,
          data: d,
          themeOverride: {
            bgCell: '#F1F1EE',
          },
        }
      } else if (col === 3) {
        return {
          kind: GridCellKind.Text,
          allowOverlay: false,
          readonly: true,
          displayData: d ? 'Active' : 'Disabled',
          data: d,
          themeOverride: {
            bgCell: '#F1F1EE',
          },
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
            return
          } else {
            data[row][col] = newValue.data
            if (data[row][2] === undefined) {
              rateTypeTableService
                .createRateType({
                  name: newValue.data,
                })
                .then(res => {
                  if (res.status === 200) {
                    data[row][2] = res.body.id
                  }
                })
            } else {
              rateTypeTableService
                .updateRateType(data[row][4], {
                  name: newValue.data,
                })
                .then(res => {
                  let rtList = rateTypes
                  rtList[rtList.findIndex(x => x.id === res.body.id)] = res.body
                  setRateTypes(rtList)
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

  return (
    <>
      <div style={{ position: 'relative' }}>
        <Paper
          data-test="rate-type-table"
          style={{
            position: 'relative',
            maxWidth: 750,
            marginLeft: '100px',
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
                <Typography>Rate types</Typography>
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
                  Different types of hourly rate which your organisation has for
                  a given grade
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
          <div className={classes.bottomRow}>
            <div />
            <div style={{ display: 'inline-flex', paddingTop: '16px' }}></div>
            <div />
          </div>
        </Paper>
      </div>
    </>
  )
}
export default RateTypeTable
