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
  Chip,
  Collapse,
  Dialog,
  IconButton,
  Paper,
  Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import CloseIcon from '@mui/icons-material/Close'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import taskService from '../../services/task/task-service'
import AssumptionsList from './AssumptionsList'
import { flatTaskListFromTree } from '../../services/task/data-provider/task-list-data-provider'
import AssumptionDeliverableList from './AssumptionDeliverableList'
import { makeStyles } from 'tss-react/mui'
import matterCostsService from '../../services/costs/matter-costs-service'
import BigDataSpinner from '../../components/feedback/big-data-spinner/BigDataSpinner'
import { useSelector } from 'react-redux'
import juralioColours from '../../theme/juralio-colours'
import rawColours from '../../theme/raw-colours'
import { TaskIcon, WorkstreamIcon } from '../../theme/navigation/CommonIcons'
import AssumptionIcon from '../../assets/images/JurAssumptions'
import { getStatusColour } from '../../services/helpers/task/task-status-colour-helper'
import { getTaskStatusLabel } from '../../services/helpers/task/task-util-helper'
import { useTranslation } from 'react-i18next'

const style = makeStyles()(theme => ({
  dialogPaper: {
    borderRadius: 20,
    width: '90%',
    maxWidth: 1000,
  },
  body: {
    padding: theme.spacing(3),
    paddingTop: theme.spacing(2.5),
  },
  headerContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(2),
  },
  headerTextBlock: {
    flex: 1,
  },
  headerTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  headerSubtitle: {
    color: juralioColours.darkText.secondary,
    marginTop: theme.spacing(0.25),
  },
  closeButton: {
    color: juralioColours.darkText.secondary,
    marginLeft: theme.spacing(1),
  },
  snapshotDateChip: {
    backgroundColor: juralioColours.taskStatus.done,
    color: juralioColours.whiteText.primary,
    fontWeight: 600,
    '& .MuiChip-icon': {
      width: 14,
      height: 14,
      '& svg': {
        width: 14,
        height: 14,
      },
    },
  },
  wsContainer: {
    marginBottom: theme.spacing(2),
    borderRadius: 12,
    overflow: 'hidden',
    border: `solid 1px ${rawColours.primary.grey.main}`,
  },
  wsHeader: {
    background: '#717BBC',
    color: juralioColours.whiteText.primary,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1.25),
    paddingBottom: theme.spacing(1.25),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    cursor: 'pointer',
  },
  wsTitle: {
    fontWeight: 600,
  },
  wsCount: {
    opacity: 0.85,
    fontWeight: 400,
  },
  wsExpandIcon: {
    marginLeft: 'auto',
    color: juralioColours.whiteText.primary,
    display: 'flex',
  },
  wsIcon: {
    display: 'flex',
  },
  wsBody: {
    padding: theme.spacing(1.5),
    paddingBottom: theme.spacing(0.5),
    backgroundColor: rawColours.primary.grey[100],
  },
  phaseCard: {
    marginBottom: theme.spacing(1.5),
    borderRadius: 12,
    overflow: 'hidden',
    border: `solid 1px ${rawColours.primary.grey.main}`,
  },
  phaseHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(1.25),
    paddingBottom: theme.spacing(1.25),
    cursor: 'pointer',
  },
  phaseBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: theme.spacing(4.5),
    height: theme.spacing(4.5),
    borderRadius: '50%',
    flexShrink: 0,
    color: juralioColours.whiteText.primary,
  },
  phaseBadgeIcon: {
    fontSize: 22,
  },
  phaseTitleBlock: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  phaseName: {
    fontWeight: 600,
    color: juralioColours.darkText.primary,
  },
  phaseCounts: {
    color: juralioColours.darkText.secondary,
  },
  phaseStatusChip: {
    marginLeft: 'auto',
    fontWeight: 600,
    color: juralioColours.darkText.primary,
  },
  phaseExpandIcon: {
    color: juralioColours.darkText.secondary,
    display: 'flex',
  },
  phaseBody: {
    display: 'grid',
    gridTemplateColumns: '35% 65%',
    backgroundColor: rawColours.primary.white.primary,
  },
}))

