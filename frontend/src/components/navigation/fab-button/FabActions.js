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

import { Menu } from '@mui/material'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { withStyles } from 'tss-react/mui'
import MatterCreateContainer from '../../../app/matter-create/MatterCreateContainer'
import { isMobileView } from '../../../app/task-details/TaskCardCommon'
import juralioFABExpandedSVG from '../../../assets/images/juralio-fab-expanded.svg'
import juralioTheme from '../../../theme/juralio-theme'
import CreateMilestoneFlowContainer from '../../flows/create-milestone-flow/CreateMilestoneFlowContainer'
import CreateNoteFlowContainer from '../../flows/create-note-flow/CreateNoteFlowContainer'
import CreateOrganisationFlowContainer from '../../flows/create-organisation-flow/CreateOrganisationFlowContainer'
import CreateTaskFlowContainer from '../../flows/create-task-flow/CreateTaskFlowContainer'
import CreateTemplateFlowContainer from '../../flows/create-template-flow/CreateTemplateFlowContainer'
import CreateTemplateMilestoneFlowContainer from '../../flows/create-template-milestone-flow/CreateTemplateMilestoneFlowContainer'
import CreateTemplateNoteFlowContainer from '../../flows/create-template-note-flow/CreateTemplateNoteFlowContainer'
import CreateTemplateTaskFlowContainer from '../../flows/create-template-task-flow/CreateTemplateTaskFlowContainer'
import CreateUserFlowContainer from '../../flows/create-user-flow/CreateUserFlowContainer'
import { triggerResetDialog } from '../common/dialog-triggers/dialog-trigger-actions'
import generateFabActions from './fab-actions-generator'
import SubMenu from './subMenu/SubMenu'
import CreateTaskFromTemplateFlowContainer from '../../flows/create-task-flow/CreateTaskFromTemplateFlowContainer'
import { useIsViewOnly } from '../../../hooks/matter/viewer/matter-viewer-hooks'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'

