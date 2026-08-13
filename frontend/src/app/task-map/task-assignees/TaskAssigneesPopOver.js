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
  Card,
  CardContent,
  LinearProgress,
  Popover,
  useTheme,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { withStyles } from 'tss-react/mui'
import TeamSearch from '../../../components/inputs/team-search/TeamSearch'
import UserList from '../../../components/layouts/user-list/UserList'
import {
  formatUserDisplayName,
  formatUserDisplayNameAndUserName,
} from '../../../services/user/helper/user-format-service'
import { HEIGHT_OFFSET } from '../TaskMapContentHelper'
import {
  isInImprovedTaskmapContext,
  isInRoadmapContext,
} from '../../../services/helpers/route/route-context-helper'

const CARD_HEIGHT = 34
const CARD_WIDTH = 50
const ICICLE_TOP_OFFSET = 50

const style = theme => ({
  cardWrapper: {
    minWidth: theme.spacing(CARD_WIDTH),
    maxWidth: theme.spacing(CARD_WIDTH),
    height: theme.spacing(CARD_HEIGHT + 10),
    minHeight: theme.spacing(CARD_HEIGHT + 10),
    overflowX: 'hidden',
    zIndex: 10000,
  },
  content: {
    height: '100%',
    overflow: 'scroll',
  },
})

const AddAssignee = props => {
  const { t } = useTranslation()
  const theme = useTheme()
  return (
    <>
      <TeamSearch
        focus={true}
        onClose={() => props.setShowUserList(true)}
        matterId={props.matter.toString()}
        onInputChange={props.onSearchInputchange}
        onChange={props.addAssignee}
        placeholder={t('inbox.chooseUserPlaceholder')}
        formatUserDisplayName={formatUserDisplayName}
        teamMemberOptions={props.matterTeam}
        team={props.taskTeam}
        filterHidden={true}
        flatResultsList={true}
        menuStyle={{
          minHeight: theme.spacing(CARD_HEIGHT),
          maxHeight: theme.spacing(CARD_HEIGHT),
          maxWidth: theme.spacing(CARD_WIDTH - 4),
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
        showNoResults={!props.showUserList}
        showPlaceholders={true}
        showPlaceholderAdd={true}
        disabled={false}
      />
      {props.showUserList && (
        <UserList
          users={props.matterTeam}
          selectable={true}
          onSelect={props.addAssignee}
          formatUserDisplayName={formatUserDisplayNameAndUserName}
          onRemoveClick={null}
          canRemoveSelf={true}
        />
      )}
    </>
  )
}

const TaskAssigneesPopOver = props => {
  const [anchorEl, setAnchorEl] = useState(null)
  const getTopOffset = () => {
    const viewHeight = window.innerHeight - HEIGHT_OFFSET
    const defaultTopOffset =
      props.position.top + HEIGHT_OFFSET + ICICLE_TOP_OFFSET
    if (defaultTopOffset + CARD_HEIGHT * 8 > viewHeight) {
      //it's going to be off the screen
      // push it above the assignee chip
      return props.position.top + HEIGHT_OFFSET - CARD_HEIGHT * 8
    } else {
      return defaultTopOffset
    }
  }

  const getLeftOffset = () => {
    const viewWidth = window.innerWidth
    const defaultLeft = props.position.left + 10
    if (defaultLeft + CARD_WIDTH * 8 > viewWidth) {
      //it's going to be off the screen
      //push it left till it fits on screen
      return viewWidth - CARD_WIDTH * 8
    } else {
      return defaultLeft
    }
  }

  useEffect(() => {
    if (props.selectedTask) {
      let d
      if (isInRoadmapContext()) {
        d = document.querySelector(
          `[data-test=roadmap-task-${props.selectedTask.id}]`
        )
      } else if (isInImprovedTaskmapContext()) {
        d = document.getElementById(`structure-item-${props.selectedTask.id}`)
      } else {
        d = document.getElementById(
          `list-item-${props.selectedTask.id}-team-chip`
        )
      }
      setAnchorEl(d)
    }
  }, [props.selectedTask])

  const existingIds = props.selectedTask?.teamMembers?.map(t => t.id)
  if (!existingIds) {
    return null
  }

  return (
    <Popover anchorEl={anchorEl} open={true} onClose={props.close}>
      <Card
        className={props.classes.cardWrapper}
        style={{
          left: getLeftOffset(),
          top: getTopOffset(),
        }}
        data-test="add-assignee-popover"
      >
        <CardContent className={props.classes.content}>
          {props.progressBar && <LinearProgress />}
          <AddAssignee
            matter={props.matterId}
            matterTeam={props.matterTeamMembers}
            taskTeam={props.taskTeam}
            addAssignee={props.addAssignee}
            users={props.users.filter(tm => !existingIds.includes(tm.id))}
            showUserList={props.showUserList}
            onSearchInputchange={props.onSearchInputchange}
            setShowUserList={props.setShowUserList}
          />
        </CardContent>
      </Card>
    </Popover>
  )
}

export default withStyles(TaskAssigneesPopOver, style)
