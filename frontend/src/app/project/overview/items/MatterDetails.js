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

import { Link } from '@mui/material'
import Typography from '@mui/material/Typography'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import { getMatterOverviewUrl } from '../../../../components/navigation/common/location-context-helper'
import colorModifiers from '../../../../theme/color-modifiers'
import { MattersIcon } from '../../../../theme/navigation/CommonIcons'
import rawColours from '../../../../theme/raw-colours'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  matterDetailsDivider: {
    marginLeft: theme.spacing(),
    marginRight: theme.spacing(),
    color: colorModifiers.primaryText(rawColours.primary.black[200]),
  },
  matterDetailsReferenceNumber: {
    color: colorModifiers.primaryText(rawColours.primary.black[200]),
    marginLeft: theme.spacing(0.5),
  },
  matterDetailsMatterName: {
    fontSize: theme.spacing(1.75),
    marginTop: 'auto',
    marginBottom: 'auto',
    color: rawColours.primary.primary.main,
    maxWidth: '70%',
  },
  matterName: {
    whiteSpace: 'nowrap',
    maxWidth: theme.spacing(31),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}))

const MatterDetails = props => {
  const { classes } = useStyles()
  const { matterDetails, project, showLinkToMatterOverview, isTemplate } = props
  return (
    <div className={classes.root}>
      {showLinkToMatterOverview && (
        <>
          <Link
            href={'#' + getMatterOverviewUrl(project.matterId)}
            className={classes.matterDetailsMatterName}
            data-test="matter-overview-link"
          >
            <Typography className={classes.matterName}>
              {matterDetails.matter?.name}
            </Typography>
          </Link>
          <Typography className={classes.matterDetailsDivider}>|</Typography>
        </>
      )}
      {!isTemplate && (
        <>
          <MattersIcon fontSize="small" />
          <Typography
            className={classes.matterDetailsReferenceNumber}
            data-test="matter-overview-reference-number"
          >
            {matterDetails.matter?.userDefinedReferenceNumber}
          </Typography>
        </>
      )}
    </div>
  )
}

export default MatterDetails