const CostAssumption = props => {
  const { t } = useTranslation()
  const {
    matterId,
    isViewOnly,
    snapshotAssumptions,
    snapshotCostTimeEstimates,
    snapshotDate,
    onClose,
  } = props
  const isSnapshot = !!snapshotAssumptions
  const statusBorderColour = isSnapshot
    ? juralioColours.taskStatus.done
    : juralioColours.taskStatus.inProgress
  const statusBackgroundColour = isSnapshot
    ? rawColours.status.done.light
    : rawColours.status.inProgress.light
  const { classes } = style()
  const [matterTasks, setMatterTasks] = useState([])
  const [matterAssumptions, setMatterAssumptions] = useState([])
  const matterDetails = useSelector(state => state.matterDetails)
  const [loaded, setLoaded] = useState(false)
  const [workstreamCollapse, setWorkstreamCollapse] = useState([])
  const [phaseCollapse, setPhaseCollapse] = useState([])

  const getDeliverables = task => {
    if (isSnapshot) {
      const cte = snapshotCostTimeEstimates?.find(c => c.task.id === task.id)
      return cte?.task?.deliverables || []
    }
    return flatTaskListFromTree(task).filter(t => t.isDeliverable === true)
  }

  useEffect(() => {
    taskService.getAllMatterTasks(matterId).then(res => {
      setMatterTasks(res.body.filter(t => t.level < 2))
      if (isSnapshot) {
        const mapped = snapshotAssumptions.map(a => ({
          ...a,
          task: { id: a.taskId },
        }))
        setMatterAssumptions(mapped)
        setLoaded(true)
      } else {
        matterCostsService.getAssumptions(matterId).then(r => {
          setMatterAssumptions(r.body)
          setLoaded(true)
        })
      }
    })
    //eslint-disable-line
  }, []) //eslint-disable-line

  const handleList = workstreamId => {
    let x = workstreamCollapse
    if (x.includes(workstreamId)) {
      const index = x.indexOf(workstreamId)
      x.splice(index, 1) // 2nd parameter means remove one item only
    } else {
      x.push(workstreamId)
    }
    setWorkstreamCollapse([...x])
  }

  const handlePhase = phaseId => {
    let x = phaseCollapse
    if (x.includes(phaseId)) {
      x.splice(x.indexOf(phaseId), 1)
    } else {
      x.push(phaseId)
    }
    setPhaseCollapse([...x])
  }

  const getPhaseAssumptions = phaseId =>
    matterAssumptions.length > 0
      ? matterAssumptions.filter(a => a.task.id === phaseId)
      : []

  const countsLabel = (assumptionCount, deliverableCount) =>
    `${t('matterCosts.assumptions.assumptionCount', {
      count: assumptionCount,
    })} · ${t('matterCosts.assumptions.deliverableCount', {
      count: deliverableCount,
    })}`

  const renderPhase = item => {
    const deliverables = getDeliverables(item)
    const phaseAssumptions = getPhaseAssumptions(item.id)
    const statusColour = getStatusColour(item.status)
    const collapsed = phaseCollapse.includes(item.id)
    return (
      <Paper key={item.id} elevation={0} className={classes.phaseCard}>
        <div
          data-test="phase-header"
          className={classes.phaseHeader}
          style={{
            backgroundColor: rawColours.primary.grey[100],
            borderLeft: `solid 4px ${statusColour}`,
          }}
          onClick={() => handlePhase(item.id)}
        >
          <div
            className={classes.phaseBadge}
            style={{ backgroundColor: statusColour }}
          >
            <TaskIcon className={classes.phaseBadgeIcon} htmlColor="inherit" />
          </div>
          <div className={classes.phaseTitleBlock}>
            <Typography className={classes.phaseName} noWrap>
              {item.name}
            </Typography>
            <Typography variant="caption" className={classes.phaseCounts}>
              {countsLabel(phaseAssumptions.length, deliverables.length)}
            </Typography>
          </div>
          <Chip
            size="small"
            className={classes.phaseStatusChip}
            label={getTaskStatusLabel(t, item.status)}
            style={{ backgroundColor: statusColour }}
          />
          <div className={classes.phaseExpandIcon}>
            {collapsed ? <ExpandMore /> : <ExpandLess />}
          </div>
        </div>
        <Collapse in={!collapsed} timeout="auto" unmountOnExit>
          <div className={classes.phaseBody}>
            <AssumptionDeliverableList deliverables={deliverables} />
            <AssumptionsList
              phaseId={item.id}
              matterId={matterId}
              assumptionsForPhase={phaseAssumptions}
              isViewOnly={isViewOnly || isSnapshot}
            />
          </div>
        </Collapse>
      </Paper>
    )
  }

  const activeProjects = matterDetails.matter.projects.filter(p => p.active)
  const multiWorkstream = activeProjects.length > 1

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="md"
      fullWidth
      classes={{ paper: classes.dialogPaper }}
      slotProps={{
        paper: {
          style: {
            backgroundColor: statusBackgroundColour,
            border: `2px solid ${statusBorderColour}`,
          },
        },
      }}
    >
      {!loaded && <BigDataSpinner />}
      {loaded && (
        <div className={classes.body}>
          <div className={classes.headerContainer}>
            <div className={classes.headerTextBlock}>
              <div className={classes.headerTitleRow}>
                <Typography variant="h5">
                  {t('matterCosts.assumptions.matterAssumptions', {
                    type: isSnapshot ? 'projection' : 'matter',
                  })}
                </Typography>
                {isSnapshot && snapshotDate && (
                  <Chip
                    size="small"
                    className={classes.snapshotDateChip}
                    icon={<AssumptionIcon color="white" />}
                    label={t('matterCosts.assumptions.finalisedChip', {
                      date: dayjs(snapshotDate).format('D MMM YYYY'),
                    })}
                  />
                )}
              </div>
              <Typography variant="body2" className={classes.headerSubtitle}>
                {isSnapshot
                  ? t('matterCosts.assumptions.projectionAssumptionsSubtitle')
                  : t('matterCosts.assumptions.matterAssumptionsSubtitle')}
              </Typography>
            </div>
            {onClose && (
              <IconButton
                data-test="close-assumptions"
                aria-label={t('common.close')}
                className={classes.closeButton}
                onClick={onClose}
                size="small"
              >
                <CloseIcon />
              </IconButton>
            )}
          </div>

          {multiWorkstream
            ? activeProjects.map(project => {
                const workstreamTasks = matterTasks.filter(
                  t => t.project.id === project.id
                )
                const wsAssumptionCount = workstreamTasks.reduce(
                  (sum, task) => sum + getPhaseAssumptions(task.id).length,
                  0
                )
                const collapsed = workstreamCollapse.includes(project.id)
                return (
                  <div key={project.id} className={classes.wsContainer}>
                    <div
                      onClick={() => handleList(project.id)}
                      className={classes.wsHeader}
                    >
                      <span className={classes.wsIcon}>
                        <WorkstreamIcon />
                      </span>
                      <Typography variant="h6" className={classes.wsTitle}>
                        {project.name}{' '}
                        <span className={classes.wsCount}>
                          ({wsAssumptionCount})
                        </span>
                      </Typography>
                      <span className={classes.wsExpandIcon}>
                        {collapsed ? <ExpandMore /> : <ExpandLess />}
                      </span>
                    </div>
                    <Collapse in={!collapsed} timeout="auto" unmountOnExit>
                      <div className={classes.wsBody}>
                        {workstreamTasks.map(renderPhase)}
                      </div>
                    </Collapse>
                  </div>
                )
              })
            : matterTasks.map(renderPhase)}
        </div>
      )}
    </Dialog>
  )
}
export default CostAssumption
