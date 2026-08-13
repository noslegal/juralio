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
import { makeStyles } from 'tss-react/mui'

import ProjectionHeader from './outcomes/ProjectionHeader'
import { Divider, Paper, Typography } from '@mui/material'
import dayjs from 'dayjs'
import costsService from '../../services/costs/costs-service'
import matterCostsService from '../../services/costs/matter-costs-service'
import rawColours from '../../theme/raw-colours'
import MatterNewProjectionPeriod from './MatterNewProjectionPeriod'
import LoadingButton from '@mui/lab/LoadingButton'
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined'
import juralioColours from '../../theme/juralio-colours'

const useStyles = makeStyles()(theme => ({
  darkButton: {
    marginLeft: theme.spacing(4),
    textTransform: 'none',
    marginRight: '8px',
    color: rawColours.primary.grey.main,
    backgroundColor: rawColours.primary.black[200],
    '&:hover': {
      backgroundColor: rawColours.primary.black.black,
    },
  },
  title: {
    paddingTop: theme.spacing(3),
    marginBottom: theme.spacing(1),
  },
  paper: {
    marginBottom: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    paddingLeft: theme.spacing(4),
  },
  projectionWrapper: {
    display: 'flex',
  },
}))

const MatterNewProjectionContainer = props => {
  const { rtd, matterId, setPageInfo, setSelectedPage } = props
  const { classes } = useStyles()
  const [buttonClicked, setButtonClicked] = useState(false)
  const [startDate, setStartDate] = useState(
    props.newStartdate ? props.newStartdate : dayjs().startOf('month').toDate()
  )
  const [endDate, setEndDate] = useState(
    dayjs(props.endDate).add(
      dayjs(props.endDate).diff(props.startDate, 'M') + 1,
      'M'
    )
  )

  const handleClick = () => {
    setButtonClicked(true)
    costsService
      .createProjectionPeriod(matterId, {
        startDate: dayjs(startDate).add(1, 'h'),
        endDate: dayjs.utc(endDate),
        matterId: matterId,
      })
      .then(() => {
        matterCostsService.getCostStageData(matterId).then(res => {
          if (res.status === 200) {
            setButtonClicked(false)
            setPageInfo(res.body)
            setSelectedPage(2)
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

  return (
    <>
      <ProjectionHeader
        startDate={startDate}
        endDate={endDate}
        currency={rtd.currency}
        setSelectedPage={setSelectedPage}
        addNewProjection={true}
        disableClicks={true}
      />
      <Paper className={classes.paper}>
        <Typography className={classes.title} variant="h5">
          What period does this projection cover?
        </Typography>
        <Divider />
        <MatterNewProjectionPeriod
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={dayjs(endDate).toDate()}
          setEndDate={setEndDate}
          canSetStartDate={props.isValidSnapshots}
          fullPeriod={{ startDate: startDate, endDate: endDate }}
        />
      </Paper>
      <LoadingButton
        style={
          buttonClicked
            ? {
                paddingRight: '30px',
                color: juralioColours.whiteText.primary,
              }
            : {}
        }
        loadingPosition="end"
        loading={buttonClicked}
        className={classes.darkButton}
        onClick={() => {
          if (!buttonClicked) {
            handleClick()
          }
        }}
      >
        <span>
          <div className={classes.projectionWrapper}>
            <Typography>{' Save projection period'}</Typography>
            {!buttonClicked && (
              <ArrowCircleRightOutlinedIcon className={classes.buttonIcon} />
            )}
          </div>
        </span>
      </LoadingButton>
    </>
  )
}
export default MatterNewProjectionContainer
