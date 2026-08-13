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

import { Chip, Tooltip, Typography, useMediaQuery } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import { useNavigate } from 'react-router-dom'
import juralioColours from '../../../../theme/juralio-colours'
import juralioTheme from '../../../../theme/juralio-theme'
import { getMatterOverviewUrl } from '../../common/location-context-helper'
import GlobalHeaderWorkstreamSwitcher from '../GlobalHeaderWorkstreamSwitcher'
import { useUserPosition } from '../../../../hooks/user-hooks'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { useRef } from 'react'

const style = makeStyles()(theme => ({
  titleContent: {
    minWidth: '280px',
    color: juralioColours.darkText.primary,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    '&:hover': {
      width: '100%',
      transition: 'all .2s linear',
    },
    display: 'flex',
    alignItems: 'center',
    marginTop: '-4px',
    maxWidth: '475px',
  },
  hiddenTitleContent: {
    paddingRight: theme.spacing(1),
    width: '0px',
    visibility: 'hidden',
    transition: 'all .2s ease',
  },
  breadcrumb: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    color: juralioColours.darkText.secondary,
    maxWidth: theme.spacing(100),
  },
  breadcrumbWrapper: {
    display: 'flex',
    lineHeight: '22px',
    marginTop: theme.spacing(0.25),
    cursor: 'pointer',
  },
  draftChip: {
    backgroundColor: juralioColours.taskStatus.notRequired,
    color: juralioColours.whiteText.primary,
    marginTop: theme.spacing(0.5),
    marginRight: theme.spacing(2),
    borderRadius: theme.spacing(0.75),
  },
  divider: {
    borderLeft: 'solid 1px',
    borderColor: juralioColours.darkText.secondary,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  breadcrumbTypography: {
    fontSize: '14px',
  },
  inlineFlex: {
    display: 'inline-flex',
  },
  inlineFlexClickable: {
    display: 'inline-flex',
    cursor: 'pointer',
  },
  smallScreenWrapper: {
    width: '480px',
  },
}))

