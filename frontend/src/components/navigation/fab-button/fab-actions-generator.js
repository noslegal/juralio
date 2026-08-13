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

import PersonAddIcon from '@mui/icons-material/PersonAdd'
import React from 'react'
import { FAB_CONTEXT, USER_ROLES } from '../../../app/constants'
import {
  AddFromTemplate,
  CreateTaskIcon,
  MattersIcon,
  PostAddIcon,
  TaskIcon,
  TemplatesIcon,
} from '../../../theme/navigation/CommonIcons'
import {
  checkActionsForKnowledgeManagers,
  checkActionsForSysAdmin,
  checkActionsForUsers,
} from './fab-action-context-helper'

import FabActionItem from './FabActionItem'

const generateFabActions = (
  showDialog,
  location,
  user,
  isMobile,
  showSubMenu,
  isMilestone,
  isViewOnly
) => {
  const CREATE_A_MATTER_TEXT_ID = 'matter'
  const CREATE_A_TASK_TEXT_ID = 'task'
  const actions = [
    {
      icon: MattersIcon,
      context: FAB_CONTEXT.GLOBAL_CONTEXT,
      nameTextId: 'matter',
      dataTest: 'create-matter-button',
      onClick: showDialog('CREATE_NEW_MATTER_FLOW'),
    },
    {
      icon: MattersIcon,
      context: FAB_CONTEXT.ORG_ADMIN_CONTEXT,
      nameTextId: 'matter',
      dataTest: 'create-matter-button',
      onClick: showDialog('CREATE_NEW_MATTER_FLOW'),
    },
    {
      icon: TemplatesIcon,
      context: FAB_CONTEXT.TEMPLATE_LIST_CONTEXT,
      nameTextId: 'template',
      dataTest: 'create-template-flow-dialog-button',
      onClick: showDialog('CREATE_TEMPLATE_FLOW'),
    },
    {
      icon: AddFromTemplate,
      context: FAB_CONTEXT.TASK_FROM_TEMPLATE_CONTEXT,
      nameTextId: 'task-from-template',
      dataTest: 'create-task-from-template-button',
      onClick: showDialog('CREATE_TASK_FROM_TEMPLATE_FLOW'),
    },
    {
      icon: CreateTaskIcon,
      context: FAB_CONTEXT.PROJECT_CONTEXT,
      nameTextId: 'task',
      dataTest: 'create-task-button',
      onClick: showDialog('CREATE_TASK_FLOW'),
    },
    {
      icon: TaskIcon,
      context: FAB_CONTEXT.SYS_ADMIN_CONTEXT,
      nameTextId: 'organisation',
      dataTest: 'create-organisation-button',
      onClick: showDialog('CREATE_ORGANISATION_FLOW'),
    },
    {
      icon: TaskIcon,
      context: FAB_CONTEXT.TEMPLATE_CONTEXT,
      nameTextId: 'task',
      dataTest: 'create-template-task-button',
      onClick: showDialog('CREATE_TEMPLATE_TASK_FLOW'),
    },
    {
      icon: PostAddIcon,
      context: FAB_CONTEXT.PROJECT_CONTEXT,
      nameTextId: 'post',
      dataTest: 'create-post-fab-button',
      onClick: ref => showSubMenu(ref),
    },

    {
      icon: PostAddIcon,
      context: FAB_CONTEXT.TEMPLATE_CONTEXT,
      nameTextId: 'post',
      dataTest: 'create-post-fab-button',
      onClick: ref => showSubMenu(ref),
    },
    {
      icon: PersonAddIcon,
      context: FAB_CONTEXT.SYS_ADMIN_CONTEXT,
      nameTextId: 'user',
      dataTest: 'create-user-flow-dialog-button',
      onClick: showDialog('CREATE_USER_FLOW'),
    },
  ]

  const validContextForAction = (action, location) => {
    if (user.roles?.includes(USER_ROLES.ROLE_SYS_ADMIN)) {
      return checkActionsForSysAdmin(action.context)
    } else if (user.roles.includes(USER_ROLES.ROLE_KNOWLEDGE_MANAGER)) {
      return checkActionsForKnowledgeManagers(action.context, location)
    } else {
      return checkActionsForUsers(action.context, location)
    }
  }

  const renderAction = action => {
    //Allow matters to be created outside of home context
    let locations = ['/home', '/matteradmin', '/organisation']
    const hasSubOptions = action.nameTextId === 'post'
    if (!validContextForAction(action, location)) return
    if (
      action.nameTextId === CREATE_A_MATTER_TEXT_ID &&
      (!user.roles.includes('ROLE_MATTER_CREATOR') ||
        !locations.some(location => document.location.href.includes(location)))
    )
      return
    if (action.nameTextId === CREATE_A_TASK_TEXT_ID && isMilestone) {
      return
    }
    return (
      <FabActionItem
        key={`action-${action.nameTextId}`}
        action={action}
        mobile={isMobile}
        disabled={
          user.roles.includes('FROZEN_ORG_USER') ||
          (isViewOnly && action.nameTextId === 'task-from-template')
        }
        hasSubMenu={hasSubOptions}
      />
    )
  }

  return actions.map(renderAction)
}

export default generateFabActions
