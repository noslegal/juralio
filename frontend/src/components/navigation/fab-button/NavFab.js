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

import AddIcon from '@mui/icons-material/Add'
import { Fab, Tooltip } from '@mui/material'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import { JuralioNamedColours } from '../../../theme/juralio-named-colours'
import FabActionsContainer from './FabActionsContainer'
import { USER_ROLES } from '../../../app/constants'
import { useLocation } from 'react-router'
import { useSelector } from 'react-redux'
import rawColours from '../../../theme/raw-colours'
import colorModifiers from '../../../theme/color-modifiers'
import {
  isInMatter,
  isInTemplate,
  isInTemplateGallery,
} from '../common/location-context-helper'
import juralioColours from '../../../theme/juralio-colours'
export const buttonHeight = 56

const styles = makeStyles()(theme => ({
  fabButton: {
    zIndex: theme.zIndex.drawer - 10,
    backgroundColor: rawColours.status.notRequired.dark,
    width: buttonHeight,
    height: buttonHeight,
    borderRadius: buttonHeight / 2,
    color: JuralioNamedColours.black[200],
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    justifyContent: 'flex-start',
    overflow: 'hidden',
    paddingLeft: 3,
    '&:hover': {
      backgroundColor: colorModifiers.primaryBackground(
        rawColours.status.notRequired.dark
      ),
    },
    display: 'flex',
  },
  fabButtonDrawerOpen: {
    width: 192,
  },
  desktopFabButton: {
    borderRadius: 5,
    boxShadow: 'none',
    marginBottom: '8px',
    width: 30,
    height: 30,
    minHeight: 30,
  },
  sysadminFabButton: {
    position: 'absolute !important',
    left: theme.spacing(4),
    bottom: theme.spacing(4),
  },
  mobileFabButton: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}))
const NavFab = props => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const { classes } = styles()
  const fabRef = useRef()
  const location = useLocation()
  const userRoles = useSelector(state => state.auth.data.auth?.roles)
  const taskmapInteractions = useSelector(
    state => state.improvedTaskmapInteractions
  )
  const isKnowledgeManager = userRoles.includes(
    USER_ROLES.ROLE_KNOWLEDGE_MANAGER
  )
  const isMatterCreator = userRoles.includes(USER_ROLES.ROLE_MATTER_CREATOR)
  const [disabled, setDisabled] = useState(false)
  const [tooltipText, setTooltipText] = useState()
  const [showFab, setShowFab] = useState(true)

  const getFabButtonClassName = () => {
    return classNames(classes.fabButton, {
      [classes.mobileFabButton]: props.mobile,
      [classes.desktopFabButton]: !props.mobile,
      [classes.sysadminFabButton]: props.inSysadmin,
      [classes.fabButtonDrawerOpen]: props.drawerOpen,
    })
  }

  useEffect(() => {
    if (location.pathname.includes('/template') && !isKnowledgeManager) {
      setDisabled(true)
      setTooltipText(t('templates.onlyKMCanEdit'))
    } else if (
      location.pathname.includes('/organisation') &&
      !isMatterCreator
    ) {
      setDisabled(true)
      setTooltipText(t('organisation.noOptionsForCurrentRoles'))
    } else {
      setDisabled(false)
      setTooltipText(null)
    }
    if (taskmapInteractions.rename) {
      setShowFab(false)
    } else {
      setShowFab(true)
    }
    if (location.pathname.includes('/organisation/costs')) {
      setShowFab(false)
    }
    if (location.pathname.includes('/costs')) {
      setShowFab(false)
    }
  }, [
    isKnowledgeManager,
    isMatterCreator,
    location.pathname,
    t,
    taskmapInteractions.rename,
  ])

  const handleClick = () => {
    if (!disabled) {
      setOpen(!open)
    }
  }

  const handleClose = () => {
    setOpen(false)
  }
  return (
    <>
      {showFab && (
        <Tooltip
          title={tooltipText}
          disableHoverListener={tooltipText === null}
          disableFocusListener={tooltipText === null}
          data-test="fab-empty-tooltip"
        >
          <Fab
            className={getFabButtonClassName()}
            onClick={handleClick}
            data-test="fab-button"
            size="small"
            style={
              disabled
                ? { opacity: '0.4' }
                : isInMatter(window.location.href)
                  ? {
                      backgroundColor: rawColours.primary.primary.main,
                      color: juralioColours.whiteText.primary,
                    }
                  : isInTemplate(window.location.href) ||
                      isInTemplateGallery(window.location.href)
                    ? { backgroundColor: rawColours.status.template.light }
                    : {}
            }
            ref={fabRef}
          >
            <AddIcon />
          </Fab>
        </Tooltip>
      )}

      <FabActionsContainer
        open={open}
        mobile={props.mobile}
        closeHandler={handleClose}
        anchor={fabRef?.current}
      />
    </>
  )
}

NavFab.propTypes = {
  mobile: PropTypes.bool,
}

export default NavFab