const CurrentMatterTemplateTitle = props => {
  const anchorEl = useRef()
  const { t } = useTranslation()
  const { classes } = style()
  const history = useNavigate()
  const [isInTemplate, setIsInTemplate] = useState(false)
  const [isInMatterSettings, setIsInMatterSettings] = useState(false)
  const [isInWorkstream, setIsInWorkstream] = useState(false)
  const [showOverviewMenu, setShowOverviewMenu] = useState(false)
  const projectNum = useSelector(
    state => state.matterDetails?.matter?.numProjects
  )
  const matter = useSelector(state => state.matterDetails)
  const matterTeam = useSelector(state => state.matterTeam.mainPage.team)
  const auth = useSelector(state => state.auth)
  const currentUser = auth.data.details
  const isTeamMember =
    matterTeam.filter(t => t.user.id === currentUser.id)[0]?.teamMemberId > 0
  const isTeamViewer =
    matterTeam.filter(t => t.user.id === currentUser.id)[0]?.matterViewerId > 0

  const matterName = useSelector(state => state.matterDetails?.matter?.name)
  const template = useSelector(state => state.template?.template)
  const project = useSelector(state => state.project)
  const projectOverview = useSelector(
    state => state.project?.workstreamOverview
  )

  const { isClient } = useUserPosition(matter.matter)
  const clientName = useSelector(
    state => state.matterDetails?.matter?.clientName
  )
  const departmentName = useSelector(
    state => state.matterDetails?.matter?.department
  )

  const clientDepartmentTitle =
    isClient && departmentName ? departmentName : isClient ? '' : clientName
  const isSmallScreen = useMediaQuery(juralioTheme.breakpoints.down('lg'))
  const showWorkstreamSwitcher =
    !isInTemplate &&
    matter?.matter?.projects?.length > 1 &&
    (isTeamMember || isTeamViewer)

  useEffect(() => {
    setShowOverviewMenu(false)
    if (window.location.href.includes('/template/')) {
      setIsInTemplate(true)
    } else {
      setIsInTemplate(false)
    }

    if (
      window.location.href.includes('/matters/') ||
      window.location.href.includes('/how-to-use') ||
      window.location.href.includes('/matteradmin/') ||
      (window.location.href.includes('/taskmap') && projectNum === 1) ||
      (window.location.href.includes('/roadmap') && projectNum === 1) ||
      (!window.location.href.includes('/workstream') &&
        window.location.href.includes('/overview'))
    ) {
      setIsInMatterSettings(true)
    } else {
      setIsInMatterSettings(false)
    }
    if (
      window.location.href.includes('/workstream/') &&
      window.location.href.includes('/matter/') &&
      (project.isLoaded || project.workstreamOverview) &&
      projectNum > 1
    ) {
      setIsInWorkstream(true)
    } else if (window.location.href.includes('/matter')) {
      setIsInMatterSettings(true)
      setIsInWorkstream(false)
    } else {
      setIsInWorkstream(false)
      setIsInMatterSettings(false)
    }
  }, [props.location, projectNum, projectOverview]) //eslint-disable-line

  if (isInTemplate) {
    return (
      <div
        className={
          props.isFocused ? classes.hiddenTitleContent : classes.titleContent
        }
      >
        {!template.published && (
          <Chip
            size="small"
            className={classes.draftChip}
            label={t('common.draft')}
          ></Chip>
        )}
        <div className={classes.breadcrumbWrapper} data-test="bread-wrapper">
          <Typography
            className={`${classes.breadcrumb} ${classes.breadcrumbTypography}`}
            variant="h6"
            data-test="bread1"
          >
            {template.name}
          </Typography>
        </div>
      </div>
    )
  } else if (isInMatterSettings) {
    return (
      <>
        <div
          className={
            props.isFocused ? classes.hiddenTitleContent : classes.titleContent
          }
        >
          <div
            onClick={() => {
              setShowOverviewMenu(true)
            }}
            className={classes.breadcrumbWrapper}
            data-test="workstream-switcher-button"
          >
            <Typography
              className={`${classes.breadcrumb} ${classes.breadcrumbTypography}`}
              variant="h6"
              data-test="bread1"
            >
              <div className={classes.inlineFlex}>
                {clientDepartmentTitle}
                {clientDepartmentTitle !== '' && (
                  <div className={classes.divider} />
                )}
                {matterName}
              </div>
            </Typography>
            <div ref={anchorEl}>
              {showWorkstreamSwitcher && (
                <>
                  <ArrowDropDownIcon />
                  <GlobalHeaderWorkstreamSwitcher
                    showOverviewMenu={showOverviewMenu}
                    setShowOverviewMenu={setShowOverviewMenu}
                    anchorEl={anchorEl}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </>
    )
  } else if (isInWorkstream) {
    return (
      <div>
        <div
          className={
            props.isFocused ? classes.hiddenTitleContent : classes.titleContent
          }
        >
          <div
            className={`${classes.breadcrumbWrapper} ${
              isSmallScreen ? classes.smallScreenWrapper : ''
            }`}
            data-test="workstream-switcher-button"
            onClick={() => setShowOverviewMenu(true)}
          >
            <Typography
              className={`${classes.breadcrumb} ${classes.breadcrumbTypography}`}
              variant="h6"
              data-test="bread1"
            >
              <div className={classes.inlineFlex}>
                {clientDepartmentTitle}
                <div className={classes.divider} />
                <Tooltip title={t('matterSelector.goToMatterOverview')}>
                  <div
                    className={classes.inlineFlexClickable}
                    onClick={() =>
                      history(getMatterOverviewUrl(props.matterId))
                    }
                  >
                    {matterName}
                    <div className={classes.divider} />
                  </div>
                </Tooltip>
                {project?.name ? project.name : projectOverview?.name}
              </div>
            </Typography>
            <div ref={anchorEl}>
              {showWorkstreamSwitcher && (
                <>
                  <ArrowDropDownIcon />
                  <GlobalHeaderWorkstreamSwitcher
                    showOverviewMenu={showOverviewMenu}
                    setShowOverviewMenu={setShowOverviewMenu}
                    anchorEl={anchorEl}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  } else {
    return <div></div>
  }
}
export default CurrentMatterTemplateTitle
