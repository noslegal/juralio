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
  DialogContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation, withTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import JuralioDialog from '../../../../../../components/dialog/juralio-dialog/JuralioDialog'
import WithLoader from '../../../../../../components/feedback/with-loader/WithLoader'
import { TaskItem } from '../../../../../../components/inputs/task-select/base/TaskItem'
import juralioColours from '../../../../../../theme/juralio-colours'
import Errorbox from '../../../../../../components/data-display/error-box/ErrorBox'
import { CONFIG } from '../../../../../constants'

const useStyles = makeStyles()(theme => ({
  taskItem: {
    paddingLeft: theme.spacing(),
    paddingRight: theme.spacing(3),
    minHeight: theme.spacing(3),
  },
  dropdown: {
    width: '100%',
    marginBottom: theme.spacing(5),
    marginTop: theme.spacing(3),
  },
  subTitle: {
    marginTop: theme.spacing(2),
    color: juralioColours.darkText.secondary,
  },
  title: {
    color: juralioColours.darkText.primary,
  },
}))

const TaskPostMove = props => {
  const { classes } = useStyles()
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('md'))
  const [disableDialog, setDisableDialog] = useState(false)
  const { t } = useTranslation()

  const menuOptions = {
    getContentAnchorEl: null,
    anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
    transformOrigin: { vertical: 'top', horizontal: 'center' },
    PaperProps: {
      style: {
        maxHeight: theme.spacing(20),
      },
    },
  }

  useEffect(() => {
    if (
      props.projects.length > 0 &&
      props.projects?.filter(p => p.id === props.selectedProject)[0]
        ?.postCount >= CONFIG.POSTS_LIMIT
    ) {
      setDisableDialog(true)
    } else {
      setDisableDialog(false)
    }
  }, [props.projects, props.selectedProject])

  const renderProjectPicker = () => {
    return (
      <FormControl className={classes.dropdown}>
        <InputLabel htmlFor={'projectPicker'}>
          {props.t(props.isTemplate ? 'common.template' : 'common.project')}
        </InputLabel>
        <Select
          value={props.selectedProject}
          onChange={props.handleProjectChange}
          disabled={props.projects.length < 2}
          labelId={'projectPicker'}
          MenuProps={menuOptions}
          data-test="project-selector-dropdown"
        >
          {props.projects.map(project => (
            <MenuItem key={project.id} value={project.id}>
              {project.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    )
  }
  const renderTaskPicker = () => {
    return (
      <FormControl className={classes.dropdown}>
        <InputLabel htmlFor={'taskPicker'}>{props.t('common.task')}</InputLabel>
        <Select
          value={props.selectedTask}
          onChange={props.handleTaskChange}
          labelId={'taskPicker'}
          MenuProps={menuOptions}
          data-test="task-selector-dropdown"
          //disabled={props.tasks.length < 2}
        >
          {props.tasks.map(task => (
            <MenuItem
              className={classes.taskItem}
              value={task.id}
              key={task.id}
            >
              <TaskItem item={task} index={task.id} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    )
  }

  const Content = WithLoader(200)(() => (
    <div>
      {renderProjectPicker()}
      {renderTaskPicker()}
      {disableDialog && (
        <Errorbox
          error={t('postArchive.restoreDialog.maxPosts')}
          padding={true}
        />
      )}
    </div>
  ))

  const getTitle = () => (
    <div>
      <Typography
        variant="h5"
        data-test="move-post-title"
        className={classes.title}
      >
        {props.t('postMove.title', { title: props.post.name })}
      </Typography>

      <Typography variant="caption" className={classes.subTitle}>
        {props.t('postMove.newDestination')}
      </Typography>
    </div>
  )

  return (
    <JuralioDialog
      open={true}
      titleText={getTitle()}
      handleCancel={props.closeHandler}
      actionLabel={props.t('postMove.move')}
      handleAction={props.onSubmit}
      onClose={props.closeHandler}
      fullScreen={isMobileView}
      disabled={!props.canSubmit || disableDialog}
    >
      <DialogContent>
        <Content isLoaded={props.isLoaded} />
      </DialogContent>
    </JuralioDialog>
  )
}

export default withTranslation()(TaskPostMove)
