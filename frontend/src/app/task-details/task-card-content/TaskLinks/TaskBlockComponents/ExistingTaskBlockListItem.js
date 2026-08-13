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

import CloseIcon from '@mui/icons-material/Close'
import { Skeleton, Tooltip } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import TaskChip from '../../../../../components/data-display/task-chip/TaskChip'
import colorModifiers from '../../../../../theme/color-modifiers'
import rawColours from '../../../../../theme/raw-colours'

const styles = makeStyles()(theme => ({
  wrapper: {
    display: 'flex',
    margin: theme.spacing(0.5),
  },
  closeIcon: {
    cursor: 'pointer',
    marginLeft: theme.spacing(3),
    border: 'solid 1px black',
    borderRadius: '40px',
    height: theme.spacing(2),
    width: theme.spacing(2),
    marginTop: 'auto',
    marginBottom: 'auto',
    '&:hover': {
      backgroundColor: colorModifiers.hover(rawColours.primary.black.black),
    },
  },
  clickWrapper: {
    width: '100%',
    cursor: 'pointer',
  },
}))

const ExistingTaskBlockListItem = props => {
  const { classes } = styles()
  const { t } = useTranslation()

  const openTaskInNewTab = () => {
    if (window.location.href.includes('roadmap')) {
      const url =
        window.location.href.split('roadmap')[0] + 'task/' + props.block.id
      window.open(url, '_blank').focus()
    } else {
      const url =
        window.location.href.split('task')[0] + 'task/' + props.block.id
      window.open(url, '_blank').focus()
    }
  }

  return (
    <div className={classes.wrapper} data-test="existing-block">
      <div onClick={openTaskInNewTab} className={classes.clickWrapper}>
        <TaskChip
          task={props.block}
          allowBubble={true}
          closeHandler={() => {}}
        />
      </div>
      {!props.hideDelete && (
        <Tooltip title={t('taskBlocksDialog.removeBlock')}>
          <CloseIcon
            className={classes.closeIcon}
            onClick={() => {
              props.removeBlock(props.block.id)
            }}
            data-test="remove-block"
          />
        </Tooltip>
      )}
    </div>
  )
}
export default ExistingTaskBlockListItem

export const ExistingTaskBlockListItemLoadingState = () => {
  return <Skeleton height={'32px'} />
}
