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

import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import React, { useEffect, useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import matterCostsService from '../../services/costs/matter-costs-service'
import AssumptionDetails from './AssumptionDetails'
import { cloneDeep } from 'lodash'
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd'
import { makeStyles } from 'tss-react/mui'
import { useTranslation } from 'react-i18next'
import juralioColours from '../../theme/juralio-colours'
import rawColours from '../../theme/raw-colours'
import { ASSUMPTION_STATUS } from '../../app/constants'
import {
  ASSUMPTION_STATUS_OPTIONS,
  getAssumptionStatusColour,
  getAssumptionStatusTextColour,
} from '../../services/helpers/costs/assumption-status-helper'

const style = makeStyles()(theme => ({
  hidden: {
    display: 'none',
  },
  drawerRoot: {
    // Render above the assumptions Dialog (theme.zIndex.modal) so the editing
    // drawer is not hidden behind the dialog's backdrop.
    zIndex: theme.zIndex.modal + 1,
  },
  column: {
    padding: theme.spacing(2),
  },
  headingRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(0.5),
  },
  heading: {
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    fontWeight: 600,
    color: juralioColours.darkText.secondary,
  },
  editIcon: {
    marginLeft: 'auto',
    color: juralioColours.darkText.secondary,
    '&:hover': {
      color: juralioColours.darkText.primary,
    },
  },
  assumptionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    paddingLeft: 0,
    paddingRight: 0,
  },
  numberBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: theme.spacing(3),
    height: theme.spacing(3),
    borderRadius: '50%',
    flexShrink: 0,
    backgroundColor: rawColours.status.inProgress.dark,
    color: juralioColours.whiteText.primary,
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    fontWeight: 600,
  },
  assumptionButton: {
    borderRadius: 8,
    flex: 1,
    textTransform: 'none',
    justifyContent: 'flex-start',
    color: juralioColours.darkText.primary,
  },
  listContent: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'left',
  },
  statusChip: {
    flexShrink: 0,
    height: theme.spacing(2.5),
    fontWeight: 600,
    fontSize: 11,
    '& .MuiChip-deleteIcon': {
      color: 'inherit',
      marginRight: theme.spacing(0.25),
    },
  },
  statusChipClickable: {
    cursor: 'pointer',
  },
  statusOption: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  statusDot: {
    width: theme.spacing(1.25),
    height: theme.spacing(1.25),
    borderRadius: '50%',
    flexShrink: 0,
  },
  addAssumptionButton: {
    marginTop: theme.spacing(1),
    color: rawColours.primary.primary.main,
    border: `1px dashed ${rawColours.primary.primary.main}`,
    borderRadius: '8px',
    textTransform: 'none',
    fontWeight: 600,
    '&:hover': {
      border: `1px dashed ${rawColours.primary.primary.main}`,
      backgroundColor: 'rgba(63, 121, 155, 0.06)',
    },
  },
  zeroStateText: {
    fontStyle: 'italic',
    color: juralioColours.darkText.secondary,
    margin: `${theme.spacing(1)} 0`,
  },
  saveButton: {
    textTransform: 'none',
    color: 'white',
    background: rawColours.primary.primary.main,
    marginRight: theme.spacing(0.5),
    '&:hover': {
      background: rawColours.primary.primary.main,
    },
  },
  cancelButton: {
    textTransform: 'none',
    marginRight: theme.spacing(1),
  },
  buttonDiv: {
    marginRight: 4,
    marginLeft: 'auto',
    width: 'fit-content',
    height: '8%',
  },
  drawerHeader: {
    height: theme.spacing(10.25),
    padding: '4px',
    marginTop: theme.spacing(1),
    marginLeft: theme.spacing(1.5),
  },
  drawerSubtitle: {
    fontSize: 12,
  },
  drawerBody: {
    maxHeight: '80%',
    overflow: 'scroll',
  },
  drawerListNums: {
    marginLeft: '-20px',
    marginRight: theme.spacing(1),
    marginTop: '-104px',
  },
}))

