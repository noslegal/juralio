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

import { Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'
import { makeStyles } from 'tss-react/mui'
import OverviewMapIcon from '../../assets/images/OverviewMapIcon'
import { getMatterIdFromLocation } from '../../components/navigation/common/location-context-helper'
import colorModifiers from '../../theme/color-modifiers'
import rawColours from '../../theme/raw-colours'
import MatterOverviewRoadmapWorkstream from './MatterOverviewRoadmapWorkstream'

const MatterOverviewRoadmap = props => {
  const { t } = useTranslation()
  const workstreams = props.projects
  const location = useLocation()
  const { classes } = makeStyles()(theme => ({
    root: {
      overflowY: 'auto',
      height: `${window.innerHeight - 186}px`,
    },
    iconBackground: {
      backgroundColor: colorModifiers.secondaryBackground(
        rawColours.primary.grey.main
      ),
      paddingTop: theme.spacing(),
      paddingLeft: theme.spacing(),
      border: `solid 1px ${rawColours.primary.primary.main}`,
      borderRadius: theme.spacing(0.5),
      marginRight: theme.spacing(),
      paddingRight: theme.spacing(0.5),
    },
    icon: {
      color: rawColours.primary.primary.main,
    },
    title: {
      background: 'white',
      display: 'flex',
      paddingLeft: theme.spacing(3),
      alignItems: 'center',
    },
    titleText: {
      fontWeight: 400,
    },
    titleWrapper: {
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: theme.spacing(2),
      paddingTop: theme.spacing(2),
    },
  }))()

  const sortByWorkstreamNumber = (a, b) => {
    if (
      parseInt(a.referenceNumber.substring(1)) <
      parseInt(b.referenceNumber.substring(1))
    ) {
      return -1
    } else {
      return 1
    }
  }

  return (
    <div>
      <div className={classes.title}>
        <div className={classes.iconBackground}>
          <OverviewMapIcon className={classes.icon} />
        </div>
        <div className={classes.titleWrapper}>
          <Typography
            variant="h6"
            className={classes.titleText}
            data-test="matter-title"
          >
            {workstreams.length > 1
              ? t('matterOverview.multiMatterOverview', {
                  count: workstreams.length,
                  plural: workstreams.length > 1 ? 's' : '',
                })
              : t('matterOverview.matterOverview')}
          </Typography>
          <Typography variant="body1">
            {t('matterOverview.multiWorkstreamHelperText', {
              count: workstreams.length,
            })}
          </Typography>
        </div>
      </div>
      <div className={classes.root}>
        {workstreams.sort(sortByWorkstreamNumber).map((workstream, index) => (
          <MatterOverviewRoadmapWorkstream
            workstream={workstream}
            matterId={getMatterIdFromLocation(location)}
            earliestDate={props.earliestDate}
            latestDate={props.latestDate}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}

export default MatterOverviewRoadmap
