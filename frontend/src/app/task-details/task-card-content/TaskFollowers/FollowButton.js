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

import InfoIcon from '@mui/icons-material/Info'
import { Tooltip } from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import LightButton from '../../../../components/inputs/light-button/LightButton'
import { getMilestoneOrTaskString } from '../../../../services/helpers/task/task-util-helper'
import juralioColours from '../../../../theme/juralio-colours'
import { TASK_STATUS } from '../../../constants'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  iconSmall: {
    color: juralioColours.darkText.secondary,
    height: 20,
    marginLeft: theme.spacing(),
  },
}))

const FollowButton = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const type = getMilestoneOrTaskString({ isMilestone: props.isMilestone })

  const clickHandler = props.isCurrentUserFollower
    ? () => props.unfollowClickHandler()
    : () => props.followClickHandler()

  const caption = props.isCurrentUserFollower
    ? t('taskCardContent.following.buttonCaptionStop', {
        type: type,
      })
    : t('taskCardContent.following.buttonCaption', {
        type: type,
      })

  const buttonStyle = {
    visibility: props.isCurrentUserTeamMember ? 'hidden' : 'visible',
  }
  return (
    <div
      className={classes.root}
      style={buttonStyle}
      data-test="followers-button"
    >
      <LightButton
        isNotStarted={props.task.status === TASK_STATUS.NOT_STARTED}
        caption={caption}
        clickHandler={clickHandler}
        trackingId="FollowButton"
        trackingValue={props.isCurrentUserFollower ? 'Unfollow' : 'Follow'}
        viewOnly={props.viewOnly}
      />
      <Tooltip
        title={t('taskCardContent.following.infotip', {
          type: type,
        })}
      >
        <InfoIcon className={classes.iconSmall} />
      </Tooltip>
    </div>
  )
}

FollowButton.propTypes = {
  /** isCurrentUserTeamMember */
  isCurrentUserTeamMember: PropTypes.bool.isRequired,
  /** isCurrentUserFollower */
  isCurrentUserFollower: PropTypes.bool.isRequired,
  /** unfollowClickHandler */
  unfollowClickHandler: PropTypes.func.isRequired,
  /** followClickHandler */
  followClickHandler: PropTypes.func.isRequired,
}

export default FollowButton
