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
import DialogContent from '@mui/material/DialogContent'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import JuralioDialog from '../../../../components/dialog/juralio-dialog/JuralioDialog'
import { MultipleTasksIcon } from '../../../../theme/navigation/CommonIcons'
import ExistingTaskBlockListItem from './TaskBlockComponents/ExistingTaskBlockListItem'

const styles = makeStyles()(theme => ({
  container: {
    display: 'grid',
    gridTemplateColumns: 'auto',
    gridTemplateRows: 'auto auto',
    gridTemplateAreas: `'picker''existing'`,
    gap: '0px',
  },
  blockListWrapper: {
    minHeight: '50px',
    overflowY: 'auto',
  },
  link: { cursor: 'pointer' },
}))

const UnblockedTasksDialog = props => {
  const { t } = useTranslation()
  const { classes } = styles()
  const [blockedTasks, setBlockedTasks] = useState([])

  useEffect(() => {
    setBlockedTasks(props.blockerslist)
  }, [props.blockerList]) //eslint-disable-line

  return (
    <JuralioDialog
      open={true}
      titleText={t('taskBlocksDialog.tasksUnblockedTitle', {
        plural: blockedTasks.length > 1 ? 's' : '',
      })}
      titleIcon={MultipleTasksIcon}
      actionLabel={t('common.okay')}
      handleAction={props.onClose}
      handleCancel={props.onClose}
      hideCancel={true}
      onClose={props.onClose}
      style={{ overflow: 'hidden' }}
    >
      <DialogContent
        style={{ position: 'relative', overflow: 'hidden', height: '87%' }}
        data-test="dialog-content"
      >
        <div className={classes.container}>
          <Typography>
            {t('taskBlocksDialog.unblockedTasksListHeader', {
              plural: blockedTasks.length > 1 ? 's' : '',
            })}
          </Typography>
          <div className={classes.blockListWrapper} data-test="blocked-wrapper">
            {blockedTasks.map(task => (
              <ExistingTaskBlockListItem block={task} hideDelete={true} />
            ))}
          </div>
        </div>
      </DialogContent>
    </JuralioDialog>
  )
}
export default UnblockedTasksDialog
