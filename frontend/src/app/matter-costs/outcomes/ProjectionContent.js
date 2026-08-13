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

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import MatterProjectionPeriod from '../resource/MatterProjectionPeriod'
import { Button, Paper, Typography } from '@mui/material'
import rawColours from '../../../theme/raw-colours'
import MatterCostsResourceContainer from '../resource/MatterCostsResourceContainer'
import MatterPricingContainer from '../pricing/MatterPricingContainer'
import costsService from '../../../services/costs/costs-service'
import dayjs from 'dayjs'
import matterCostsService from '../../../services/costs/matter-costs-service'
import ProjectionSummary from './ProjectionSummary'
import { getCostsDashboard } from '../../../components/navigation/common/location-context-helper'
import { useNavigate } from 'react-router'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

const useStyles = makeStyles()(theme => ({
  resourceTab: {
    margin: '0px 4px 0px 0px',
    width: '50%',
    padding: theme.spacing(1),
    borderRadius: '20px 20px 0px 0px',
  },
  pricingTab: {
    margin: '0px 0px 0px 4px',
    width: '50%',
    padding: theme.spacing(1),
    borderRadius: '20px 20px 0px 0px',
  },
  paper: {
    padding: theme.spacing(1),
    margin: theme.spacing(1),
  },
  confirmBox: {
    marginTop: theme.spacing(2),
    backgroundColor: 'rgba(16, 24, 40, 0.1)',
    borderRadius: theme.spacing(),
    padding: theme.spacing(1.25),
  },
  confirmButton: {
    textTransform: 'none',
    marginRight: theme.spacing(1),
    color: rawColours.primary.grey.main,
    backgroundColor: rawColours.primary.black[200],
    '&:hover': {
      backgroundColor: rawColours.primary.black.black,
    },
  },
  paper: {
    padding: theme.spacing(1),
    margin: theme.spacing(1),
  },
}))

const ProjectionContent = props => {
  const { classes } = useStyles()
  const {
    startDate,
    endDate,
    fullPeriod,
    setFullPeriod,
    selectedArea,
    setSelectedArea,
    matterId,
    currency,
    setIsExpanded,
    data,
    updateData,
    isSnapshot,
    setCollapseData,
    setPageInfo,
    rtd,
    rates,
    setTotalHours,
    setIsCardOpen,
    snapshotId,
    diffArray,
    liveMode,
    matterTasks,
    setMatterTasks,
    canEditStartDate,
  } = props
  const { t } = useTranslation()
  const history = useNavigate()
  const [buttonClicked, setButtonClicked] = useState(false)
  const getButtonText = () => {
    switch (selectedArea) {
      case 0:
        if (fullPeriod) {
          return t('matterProjection.buttonUpdate')
        } else {
          return t('matterProjection.buttonCreate')
        }
      default:
        break
    }
  }

  const handleButtonClick = () => {
    setButtonClicked(true)
    switch (selectedArea) {
      case 0:
        if (fullPeriod) {
          costsService
            .editProjectionPeriod(fullPeriod.id, {
              startDate: startDate,
              endDate: endDate,
              matterId: matterId,
            })
            .then(() => {
              matterCostsService.getCostStageData(matterId).then(res => {
                setPageInfo(res.body)
                history(getCostsDashboard(matterId))
                setSelectedArea(1)
                setButtonClicked(false)
                window.location.href =
                  window.location.href +
                  '/projection/' +
                  res.body.projectionPeriodList[
                    res.body.projectionPeriodList.length - 1
                  ].id +
                  '/pricing'
              })
            })
        } else {
          costsService
            .createProjectionPeriod(matterId, {
              startDate: dayjs(startDate).add(1, 'h'),
              endDate: dayjs.utc(endDate),
              matterId: matterId,
            })
            .then(res => {
              setFullPeriod(res.body)
              matterCostsService.getCostStageData(matterId).then(res => {
                if (res.status === 200) {
                  setPageInfo(res.body)
                  setSelectedArea(1)
                  setButtonClicked(false)
                  window.location.href =
                    window.location.href +
                    '/projection/' +
                    res.body.projectionPeriodList[
                      res.body.projectionPeriodList.length - 1
                    ].id +
                    '/pricing'
                }
              })
            })
        }

        break
      default:
        break
    }
  }

  const isDisabled = () => {
    if (endDate === undefined) {
      return true
    }
    if (
      fullPeriod &&
      dayjs(startDate).diff(dayjs(fullPeriod.startDate)) === 0 &&
      dayjs(endDate).endOf('M').diff(dayjs(fullPeriod.endDate).endOf('M')) === 0
    ) {
      return true
    }
  }

  return (
    <div>
      {selectedArea === 0 && (
        <>
          <Paper className={classes.paper}>
            <div>
              <Typography variant="h6">
                {t('matterProjection.projectionPeriodTitle')}
              </Typography>
              <Typography variant="subtitle1">
                {t('matterProjection.projectionPeriodSubtitle')}
              </Typography>
              <MatterProjectionPeriod {...props} />
            </div>
          </Paper>
          <div className={classes.confirmBox}>
            {fullPeriod && (
              <Button
                className={classes.confirmButton}
                onClick={() => {
                  setIsCardOpen(false)
                  setIsExpanded(false)
                  setCollapseData(false)
                  history(getCostsDashboard(matterId))
                }}
              >
                {t('common.cancel')}
              </Button>
            )}
            <Button
              disabled={isDisabled() || buttonClicked}
              className={classes.confirmButton}
              onClick={() => handleButtonClick()}
            >
              {getButtonText()}
            </Button>
          </div>
        </>
      )}
      {selectedArea === 1 && (
        <MatterPricingContainer
          matterId={matterId}
          currency={currency}
          fullPeriod={fullPeriod}
          setSelectedArea={setSelectedArea}
          data={data}
          updateData={updateData}
          isSnapshot={isSnapshot}
          setPageInfo={setPageInfo}
          snapshotId={snapshotId}
          setIsExpanded={setIsExpanded}
          setCollapseData={setCollapseData}
          setIsCardOpen={setIsCardOpen}
          rates={rates}
          rtd={rtd}
          liveMode={liveMode}
          setLiveMode={props.setLiveMode}
          matterTasks={matterTasks}
          diffArray={diffArray}
        />
      )}
      {selectedArea === 2 && (
        <div>
          <MatterCostsResourceContainer
            snapshotId={snapshotId}
            isSnapshot={isSnapshot}
            data={data}
            updateData={updateData}
            matterId={matterId}
            currency={currency}
            fullPeriod={fullPeriod}
            setIsExpanded={setIsExpanded}
            setCollapseData={setCollapseData}
            setPageInfo={setPageInfo}
            rtd={rtd}
            rates={rates}
            setTotalHours={setTotalHours}
            setIsCardOpen={setIsCardOpen}
            matterTasks={matterTasks}
            diffArray={diffArray}
            setMatterTasks={setMatterTasks}
            durationStart={fullPeriod.startDate}
            durationEnd={fullPeriod.endDate}
            setLiveMode={props.setLiveMode}
          />
        </div>
      )}
      {selectedArea === 3 && (
        <div>
          <ProjectionSummary
            data={data}
            matterId={matterId}
            diffArray={diffArray}
            durationStart={fullPeriod.startDate}
            durationEnd={fullPeriod.endDate}
            isSnapshot={isSnapshot}
            rtd={rtd}
            rates={rates}
            liveMode={liveMode}
            matterTasks={matterTasks}
          />
        </div>
      )}
    </div>
  )
}
export default ProjectionContent