const AssumptionsList = props => {
  const { t } = useTranslation()
  const {
    phaseId,
    matterId,
    assumptionsForPhase,
    isViewOnly,
    drawerOnly,
    onClose,
  } = props
  const { classes } = style()
  const [scrollTo, setScrollTo] = useState()
  const [assumptions, setAssumptions] = useState([
    { summary: null, assumption: null, status: ASSUMPTION_STATUS.ON_TARGET },
  ])
  const [openDrawer, setOpenDrawer] = useState(!!drawerOnly)
  const [fallbackList, setFallBackList] = useState([
    { summary: null, assumption: null, status: ASSUMPTION_STATUS.ON_TARGET },
  ])
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null)
  const [statusMenuItem, setStatusMenuItem] = useState(null)

  const closeStatusMenu = () => {
    setStatusMenuAnchor(null)
    setStatusMenuItem(null)
  }

  const handleStatusChange = newStatus => {
    const item = statusMenuItem
    closeStatusMenu()
    if (!item || item.status === newStatus) return
    const previous = assumptions
    const updated = assumptions.map(a =>
      a.id === item.id ? { ...a, status: newStatus } : a
    )
    setAssumptions(updated)
    setFallBackList(cloneDeep(updated))
    if (item.id) {
      matterCostsService
        .bulkUpdateAssumption(matterId, [
          {
            summary: item.summary,
            assumption: item.assumption,
            status: newStatus,
            assumptionId: item.id,
          },
        ])
        .then(r => {
          // api() resolves with a 4xx status (and surfaces its own error
          // snackbar) on failure; revert the optimistic change so the chip
          // does not show a status the backend never persisted.
          if (!r || r.status >= 400) {
            setAssumptions(cloneDeep(previous))
            setFallBackList(cloneDeep(previous))
          }
        })
    }
  }

  const closeDrawer = () => {
    setAssumptions(cloneDeep(fallbackList))
    setOpenDrawer(false)
    if (onClose) onClose()
  }

  useEffect(() => {
    if (assumptionsForPhase && assumptionsForPhase.length > 0) {
      setAssumptions(cloneDeep(assumptionsForPhase))
      setFallBackList(assumptionsForPhase)
    }
  }, []) //eslint-disable-line

  const validate = () => {
    for (let i = 0; i < assumptions.length; i++) {
      const element = assumptions[i]
      if (element.summary?.length > 70) {
        return true
      }
      if (
        !element.assumption ||
        element.assumption?.length < 1 ||
        element.assumption?.length > 300
      ) {
        return true
      }
    }
    return false
  }

  const error = validate()

  const performSave = () => {
    let createPayload = []
    let updatePayload = []
    assumptions.forEach(assumption => {
      if (assumption.id) {
        updatePayload.push({
          summary: assumption.summary,
          assumption: assumption.assumption,
          status: assumption.status || ASSUMPTION_STATUS.ON_TARGET,
          assumptionId: assumption.id,
        })
      } else {
        createPayload.push({
          summary: assumption.summary,
          assumption: assumption.assumption,
          status: assumption.status || ASSUMPTION_STATUS.ON_TARGET,
          taskId: phaseId,
        })
      }
    })
    if (updatePayload.length > 0) {
      return matterCostsService
        .bulkUpdateAssumption(matterId, updatePayload)
        .then(res => {
          let updatedList = res.body
          if (createPayload.length > 0) {
            return matterCostsService
              .bulkSaveAssumption(matterId, createPayload)
              .then(res => {
                let finalList = updatedList.concat(res.body)
                setAssumptions([...finalList])
                setFallBackList(cloneDeep([...finalList]))
              })
          } else {
            setAssumptions([...updatedList])
            setFallBackList(cloneDeep([...updatedList]))
          }
        })
    } else if (createPayload.length > 0) {
      return matterCostsService
        .bulkSaveAssumption(matterId, createPayload)
        .then(res => {
          let a = res.body
          setAssumptions([...a])
          setFallBackList(cloneDeep([...a]))
        })
    }
    return Promise.resolve()
  }

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    removed.position = endIndex
    result.forEach(item => {
      if (item.position < endIndex && item.position > startIndex) {
        item.position = item.position - 1
      } else if (item.position < startIndex && item.position > endIndex) {
        item.position = item.position + 1
      } else if (item.position === endIndex || item.position === startIndex) {
        if (endIndex > startIndex) {
          item.position = item.position - 1
        } else {
          item.position = item.position + 1
        }
      }
    })
    result.splice(endIndex, 0, removed)
    return result
  }

  const handleDrop = result => {
    if (!result.destination) {
      return
    }

    if (result.destination.index === result.source.index) {
      return
    }

    const reorderedAssumptions = reorder(
      assumptions,
      result.source.index,
      result.destination.index
    )
    let payload = []
    reorderedAssumptions.forEach(assumption => {
      if (assumption.id) {
        payload.push({
          position: assumption.position,
          summary: assumption.summary,
          assumption: assumption.assumption,
          status: assumption.status || ASSUMPTION_STATUS.ON_TARGET,
          assumptionId: assumption.id,
        })
      }
    })
    matterCostsService.bulkUpdateAssumption(matterId, payload)
    setAssumptions(reorderedAssumptions)
    setFallBackList(cloneDeep(reorderedAssumptions))
  }

  const hasAssumptions =
    assumptions[0] !== undefined && assumptions[0].assumption !== null

  return (
    <>
      {!drawerOnly && (
        <div className={classes.column}>
          <div className={classes.headingRow} data-test="assumptions-header">
            <Typography variant="caption" className={classes.heading}>
              {t('matterCosts.assumptions.assumptions')}
            </Typography>
            {!isViewOnly && hasAssumptions && (
              <Tooltip title={t('common.edit')}>
                <IconButton
                  data-test="edit-assumptions"
                  className={classes.editIcon}
                  size="small"
                  onClick={() => setOpenDrawer(true)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </div>

          {hasAssumptions ? (
            <DragDropContext onDragEnd={handleDrop}>
              <List disablePadding>
                <Droppable droppableId={`${phaseId}`}>
                  {provided => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {assumptions
                        .sort((a, b) => a.position - b.position)
                        .map((item, index) => (
                          <Draggable
                            key={item.id}
                            draggableId={`${item.id}`}
                            index={index}
                            isDragDisabled={isViewOnly}
                          >
                            {provided => (
                              <div
                                data-test="draggable-assumption"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <ListItem
                                  className={classes.assumptionItem}
                                  disableGutters
                                >
                                  <span className={classes.numberBadge}>
                                    {index + 1}
                                  </span>
                                  <ListItemButton
                                    className={classes.assumptionButton}
                                    onClick={() => {
                                      setOpenDrawer(true)
                                      setScrollTo(item.id)
                                    }}
                                  >
                                    <Typography
                                      className={classes.listContent}
                                      sx={
                                        item.summary
                                          ? {}
                                          : { fontStyle: 'italic' }
                                      }
                                    >
                                      {item.summary
                                        ? item.summary
                                        : item.assumption}
                                    </Typography>
                                  </ListItemButton>
                                  <Chip
                                    data-test="assumption-status-chip"
                                    size="small"
                                    className={`${classes.statusChip}${
                                      isViewOnly
                                        ? ''
                                        : ` ${classes.statusChipClickable}`
                                    }`}
                                    label={t(
                                      `matterCosts.assumptions.status.${
                                        item.status ||
                                        ASSUMPTION_STATUS.ON_TARGET
                                      }`
                                    )}
                                    deleteIcon={
                                      isViewOnly ? undefined : (
                                        <ArrowDropDownIcon fontSize="small" />
                                      )
                                    }
                                    onDelete={
                                      isViewOnly
                                        ? undefined
                                        : e => {
                                            setStatusMenuAnchor(e.currentTarget)
                                            setStatusMenuItem(item)
                                          }
                                    }
                                    onClick={
                                      isViewOnly
                                        ? undefined
                                        : e => {
                                            setStatusMenuAnchor(e.currentTarget)
                                            setStatusMenuItem(item)
                                          }
                                    }
                                    style={{
                                      backgroundColor:
                                        getAssumptionStatusColour(
                                          item.status ||
                                            ASSUMPTION_STATUS.ON_TARGET
                                        ),
                                      color: getAssumptionStatusTextColour(
                                        item.status ||
                                          ASSUMPTION_STATUS.ON_TARGET
                                      ),
                                    }}
                                  />
                                </ListItem>
                              </div>
                            )}
                          </Draggable>
                        ))}

                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </List>
            </DragDropContext>
          ) : (
            <Typography className={classes.zeroStateText} variant="body2">
              {t('matterCosts.assumptions.noAssumptions')}
            </Typography>
          )}

          {!isViewOnly && (
            <Button
              data-test="add-assumptions"
              className={classes.addAssumptionButton}
              startIcon={<AddIcon />}
              onClick={() => setOpenDrawer(true)}
            >
              {t('matterCosts.assumptions.addAssumptions')}
            </Button>
          )}
        </div>
      )}
      <Drawer
        open={openDrawer}
        onClose={closeDrawer}
        anchor="right"
        className={classes.drawerRoot}
        slotProps={{
          backdrop: {
            sx: {
              // Set the backdrop background color to transparent
              backgroundColor: 'transparent',
            },
          },
        }}
      >
        <Box
          sx={{
            width: '290px',
            height: '100%',
          }}
        >
          <div data-test="drawer-header" className={classes.drawerHeader}>
            <Typography variant="h5">
              {t('matterCosts.assumptions.phaseAssumptions')}
            </Typography>
            <Typography variant="body2" className={classes.drawerSubtitle}>
              {t('matterCosts.assumptions.assumptionsSubtitle')}
            </Typography>
          </div>
          <div className={classes.drawerBody}>
            <List sx={{ listStyle: 'decimal', pl: 4 }}>
              {assumptions.map((item, index) => (
                <ListItem key={item.id ?? index}>
                  <Typography className={classes.drawerListNums}>
                    {index + 1 + '.'}
                  </Typography>
                  <AssumptionDetails
                    details={item}
                    assumptionList={assumptions}
                    setAssumptions={setAssumptions}
                    index={index}
                    isViewOnly={isViewOnly}
                    setFallBackList={setFallBackList}
                    scrollTo={scrollTo}
                  />
                </ListItem>
              ))}
              <Divider />
              {!isViewOnly && assumptions.length !== 10 && (
                <ListItem>
                  <ListItemButton
                    data-test="add-another"
                    onClick={() => {
                      let a = assumptions
                      a.push({
                        summary: null,
                        assumption: null,
                        status: ASSUMPTION_STATUS.ON_TARGET,
                      })
                      setAssumptions([...a])
                    }}
                  >
                    <ListItemIcon>
                      <AddIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('common.addAnother')} />
                  </ListItemButton>
                </ListItem>
              )}
            </List>
          </div>

          <div className={classes.buttonDiv}>
            <Button
              data-test="cancel-button"
              className={classes.cancelButton}
              onClick={closeDrawer}
            >
              {t('common.cancel')}
            </Button>
            <Button
              data-test="save-button"
              className={isViewOnly ? classes.hidden : classes.saveButton}
              disabled={error}
              onClick={() => {
                Promise.resolve(performSave()).then(() => {
                  setOpenDrawer(false)
                  if (onClose) onClose()
                })
              }}
            >
              {t('common.save')}
            </Button>
          </div>
        </Box>
      </Drawer>
      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={closeStatusMenu}
      >
        {ASSUMPTION_STATUS_OPTIONS.map(option => (
          <MenuItem
            key={option}
            data-test={`assumption-status-option-${option}`}
            selected={
              (statusMenuItem?.status || ASSUMPTION_STATUS.ON_TARGET) === option
            }
            onClick={() => handleStatusChange(option)}
          >
            <span className={classes.statusOption}>
              <span
                className={classes.statusDot}
                style={{
                  backgroundColor: getAssumptionStatusTextColour(option),
                }}
              />
              {t(`matterCosts.assumptions.status.${option}`)}
            </span>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
export default AssumptionsList
