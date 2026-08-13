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

import { createTheme } from '@mui/material'
import {
  getStatusColour,
  getStatusColourLight,
  getStatusColourSelected,
} from '../../services/helpers/task/task-status-colour-helper'
import { getLevelATaskCount } from '../../services/helpers/task/task-util-helper'
import { getTaskByIdFromTree } from '../../services/task/data-provider/task-list-data-provider'
import juralioColours from '../../theme/juralio-colours'
import { JuralioCoreColors } from '../../theme/juralio-core-colors'
import { JuralioNamedColours } from '../../theme/juralio-named-colours'
import { CONFIG, TASK_MAP_LEVELS } from '../constants'

export const getTaskColour = item => {
  if (item.status) return getStatusColour(item.status)
  if (item.referenceNumber !== undefined && !item.matter) {
    return JuralioNamedColours.purple[300]
  }
}

export const getTaskColourLight = item => {
  if (item.status) return getStatusColourLight(item.status)
  if (item.referenceNumber !== undefined && !item.matter) {
    return JuralioNamedColours.purple[100]
  }
}

export const getTaskColourSelected = item => {
  if (item.status) return getStatusColourSelected(item.status)
  if (item.referenceNumber && !item.matter) {
    return juralioColours.taskStatusSelected.template
  }
}

export const mobilePostDetailsDrawerTheme = createTheme({
  components: {
    MuiDrawer: {
      paper: {
        width: '100%',
        overflow: 'hidden',
      },
    },
  },
  palette: {
    primary: {
      main: JuralioCoreColors.primary.main,
    },
  },
})

export const taskDetailsStyle = theme => ({
  layout: {
    position: 'absolute',
    top: theme.spacing(1.5),
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    overflow: 'hidden',
  },
  mobileTaskDetails: {
    marginTop: theme.spacing(7),
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  mobileTaskDetailsInner: {
    flex: 1,
    backgroundColor: juralioColours.whiteText.secondary,
    paddingBottom: theme.spacing(8),
  },
  mobileSubTaskPanel: {
    height: 'auto',
  },
  mobileLayout: {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflowY: 'auto',
  },
  subTaskPanel: {
    minWidth: '30%',
    overflowY: 'auto',
  },
  navigationColumn: {
    width: theme.spacing(45),
    minWidth: theme.spacing(45),
    [theme.breakpoints.down('md')]: {
      marginTop: 0,
      padding: 0,
      width: '100%',
    },
    display: 'flex',
    flexDirection: 'column',

    marginTop: theme.spacing(1),
  },
  referenceDetails: {
    flex: '0 0 auto',
    marginTop: theme.spacing(1) / 2,
    paddingLeft: theme.spacing(2),
    paddingTop: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      marginTop: 0,
    },
    display: 'flex',
    flexDirection: 'row',
    width: 'calc(100% -' + theme.spacing(2) + 'px)',
    alignItems: 'center',
  },
  referenceNumber: {
    color: juralioColours.darkText.secondary,
    paddingLeft: theme.spacing(1),
  },
  paperStyle: {
    position: 'relative',
    height: '100%',
    borderRadius: 0,
    backgroundColor: juralioColours.paper.background,
    marginTop: theme.spacing(5.5),
  },
  createSubTaskContainer: {
    paddingLeft: theme.spacing(3),
  },
  subTaskTitle: {
    paddingTop: theme.spacing(3),
  },
})

export const isMobileView = () => {
  return false //IsWidthDown('sm', props.width)
}

export const handleInvalidSubtaskCreationContexts = (
  t,
  cancelHandler,
  parentTask,
  displaySnackbar
) => {
  if (parentTask.level === TASK_MAP_LEVELS.F) {
    displaySnackbar(t('taskCreation.validation.levelFTasksCannotHaveSubTasks'))
    cancelHandler()
  } else if (parentTask?.tasks.length === CONFIG.SUBTASK_LIMIT) {
    displaySnackbar(
      t('taskCreation.validation.tasksCannotHaveMoreThanLimitubtasks', {
        limit: CONFIG.SUBTASK_LIMIT,
      })
    )
    cancelHandler()
  }
}

export const doesParentHaveCapacityToCopy = (task, project) => {
  if (task.level === 1) {
    return getLevelATaskCount(project) !== CONFIG.LEVEL_A_TASK_LIMIT
  }
  const parentTask = getTaskByIdFromTree(project, task.parent.id)
  return parentTask?.tasks.length !== CONFIG.SUBTASK_LIMIT
}

export const checkTaskCopyPreconditions = (
  task,
  tree,
  denyALevelTaskCopy,
  denyTaskCopy,
  cancelHandler
) => {
  const taskCopyable = doesParentHaveCapacityToCopy(task, tree)
  if (!taskCopyable) {
    task.level === 1 ? denyALevelTaskCopy() : denyTaskCopy()
    cancelHandler()
  }
}
