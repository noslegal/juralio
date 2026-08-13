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

import React, { useEffect, useMemo, useState } from 'react'
import {
  Button,
  FormControlLabel,
  FormGroup,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material'
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined'
import dayjs from 'dayjs'
import { makeStyles } from 'tss-react/mui'
import { useTranslation } from 'react-i18next'
import JurCoins from '../../assets/images/JurCoins'
import AssumptionIcon from '../../assets/images/JurAssumptions'
import juralioColours from '../../theme/juralio-colours'
import rawColours from '../../theme/raw-colours'
import taskService from '../../services/task/task-service'
import ClientProjectionCard from './ClientProjectionCard'
import CostAssumption from './CostAssumption'
import { filterValidTasks } from './outcomes/revenueHelper'

const useStyles = makeStyles()(theme => ({
  root: {
    padding: theme.spacing(3),
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  titleBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
  },
  titleIcon: {
    color: juralioColours.darkText.primary,
  },
  title: {
    color: juralioColours.darkText.primary,
    fontWeight: 500,
  },
  subtitle: {
    color: juralioColours.darkText.secondary,
    marginLeft: theme.spacing(5.5),
  },
  subtitleItalic: {
    display: 'inline',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(1.5),
    flexShrink: 0,
  },
  addButton: {
    textTransform: 'none',
    color: juralioColours.darkText.primary,
    borderColor: juralioColours.darkText.primary,
    borderRadius: theme.spacing(3),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    backgroundColor: rawColours.primary.white.primary,
    '&:hover': {
      backgroundColor: rawColours.primary.grey[200],
    },
  },
  cardWrapper: {
    marginBottom: theme.spacing(2),
  },
  showRetiredGroup: {
    alignItems: 'flex-end',
    marginBottom: theme.spacing(1),
  },
  showRetiredLabel: {
    margin: 0,
  },
}))

const ClientCostsDashboard = ({
  matterId,
  projectionStageList = [],
  rtd,
  onAddProjection,
  onResumeProjection,
  onRefresh,
  readOnly = false,
}) => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const [matterTasks, setMatterTasks] = useState(null)
  const [showRetired, setShowRetired] = useState(false)
  const [showAssumptions, setShowAssumptions] = useState(false)

  useEffect(() => {
    if (!matterId) return
    taskService.getAllMatterTasks(matterId).then(res => {
      if (res?.status === 200) {
        setMatterTasks(res.body || [])
      }
    })
  }, [matterId])

  const totalPhases =
    matterTasks == null
      ? null
      : matterTasks.filter(task => task.level === 1).length

  const currency = rtd?.rateTableDetails?.currency || ''

  const retiredProjectionExists = projectionStageList.some(p => p?.isRetired)

  const retirableKeys = useMemo(() => {
    const ordered = [...projectionStageList].sort(
      (a, b) => (a?.isRetired ? 1 : 0) - (b?.isRetired ? 1 : 0)
    )
    const nonRetiredCount = projectionStageList.filter(
      p => !p?.isRetired
    ).length
    const keys = new Set()
    ordered.forEach((p, index) => {
      const canRetire =
        (index === 0 || (nonRetiredCount - 1 === index && !!p?.snapshot)) &&
        !!p?.snapshotId
      if (canRetire) keys.add(p.snapshotId)
    })
    return keys
  }, [projectionStageList])

  const visibleProjections = useMemo(
    () =>
      (readOnly
        ? projectionStageList.filter(p => p?.snapshot)
        : projectionStageList
      ).filter(p => showRetired || !p?.isRetired),
    [projectionStageList, readOnly, showRetired]
  )

  const sortedProjections = useMemo(() => {
    // Retired projections sink to the bottom; otherwise most-recent first.
    return [...visibleProjections].sort((a, b) => {
      const retiredDiff = (a?.isRetired ? 1 : 0) - (b?.isRetired ? 1 : 0)
      if (retiredDiff !== 0) return retiredDiff
      const aStart = a?.period?.startDate
        ? dayjs(a.period.startDate).valueOf()
        : 0
      const bStart = b?.period?.startDate
        ? dayjs(b.period.startDate).valueOf()
        : 0
      return bStart - aStart
    })
  }, [visibleProjections])

  const hasDraft = projectionStageList.some(p => !p?.snapshot)

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <div className={classes.titleBlock}>
          <div className={classes.titleRow}>
            <JurCoins className={classes.titleIcon} />
            <Typography variant="h5" className={classes.title}>
              {t('fixedFeeSetup.dashboard.title')}
            </Typography>
          </div>
          <Typography variant="body1" className={classes.subtitle}>
            {t('fixedFeeSetup.dashboard.subtitlePrefix')}
            <Typography
              component="span"
              variant="inherit"
              className={classes.subtitleItalic}
            >
              {t('fixedFeeSetup.dashboard.subtitleItalic')}
            </Typography>
          </Typography>
        </div>
        <div className={classes.headerActions}>
          <Button
            data-test="assumptions-button"
            variant="outlined"
            className={classes.addButton}
            endIcon={<AssumptionIcon color="black" />}
            onClick={() => setShowAssumptions(true)}
          >
            {t('matterCosts.assumptions.assumptions')}
          </Button>
          {!readOnly && (
            <Tooltip
              title={
                hasDraft
                  ? t(
                      'fixedFeeSetup.dashboard.addAnotherDisabled',
                      'Finish the in-progress fee setup before starting another'
                    )
                  : ''
              }
            >
              <span>
                <Button
                  data-test="add-fixed-fee"
                  variant="outlined"
                  className={classes.addButton}
                  endIcon={<ArrowCircleRightOutlinedIcon />}
                  onClick={onAddProjection}
                  disabled={hasDraft}
                >
                  {t('fixedFeeSetup.dashboard.addAnother')}
                </Button>
              </span>
            </Tooltip>
          )}
        </div>
      </div>
      {showAssumptions && (
        <CostAssumption
          matterId={matterId}
          isViewOnly={readOnly}
          onClose={() => setShowAssumptions(false)}
        />
      )}
      {!readOnly && retiredProjectionExists && (
        <FormGroup className={classes.showRetiredGroup}>
          <FormControlLabel
            className={classes.showRetiredLabel}
            label={t('matterProjection.showRetiredProjections')}
            control={
              <Switch
                data-test="show-retired-toggle"
                checked={showRetired}
                onChange={() => setShowRetired(v => !v)}
              />
            }
          />
        </FormGroup>
      )}
      {sortedProjections.map((projection, index) => {
        const isDraft = !projection?.snapshot
        const period = projection?.period
        const activePhases =
          isDraft && matterTasks
            ? filterValidTasks(matterTasks, period?.startDate, period?.endDate)
                .length
            : undefined
        const handleClick =
          !readOnly && isDraft && onResumeProjection
            ? () => onResumeProjection(period?.id)
            : undefined
        return (
          <div
            key={projection.snapshotId || projection.id || index}
            className={classes.cardWrapper}
            onClick={handleClick}
            style={handleClick ? { cursor: 'pointer' } : undefined}
          >
            <ClientProjectionCard
              projection={projection}
              currency={currency}
              matterId={matterId}
              totalPhases={totalPhases}
              activePhasesOverride={activePhases}
              onResumeProjection={readOnly ? undefined : onResumeProjection}
              forceExpanded={sortedProjections.length === 1}
              readOnly={readOnly}
              isViewOnly={readOnly}
              canBeRetired={retirableKeys.has(projection.snapshotId)}
              onRetired={onRefresh}
            />
          </div>
        )
      })}
    </div>
  )
}

export default ClientCostsDashboard
