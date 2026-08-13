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

import { Button, Menu, MenuItem, Tooltip, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import rawColours from '../../../theme/raw-colours'
import juralioColours from '../../../theme/juralio-colours'
//import MapIcon from '@mui/icons-material/Map'
import JurCompact from '../../../assets/images/JurCompact'
import JurStandard from '../../../assets/images/JurStandard'
import JurDetailed from '../../../assets/images/JurDetailed'
import { useDispatch, useSelector } from 'react-redux'
import { TASK_MAP_VIEW_MODE_ENUM } from '../../constants'
import { taskFilterActions } from '../../task-map/task-filter/task-filter-actions'
import { cancelMove } from '../../../redux/ducks/improved-taskmap-interactions'
import { isInTemplate } from '../../../components/navigation/common/location-context-helper'
import { useTranslation } from 'react-i18next'
import { flatTaskListFromTree } from '../../../services/task/data-provider/task-list-data-provider'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

const styles = makeStyles()(theme => ({
  switcherDiv: {
    backgroundColor: rawColours.primary.black[200],
    position: 'absolute',
    bottom: '302px',
    right: '10px',
    zIndex: 1000,
    display: 'flex',
    width: '192px',
    height: '30px',
    borderRadius: '5px 5px 0px 0px',
  },
  roadmapSwitcherDiv: {
    backgroundColor: rawColours.primary.black[200],
    position: 'absolute',
    bottom: '210px',
    right: '10px',
    zIndex: 999,
    display: 'flex',
    width: '244px',
    height: '30px',
    borderRadius: '5px 5px 0px 0px',
  },
  menuButton: {
    color: juralioColours.whiteText.primary,
    width: '100%',
    height: '30px',
    backgroundColor: rawColours.primary.black[200],
    '&:hover': {
      backgroundColor: rawColours.primary.black[100],
    },
  },
  viewModeRow: {
    display: 'flex',
    textTransform: 'none',
  },
  viewModeIcon: {
    marginRight: '2px',
  },
  viewModeLabel: {
    margin: 'auto',
  },
  menuButtonInner: {
    alignSelf: 'center',
    display: 'flex',
    marginRight: '2px',
  },
  menuSectionHeader: {
    borderBottom: '1px solid lightgrey',
    margin: '4px',
  },
}))

const MiniMapViewSwitcher = props => {
  const { t } = useTranslation()
  const { isRoadmap } = props
  const { classes } = styles()
  const dispatch = useDispatch()
  const isTemplate = isInTemplate(window.location.href)
  const dView = useSelector(state => state.taskMapFilter.detailedView)
  const project = useSelector(state => state.project)
  const detailedView = isTemplate
    ? { viewMode: dView.templateViewMode, showRisk: false }
    : dView

  const taskmapInteractions = useSelector(
    state => state.improvedTaskmapInteractions
  )
  const [labels, setLabels] = useState([])
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const noLabels = labels.length === 0

  useEffect(() => {
    const tasks = flatTaskListFromTree(project)
    const l = [...new Set(tasks.map(task => task.labels).flat())]
      .filter(l => l !== undefined)
      .filter((v, i, a) => a.findIndex(t => t?.labelId === v?.labelId) === i)
    setLabels(l)
  }, [project])

  const handleViewChange = (showDetailed, showRisk) => {
    if (isTemplate) {
      dispatch(taskFilterActions.setDetailedTemplateView(showDetailed))
    } else {
      dispatch(taskFilterActions.setDetailedView(showDetailed, showRisk))
    }
    if (taskmapInteractions.move) {
      dispatch(cancelMove())
      window.localStorage.setItem('dropZoneId', '-1')
      window.dispatchEvent(new Event('completeMove'))
    }
  }

  const getCurrentViewTitle = () => {
    switch (detailedView.viewMode) {
      case TASK_MAP_VIEW_MODE_ENUM.COMPACT:
        return (
          <div className={classes.viewModeRow}>
            <JurCompact
              stroke={juralioColours.whiteText.primary}
              className={classes.viewModeIcon}
            />
            <Typography className={classes.viewModeLabel}>
              {t('detailedView.compactTitle')}
            </Typography>
          </div>
        )
      case TASK_MAP_VIEW_MODE_ENUM.STANDARD:
        return (
          <div className={classes.viewModeRow}>
            <JurStandard
              stroke={juralioColours.whiteText.primary}
              className={classes.viewModeIcon}
            />
            <Typography className={classes.viewModeLabel}>
              {t('detailedView.standardTitle')}
            </Typography>
          </div>
        )
      case TASK_MAP_VIEW_MODE_ENUM.DETAILED:
        return (
          <div className={classes.viewModeRow}>
            <JurDetailed
              stroke={juralioColours.whiteText.primary}
              className={classes.viewModeIcon}
            />
            <Typography className={classes.viewModeLabel}>
              {t('detailedView.detailedTitle')}
            </Typography>
          </div>
        )
      default:
        break
    }
  }

  return (
    <>
      <div>
        <div
          style={
            props?.showMinimised
              ? { bottom: '54px', borderRadius: '5px' }
              : isRoadmap && props.timePeriodOptions === null
                ? { bottom: '210px' }
                : {}
          }
          className={
            isRoadmap ? classes.roadmapSwitcherDiv : classes.switcherDiv
          }
        >
          <div className={classes.menuButtonInner}>
            <Button
              data-test="minimap-view-menu"
              className={classes.menuButton}
              onClick={event => {
                setAnchorEl(event.currentTarget)
              }}
              endIcon={<KeyboardArrowDownIcon />}
            >
              {getCurrentViewTitle()}
            </Button>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={() => {
                setAnchorEl(null)
              }}
            >
              <div className={classes.menuSectionHeader}>
                <Typography variant="subtitle2">
                  {t('detailedView.menuHeader')}
                </Typography>
              </div>
              <Tooltip title={t('detailedView.compactTooltip')}>
                <MenuItem
                  data-test="compact-view-filter"
                  disabled={
                    detailedView.viewMode === TASK_MAP_VIEW_MODE_ENUM.COMPACT
                  }
                  onClick={() => {
                    handleViewChange(
                      TASK_MAP_VIEW_MODE_ENUM.COMPACT,
                      detailedView.showRisk
                    )
                    setAnchorEl(null)
                  }}
                >
                  <div className={classes.viewModeRow}>
                    <JurCompact stroke={juralioColours.darkText.primary} />
                    <Typography className={classes.viewModeLabel}>
                      {t('detailedView.compactTitle')}
                    </Typography>
                  </div>
                </MenuItem>
              </Tooltip>
              <Tooltip
                title={
                  isTemplate
                    ? t('detailedView.standardTemplateTooltip')
                    : t('detailedView.standardTooltip')
                }
              >
                <MenuItem
                  data-test="standard-view-filter"
                  disabled={
                    detailedView.viewMode === TASK_MAP_VIEW_MODE_ENUM.STANDARD
                  }
                  onClick={() => {
                    handleViewChange(
                      TASK_MAP_VIEW_MODE_ENUM.STANDARD,
                      detailedView.showRisk
                    )
                    setAnchorEl(null)
                  }}
                >
                  <div className={classes.viewModeRow}>
                    <JurStandard stroke={juralioColours.darkText.primary} />
                    <Typography className={classes.viewModeLabel}>
                      {t('detailedView.standardTitle')}
                    </Typography>
                  </div>
                </MenuItem>
              </Tooltip>
              {!isTemplate && !noLabels && (
                <Tooltip title={t('detailedView.detailedTooltip')}>
                  <MenuItem
                    data-test="detailed-view-filter"
                    disabled={
                      detailedView.viewMode === TASK_MAP_VIEW_MODE_ENUM.DETAILED
                    }
                    onClick={() => {
                      handleViewChange(
                        TASK_MAP_VIEW_MODE_ENUM.DETAILED,
                        detailedView.showRisk
                      )
                      setAnchorEl(null)
                    }}
                  >
                    <div className={classes.viewModeRow}>
                      <JurDetailed stroke={juralioColours.darkText.primary} />
                      <Typography className={classes.viewModeLabel}>
                        {t('detailedView.detailedTitle')}
                      </Typography>
                    </div>
                  </MenuItem>
                </Tooltip>
              )}
            </Menu>
          </div>
        </div>
      </div>
    </>
  )
}
export default MiniMapViewSwitcher
