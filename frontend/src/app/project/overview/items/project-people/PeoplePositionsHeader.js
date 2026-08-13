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
import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import GroupAvatar from '../../../../../components/layouts/manage-users/GroupAvatar'
import PositionPlaceholder from './PositionPlaceholder'
import { shouldUseClientNamePlaceholder } from './project-people-data-helper'

const useStyles = makeStyles()(theme => ({
  positionBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    marginRight: theme.spacing(6),
  },
  groupRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
}))

const PeoplePositionsHeader = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const { matter, overview } = props.matterDetails

  if (!overview?.positionsForMatter) return null

  return (
    <>
      {[...overview.positionsForMatter]
        .sort((a, b) => b.positionId - a.positionId)
        .map(position => {
          const groupsInPosition = overview.positionsOfGroups.filter(
            o => o.position.id === position.positionId
          )
          const useClientNamePlaceholder = shouldUseClientNamePlaceholder(
            overview,
            position.name
          )

          return (
            <div
              key={position.positionId}
              className={classes.positionBlock}
              data-test={`position-${position.name.toLowerCase()}`}
            >
              <Typography variant="subtitle1">{position.name}</Typography>
              {groupsInPosition.length > 0 ? (
                groupsInPosition.map(o => (
                  <div key={o.group.id} className={classes.groupRow}>
                    <GroupAvatar
                      group={o.group}
                      orgId={o.group.organisationId}
                      editable={false}
                      sx={{ width: 24, height: 24 }}
                    />
                    <Typography variant="body2">{o.group.name}</Typography>
                  </div>
                ))
              ) : (
                <PositionPlaceholder
                  className={classes.groupRow}
                  iconSize={24}
                  typographyVariant="body2"
                  dataTest="position-placeholder"
                  text={
                    useClientNamePlaceholder
                      ? matter.clientName
                      : t('matter.overview.groupPositionNotSelected')
                  }
                  tooltipKey={
                    useClientNamePlaceholder
                      ? 'project.overview.people.positions.placeholderTooltipClientName'
                      : 'project.overview.people.positions.placeholderTooltip'
                  }
                />
              )}
            </div>
          )
        })}
    </>
  )
}

PeoplePositionsHeader.propTypes = {
  /** matterDetails redux slice ({ matter, overview }) */
  matterDetails: PropTypes.object.isRequired,
}

export default PeoplePositionsHeader