const styles = theme => ({
  actionsGroup: {
    position: 'absolute',
    minWidth: theme.spacing(32),
    zIndex: theme.zIndex.modal,
    background: `url(${juralioFABExpandedSVG})`,
    backgroundColor: theme.palette.common.white,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'left bottom',
    display: 'flex',
    flexDirection: 'column',
  },
  desktopActionsGroup: {
    bottom: theme.spacing(5),
    //right: '-16px',
    transform: 'translateX(68%)',
  },
  mobileActionsGroup: {
    right: theme.spacing(2),
    bottom: theme.spacing(2),
  },
  cantEdit: {
    color: juralioTheme.palette.text.secondary,
    marginLeft: theme.spacing(),
    marginRight: theme.spacing(),
  },
})
const FabActions = props => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const location = useLocation()
  const [CREATE_ORGANISATION_FLOW, setCreateOrganisationFlow] = useState(false)
  const [CREATE_NOTE_FLOW, setCreateNoteFlow] = useState(false)
  const [CREATE_TASK_FLOW, setCreateTaskFlow] = useState(false)
  const [CREATE_TASK_FROM_TEMPLATE_FLOW, setCreateTaskFromTemplateFlow] =
    useState(false)
  const [CREATE_TEMPLATE_FLOW, setCreateTemplateFlow] = useState(false)
  const [CREATE_TEMPLATE_TASK_FLOW, setCreateTemplateTaskFlow] = useState(false)
  const [CREATE_TEMPLATE_MILESTONE_FLOW, setCreateTemplateMilestoneFlow] =
    useState(false)
  const [CREATE_USER_FLOW, setCreateUserFlow] = useState(false)
  const [CREATE_TEMPLATE_NOTE_FLOW, setCreateTemplateNoteFlow] = useState(false)
  const [CREATE_NEW_MATTER_FLOW, setCreateNewMatterFlow] = useState(false)
  const [CREATE_MILESTONE_FLOW, setCreateMilestoneFlow] = useState(false)
  const [showSubMenu, setShowSubMenu] = useState(false)
  const [subMenuRef, setSubMenuRef] = useState(undefined)
  const [type, setType] = useState(null)

  const dialogTriggers = useSelector(state => state.dialogTriggers)
  const matter = useSelector(state => state.matterDetails.matter)

  const isTemplate = window.location.href.includes('/template')
  const { classes } = props
  const isViewOnly = useIsViewOnly(matter)

  const _showSubMenu = ref => {
    setShowSubMenu(true)
    setSubMenuRef(ref)
  }

  const showDialog = dialogName => () => {
    props.closeHandler()
    if (dialogName === 'CREATE_ORGANISATION_FLOW') {
      setCreateOrganisationFlow(true)
    } else if (dialogName === 'CREATE_NOTE_FLOW') {
      setCreateNoteFlow(true)
    } else if (dialogName === 'CREATE_TASK_FLOW') {
      setCreateTaskFlow(true)
    } else if (dialogName === 'CREATE_TASK_FROM_TEMPLATE_FLOW') {
      setCreateTaskFromTemplateFlow(true)
    } else if (dialogName === 'CREATE_TEMPLATE_FLOW') {
      setCreateTemplateFlow(true)
    } else if (dialogName === 'CREATE_TEMPLATE_TASK_FLOW') {
      setCreateTemplateTaskFlow(true)
    } else if (dialogName === 'CREATE_TEMPLATE_MILESTONE_FLOW') {
      setCreateTemplateMilestoneFlow(true)
    } else if (dialogName === 'CREATE_USER_FLOW') {
      setCreateUserFlow(true)
    } else if (dialogName === 'CREATE_TEMPLATE_NOTE_FLOW') {
      setCreateTemplateNoteFlow(true)
    } else if (dialogName === 'CREATE_NEW_MATTER_FLOW') {
      setCreateNewMatterFlow(true)
    } else if (dialogName === 'CREATE_MILESTONE_FLOW') {
      setCreateMilestoneFlow(true)
    }
  }

  const hideDialog = dialogName => () => {
    if (dialogName === 'CREATE_ORGANISATION_FLOW') {
      setCreateOrganisationFlow(false)
    } else if (dialogName === 'CREATE_NOTE_FLOW') {
      setCreateNoteFlow(false)
    } else if (dialogName === 'CREATE_TASK_FLOW') {
      setCreateTaskFlow(false)
    } else if (dialogName === 'CREATE_TASK_FROM_TEMPLATE_FLOW') {
      setCreateTaskFromTemplateFlow(false)
    } else if (dialogName === 'CREATE_TEMPLATE_FLOW') {
      setCreateTemplateFlow(false)
    } else if (dialogName === 'CREATE_TEMPLATE_TASK_FLOW') {
      setCreateTemplateTaskFlow(false)
    } else if (dialogName === 'CREATE_TEMPLATE_MILESTONE_FLOW') {
      setCreateTemplateMilestoneFlow(false)
    } else if (dialogName === 'CREATE_USER_FLOW') {
      setCreateUserFlow(false)
    } else if (dialogName === 'CREATE_TEMPLATE_NOTE_FLOW') {
      setCreateTemplateNoteFlow(false)
    } else if (dialogName === 'CREATE_NEW_MATTER_FLOW') {
      setCreateNewMatterFlow(false)
    } else if (dialogName === 'CREATE_MILESTONE_FLOW') {
      setCreateMilestoneFlow(false)
    }
    dispatch(triggerResetDialog())
    props.closeHandler()
  }

  const fabActions = generateFabActions(
    showDialog,
    location,
    props.user,
    props.mobile,
    _showSubMenu,
    props.isMilestone,
    isViewOnly
  ).filter(x => x !== undefined)

  const renderDialog = () => {
    if (CREATE_NEW_MATTER_FLOW || dialogTriggers.CREATE_NEW_MATTER_FLOW) {
      return (
        <MatterCreateContainer
          closeHandler={hideDialog('CREATE_NEW_MATTER_FLOW')}
        />
      )
    }

    if (CREATE_ORGANISATION_FLOW || dialogTriggers.CREATE_ORGANISATION_FLOW) {
      return (
        <CreateOrganisationFlowContainer
          cancelHandler={hideDialog('CREATE_ORGANISATION_FLOW')}
        />
      )
    }

    if (CREATE_MILESTONE_FLOW || dialogTriggers.CREATE_MILESTONE_FLOW) {
      return (
        <CreateMilestoneFlowContainer
          actionHandler={showDialog('DESTINATION')}
          cancelHandler={hideDialog('CREATE_MILESTONE_FLOW')}
        />
      )
    }

    if (CREATE_TASK_FLOW || dialogTriggers.CREATE_TASK_FLOW) {
      return (
        <CreateTaskFlowContainer
          actionHandler={showDialog('DESTINATION')}
          cancelHandler={hideDialog('CREATE_TASK_FLOW')}
        />
      )
    }

    if (
      CREATE_TASK_FROM_TEMPLATE_FLOW ||
      dialogTriggers.CREATE_TASK_FROM_TEMPLATE_FLOW
    ) {
      return (
        <CreateTaskFromTemplateFlowContainer
          cancelHandler={hideDialog('CREATE_TASK_FROM_TEMPLATE_FLOW')}
        />
      )
    }

    if (CREATE_NOTE_FLOW || dialogTriggers.CREATE_NOTE_FLOW) {
      return (
        <CreateNoteFlowContainer
          actionHandler={showDialog('DESTINATION')}
          cancelHandler={hideDialog('CREATE_NOTE_FLOW')}
          type={type}
        />
      )
    }

    if (CREATE_TEMPLATE_FLOW || dialogTriggers.CREATE_TEMPLATE_FLOW) {
      return (
        <CreateTemplateFlowContainer
          actionHandler={showDialog('DESTINATION')}
          cancelHandler={hideDialog('CREATE_TEMPLATE_FLOW')}
        />
      )
    }

    if (CREATE_TEMPLATE_TASK_FLOW || dialogTriggers.CREATE_TEMPLATE_TASK_FLOW) {
      return (
        <CreateTemplateTaskFlowContainer
          actionHandler={showDialog('DESTINATION')}
          cancelHandler={hideDialog('CREATE_TEMPLATE_TASK_FLOW')}
        />
      )
    }
    if (
      CREATE_TEMPLATE_MILESTONE_FLOW ||
      dialogTriggers.CREATE_TEMPLATE_MILESTONE_FLOW
    ) {
      return (
        <CreateTemplateMilestoneFlowContainer
          actionHandler={showDialog('DESTINATION')}
          cancelHandler={hideDialog('CREATE_TEMPLATE_MILESTONE_FLOW')}
        />
      )
    }

    if (CREATE_USER_FLOW) {
      return (
        <CreateUserFlowContainer
          actionHandler={showDialog('DESTINATION')}
          cancelHandler={hideDialog('CREATE_USER_FLOW')}
        />
      )
    }

    if (CREATE_TEMPLATE_NOTE_FLOW) {
      return (
        <CreateTemplateNoteFlowContainer
          actionHandler={showDialog('DESTINATION')}
          cancelHandler={hideDialog('CREATE_TEMPLATE_NOTE_FLOW')}
          type={type}
        />
      )
    }
  }

  const isMobile = isMobileView(props)
  return (
    <>
      <Menu
        open={props.open}
        keepMounted
        anchorEl={props.anchor}
        onClose={props.closeHandler}
        data-test="fab-actions"
        classes={{ paper: classes.actionsGroup }}
        style={{ left: 65 }}
        marginThreshold={8}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        // getContentAnchorEl={null}
      >
        {fabActions}
      </Menu>
      {renderDialog()}
      {showSubMenu && (
        <SubMenu
          anchor={props.anchor}
          close={() => {
            props.closeHandler()
            setShowSubMenu(false)
          }}
          style={{
            marginLeft: isMobile ? '-100px' : '200px',
            marginTop: '-20px',
            left: 65,
          }}
          select={type => {
            setType(type)
            setCreateNoteFlow(isTemplate ? false : true)
            setCreateTemplateNoteFlow(isTemplate ? true : false)
          }}
        />
      )}
    </>
  )
}

export default withStyles(FabActions, styles)
