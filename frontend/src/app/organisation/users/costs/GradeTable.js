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
import {
  Paper,
  TextField,
  Menu,
  MenuItem,
  Typography,
  Button,
  Tooltip,
} from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import DataEditor, { GridCellKind } from '@glideapps/glide-data-grid'
import { allCells } from '@glideapps/glide-data-grid-cells'
import '@glideapps/glide-data-grid/dist/index.css'
import gradeTableService from '../../../../services/grade/grade-table-service'
import DoneIcon from '@mui/icons-material/Done'
import CreateIcon from '@mui/icons-material/Create'
import ClearIcon from '@mui/icons-material/Clear'
import DeleteIcon from '@mui/icons-material/Delete'
import AddBoxIcon from '@mui/icons-material/AddBox'
import { CATEGORY_COLOURS } from '../../../constants'
import { useDispatch } from 'react-redux'
import { showSnackbar } from '../../../global-snackbar/global-snackbar-actions'
import juralioColours from '../../../../theme/juralio-colours'
import rawColours from '../../../../theme/raw-colours'
import { useTranslation } from 'react-i18next'
import cloneDeep from 'lodash/cloneDeep'
import costsService from '../../../../services/costs/costs-service'

const useStyles = makeStyles()(theme => ({
  icons: {
    color: juralioColours.darkText.primary,
  },

  header: {
    display: 'grid',
    gridTemplateColumns: '5% 50% 45%',
    height: theme.spacing(7),
    width: '100%',
    paddingTop: 16,
    borderBottom: '4px solid',
    borderColor: rawColours.primary.black[100],
    overflow: 'hidden',
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

export const GradeTable = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const { grades, gradeCategories, setGrades, setButtonDisabled, orgId } = props
  const customProps = { customRenderers: allCells }
  const [groups, setGroups] = useState(gradeCategories)

  useEffect(() => {
    setGroups(gradeCategories)
  }, [gradeCategories])

  const formattedData = grades.map(o => [
    o.group,
    o.name,
    '',
    o.id,
    o.isBeingUsed,
  ])
  const [data, setData] = useState(formattedData)

  useEffect(() => {
    const d = grades.map(o => [o.group, o.name, '', o.id, o.isBeingUsed])
    setData(d)
  }, [grades])

  const [cellMenu, setCellMenu] = useState()
  const [anchorEL, setAnchorEl] = useState()
  const [numRows, setNumRows] = useState(data.length)
  const [showTextField, setShowTextField] = useState(false)
  const [showEditGroup, setShowEditGroup] = useState(-1)
  const [value, setValue] = useState()
  const [tooltip, setTooltip] = useState()
  const [showTooltip, setShowTooltip] = useState(false)
  useEffect(() => {
    if (data.find(x => x[1].colour_idx > 9) !== undefined) {
      setButtonDisabled(true)
    } else {
      setButtonDisabled(false)
    }
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

  // var w = window.innerWidth
  // var h = window.innerHeight
  const columns = [
    {
      title: t('organisationAdmin.costs.grades.categories'),
      id: 1,
      width: 400, //(w / 100) * 40,
    },
    {
      title: t('organisationAdmin.costs.grades.grades'),
      id: 2,
      width: 400, //(w / 100) * 40,
    },
    {
      title: t('common.delete'),
      id: 3,
      width: 75, //(w / 100) * 20,
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
      if (dataRow[col] === null) {
        if (col === 0) {
          d = {
            id: 'x',
            name: 'Choose category',
            colour_idx: 10,
          }
        } else {
          d = 'default'
        }
      } else {
        d = dataRow[col]
      }

      let isReadOnly = false

      if (col === 2) {
        return {
          kind: GridCellKind.Custom,
          cursor: 'pointer',
          allowOverlay: true,
          readonly: true,
          data: {
            kind: 'button-cell',
            backgroundColor: ['white', 'white'],
            color: ['grey', 'black'],
            borderColor: 'transparent',
            borderRadius: 9,
            title: dataRow[4] ? '' : 'X',
            onClick: () => {
              if (data[row][3] !== undefined) {
                if (grades.length > 1 && data[row][4] !== true) {
                  const d = data
                  const g = grades
                  const gradeId = d[row][3]
                  d.splice(row, 1)
                  g.splice(row, 1)
                  setGrades(g)
                  setData(d)
                  setNumRows(d.length)
                  gradeTableService.deleteGrade(gradeId)
                }
              } else {
                if (grades.length > 1) {
                  const d = data
                  d.splice(row, 1)
                  setData(d)
                  setNumRows(d.length)
                } else {
                  dispatch(showSnackbar('Must have atleast 1 grade'))
                }
              }
            },
          },
          themeOverride: {
            baseFontStyle: '350 18px',
          },
        }
      } else if (col === 0) {
        return {
          kind: GridCellKind.Custom,
          cursor: 'pointer',
          allowOverlay: true,
          readonly: true,
          copyData: d.name ? d.name : '',
          data: {
            kind: 'button-cell',
            backgroundColor: [
              CATEGORY_COLOURS[d.colour_idx]?.secondary,
              CATEGORY_COLOURS[d.colour_idx].primary,
            ],
            color: [
              CATEGORY_COLOURS[d.colour_idx].text,
              CATEGORY_COLOURS[d.colour_idx].text,
            ],
            borderColor: 'transparent',
            borderRadius: 9,
            title: d.name + ' ↓',
            onClick: () => {},
          },
          themeOverride: {
            baseFontStyle: '700 12px',
            cellHorizontalPadding: 100,
          },
        }
      } else if (col === 1) {
        return {
          kind: GridCellKind.Text,
          allowOverlay: !isReadOnly,
          readonly: isReadOnly,
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
      if (newValue.data.length <= 20) {
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
            if (data[row][3] === undefined) {
              gradeTableService
                .createGrade({
                  name: newValue.data,
                  grade_idx: data.length,
                  categoryId: data[row][col - 1].id,
                })
                .then(res => {
                  if (res.status === 200) {
                    let newGrades = grades
                    newGrades.push(res.body)
                    setGrades(newGrades)
                    data[row][3] = res.body.id
                  }
                })
            } else {
              gradeTableService
                .updateGrade(data[row][3], {
                  name: newValue.data,
                })
                .then(res => {
                  let gradeList = grades
                  gradeList[gradeList.findIndex(x => x.id === res.body.id)] =
                    res.body
                  setGrades(gradeList)
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

  const onCellHover = React.useCallback(args => {
    if (
      args.location[0] === 2 &&
      args.kind !== 'out-of-bounds' &&
      args.location[1] !== -1
    ) {
      if (
        args.location[0] === 2 &&
        data[args.location[1]] &&
        data[args.location[1]][4] === true
      ) {
        setTooltip({
          title: `Grade in use so cannot be deleted`,
          text: '',
          bounds: args.bounds,
        })
        setShowTooltip(true)
      }
    } else {
      setTooltip({})
      setShowTooltip(false)
    }
    //eslint-disable-next-line
  }, [])
  const reorderRows = React.useCallback(
    (from, to) => {
      let d = cloneDeep(data)
      if (d.length === 0) {
        d = grades.map(o => [o.group, o.name, '', o.id, o.isBeingUsed])
      }
      const removed = d.splice(from, 1)
      d.splice(to, 0, ...removed)

      const reorderList = d.map((r, index) => [r[3], index])
      gradeTableService
        .updateGrade(d[to][3], {
          gradeOrderList: reorderList,
          organisationId: orgId,
        })
        .then(() => {
          costsService.getOrganisationGrades(orgId).then(res => {
            if (res.status === 200) {
              setGrades(res.body)
              setData(d)
            }
          })
        })
    }, //eslint-disable-next-line
    [grades]
  )

  const onRowAppended = React.useCallback(() => {
    const d = data
    d.push([gradeCategories[0], '', '', undefined])
    setData(d)
    setNumRows(d.length)
    //eslint-disable-next-line
  }, [getContent, numRows])

  //HEADER MENU

  const isCellMenuOpen = cellMenu !== undefined

  const onCellClick = React.useCallback((...args) => {
    if (args[1].location[0] === 1) {
      setAnchorEl(document.getElementById('targetCell'))
      var boundry = args[1].bounds
      var location = args[0]
      setCellMenu({ location, boundry })
    }
  }, [])

  const updateSelectedGroup = (g, location) => {
    const targetRow = location[1]
    const targetColumn = location[0]
    const d = data
    d[targetRow][targetColumn] = g
    setData(d)
    setCellMenu(undefined)
    if (d[targetRow][3] !== undefined) {
      gradeTableService.updateGrade(d[targetRow][3], { categoryId: g.id })
    }
    if (d.find(x => x[1].colour_idx > 9) !== undefined) {
      setButtonDisabled(true)
    } else {
      setButtonDisabled(false)
    }
  }

  const handleKeypress = (e, location) => {
    e.stopPropagation()
    if (e.key === 'Escape') {
      setValue('')
      setCellMenu(undefined)
      setAnchorEl(null)
      setShowTextField(false)
    } else if (e.key === 'Enter') {
      setValue(value)
      addValueToGroups(location)
      setCellMenu(undefined)
      setAnchorEl(null)
      setShowTextField(false)
    }
  }

  const addValueToGroups = location => {
    //api call to create group in database
    const newGroup = {
      id: groups.length + 1,
      name: value,
      colour_idx: groups.length + 1,
    }
    gradeTableService.createGradeCategory(newGroup).then(res => {
      newGroup.id = res.body.id
      const g = groups
      g.push(newGroup)
      setGroups(g)
      updateSelectedGroup(newGroup, location)
    })
  }

  const editGradeCategoryName = index => {
    let g = groups
    g[index].name = value
    setGroups(g)
    let d = data
    d.map(x => {
      if (x[0] !== null && x[0].id === g[index].id) {
        x[0].name = value
      }
      return x
    })
    setData(d)
  }

  return (
    <>
      <div style={{ position: 'relative', width: 'auto' }}>
        <Paper
          data-test="grade-table"
          style={{
            position: 'relative',
            maxWidth: 900,
            marginLeft: '100px',
            borderRadius: 20,
            overflow: 'hidden',
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
                <Typography>Grades & Grade Categories</Typography>
              </div>
              <div
                style={{
                  color: rawColours.primary.black[100],
                  fontSize: 14,
                  fontWeight: '400',
                  lineHeight: 20,
                }}
              >
                <Typography>
                  Positions or roles in an organisation for which time is
                  recorded.
                </Typography>
              </div>
            </div>
            <div />
          </div>

          <div style={{ display: 'flex', overflow: 'hidden' }} id="glideTest">
            <DataEditor
              validateCell={(_cell, newValue) => {
                if (newValue.data.length <= 20) return true
                return false
              }}
              {...customProps}
              getCellContent={getContent}
              columns={columns}
              rows={data.length}
              onCellEdited={onCellEdited}
              getCellsForSelection={true}
              onPaste={true}
              rowMarkers={'both'}
              onCellClicked={onCellClick}
              onRowMoved={reorderRows}
              theme={tableTheme}
              onItemHovered={onCellHover}
              smoothScrollX={true}
            />
          </div>

          <Tooltip
            title={
              grades.length === 50
                ? t('organisationAdmin.costs.grades.maxGrades')
                : ''
            }
          >
            <div
              stlye={
                grades.length < 50
                  ? {
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#cfccc6',
                      },
                    }
                  : {}
              }
              className={classes.bottomRow}
              onClick={grades.length < 50 ? onRowAppended : () => {}}
            >
              <div />
              {grades.length < 50 && (
                <div
                  data-test="add-new-grade"
                  className={classes.bottomRow}
                  style={{ display: 'inline-flex', alignItems: 'center' }}
                >
                  <AddBoxIcon />
                  <Typography>{t('common.new')}</Typography>
                </div>
              )}
              <div />
            </div>
          </Tooltip>
        </Paper>
        {showTooltip && (
          <div
            style={{
              width: '200px',
              position: 'fixed',
              top: tooltip?.bounds?.y + tooltip?.bounds?.height,
              left: tooltip?.bounds?.x,
            }}
          >
            <Paper style={{ color: 'white', backgroundColor: 'black' }}>
              <Typography
                style={{
                  fontSize: '12px',
                  marginLeft: '6px',
                  marginTop: '6px',
                }}
              >
                {tooltip.title}
              </Typography>
            </Paper>
          </div>
        )}
        <div
          id="targetCell"
          style={{
            width: '300px',
            position: 'fixed',
            top: cellMenu ? cellMenu.boundry.y + cellMenu.boundry.height : 0,
            left: cellMenu ? cellMenu.boundry.x : 0,
          }}
        >
          {isCellMenuOpen && (
            <Paper>
              <Menu
                data-test="grade-category-menu"
                anchorEl={anchorEL}
                onClose={() => {
                  setAnchorEl(null)
                  setCellMenu(undefined)
                  setShowTextField(false)
                }}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                getContentAnchorEl={null}
                open={isCellMenuOpen}
                disableAutoFocus={true}
              >
                {groups.map((g, index) => (
                  <div style={{ display: 'flex' }}>
                    {showEditGroup !== index && (
                      <>
                        <MenuItem
                          style={{ width: '100%' }}
                          onClick={() =>
                            updateSelectedGroup(g, cellMenu.location)
                          }
                        >
                          <Typography>{g.name} </Typography>
                        </MenuItem>
                        <Button
                          style={{
                            marginLeft: 'auto',
                          }}
                          onClick={() => {
                            setValue(g.name)
                            setShowEditGroup(index)
                          }}
                        >
                          {
                            <CreateIcon
                              data-test="create-icon"
                              className={classes.icons}
                            />
                          }
                        </Button>
                      </>
                    )}

                    {showEditGroup === index && (
                      <div style={{ paddingLeft: '8px' }}>
                        <TextField
                          onChange={e => {
                            if (e.target.value.length <= 20) {
                              setValue(e.target.value)
                            }
                          }}
                          autoFocus={true}
                          value={value}
                          onKeyDown={e => e.stopPropagation()}
                        />
                        <Button
                          onClick={() => {
                            if (value.length > 0) {
                              setShowEditGroup(-1)
                              setCellMenu(undefined)
                              gradeTableService
                                .updateGradeCategory(g.id, {
                                  name: value,
                                })
                                .then(res => {
                                  if (res.status === 200) {
                                    editGradeCategoryName(index)
                                  }
                                })
                            }
                          }}
                        >
                          <DoneIcon className={classes.icons} />
                        </Button>
                      </div>
                    )}
                    {groups.length > 1 && (
                      <Button
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          if (showEditGroup === index) {
                            setShowEditGroup(-1)
                          } else {
                            gradeTableService
                              .deleteGradeCategory(g.id)
                              .then(res => {
                                if (res.status === 200) {
                                  const nG = groups
                                  nG.pop()
                                  setGroups(nG)
                                  setCellMenu(undefined)
                                } else {
                                  dispatch(
                                    showSnackbar('Unable to delete this')
                                  )
                                }
                              })
                          }
                        }}
                      >
                        {showEditGroup === index ? (
                          <ClearIcon className={classes.icons} />
                        ) : (
                          <DeleteIcon
                            data-test="delete-icon"
                            className={classes.icons}
                          />
                        )}
                      </Button>
                    )}
                  </div>
                ))}
                {groups.length <= 9 && (
                  <MenuItem onClick={() => setShowTextField(true)}>
                    <Typography>Add New</Typography>
                    {showTextField && (
                      <div style={{ paddingLeft: '8px' }}>
                        <TextField
                          onChange={e => {
                            if (e.target.value.length <= 20) {
                              setValue(e.target.value)
                            }
                          }}
                          onKeyDown={e => handleKeypress(e, cellMenu.location)}
                          autoFocus={true}
                        />
                      </div>
                    )}
                  </MenuItem>
                )}
              </Menu>
            </Paper>
          )}
        </div>
      </div>
    </>
  )
}
export default GradeTable
