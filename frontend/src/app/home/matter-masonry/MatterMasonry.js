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

import { Avatar, Button, Paper, Tooltip, Typography } from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import { getMatterOverviewUrl } from '../../../components/navigation/common/location-context-helper'
import WorkstreamChip from '../../../components/navigation/global-header/matter-switcher/WorkstreamChip'
import colorModifiers from '../../../theme/color-modifiers'
import juralioColours from '../../../theme/juralio-colours'
import { MattersIcon } from '../../../theme/navigation/CommonIcons'
import rawColours from '../../../theme/raw-colours'
import { setMatterDetails } from '../../matter-details/matter-details-actions'
import { ACTIVITIES } from '../../constants'
import SettingsIcon from '@mui/icons-material/Settings'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import JurCosts from '../../../assets/images/JurCostsIcon'
import JurFullAccess from '../../../assets/images/JurFullAccess'
import JurViewAdmin from '../../../assets/images/JurViewAdmin'

const style = makeStyles()(theme => ({
  column: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '60%',
  },
  titleWrapper: {
    display: 'flex',
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    width: `calc(100% - ${theme.spacing(4)})`,
    overflowX: 'hidden',
  },
  titleWrapperNoHover: {
    display: 'flex',
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    width: `calc(100% - ${theme.spacing(4)})`,
    overflowX: 'hidden',
  },
  avatar: {
    marginRight: theme.spacing(),
    width: theme.spacing(4),
    height: theme.spacing(4),
    color: rawColours.primary.white.primary,
    background: rawColours.primary.blue.dark,
    fontWeight: 400,
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  matterRefNumberWrapper: {
    display: 'flex',
    flexDirection: 'row',
    marginLeft: 'auto',
    whiteSpace: 'nowrap',
    height: 'auto',
    alignItems: 'center',
    overflowX: 'hidden',
    marginBottom: 'auto',
    color: colorModifiers.secondaryText(rawColours.text.black),
  },
  clientName: {
    display: 'flex',
    color: colorModifiers.secondaryText(rawColours.text.black),
    overflow: 'hidden',
    fontSize: theme.spacing(1.5),
    whiteSpace: 'nowrap',
  },
  clientNamePart: {
    flexShrink: 0,
  },
  departmentPart: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flexShrink: 1,
  },
  matterName: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    color: rawColours.text.black,
    textOverflow: 'ellipsis',
    fontSize: theme.spacing(2),
    lineHeight: '150%',
  },
  refNumber: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  content: {
    height: 'fit-content',
  },
  matterIcon: {
    width: theme.spacing(2),
    height: theme.spacing(2),
    marginRight: theme.spacing(0.5),
    color: colorModifiers.secondaryText(rawColours.text.black),
  },
  seeMoreButton: {
    backgroundColor: rawColours.primary.white.primary,
    '&:hover': {
      backgroundColor: juralioColours.matterSwitcher.workstreamChip.hover,
    },
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(),
  },
  seeMoreText: {
    textTransform: 'none',
    color: rawColours.primary.primary.main,
  },
  seeMoreWrapper: {
    width: '100%',
    display: 'flex',
  },
  workstreamCard: {
    width: '95%',
    backgroundColor: 'white',
    borderRadius: theme.spacing(2.5),
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  paper: {
    cursor: 'pointer',
    backgroundColor: rawColours.primary.blue.light,
    '&:hover': {
      backgroundColor: '#C3D0D7',
    },
  },
  paperNoHover: {
    cursor: 'pointer',
    backgroundColor: rawColours.primary.blue.light,
  },
  iconHolder: {
    display: 'flex',
    paddingTop: '4px',
  },
}))

const MasonryTitle = props => {
  const { t } = useTranslation()
  const { classes } = style()
  const matter = props.matter
  const department = matter.department
  const isTeamMember = matter?.activities.includes(
    ACTIVITIES.MATTER_TEAM_MEMBER
  )

  const isMatterViewer = matter?.activities.includes(ACTIVITIES.MATTER_VIEWER)
  const isMatterAdmin = matter?.activities.includes(ACTIVITIES.MATTER_ADMIN)
  const isMatterCosts = matter?.activities.includes(ACTIVITIES.MATTER_COSTS)

  const getRoleTooltip = () => {
    let title = ''
    if (isMatterAdmin) {
      if (isMatterViewer) {
        title = t('matterSwitcher.isMatterAdmin&Viewer')
      } else if (isTeamMember) {
        title = t('matterSwitcher.isMatterAll')
      } else {
        title = t('matterSwitcher.isMatterAdmin')
      }
    } else {
      if (isMatterViewer) {
        title = t('matterSwitcher.isMatterViewer')
      } else if (isTeamMember) {
        title = t('matterSwitcher.isMatterEditor')
      }
    }

    if (isMatterCosts) {
      title = title + ', inc costs'
    }

    return title
  }

  return (
    <div
      className={
        props.isMobile ? classes.titleWrapperNoHover : classes.titleWrapper
      }
    >
      <Avatar className={classes.avatar}>
        <Typography data-test="masonry-avatar-initals">
          {matter.name
            .split(' ')
            .map(t => t[0])
            .join('')
            .substring(0, 2)}
        </Typography>
      </Avatar>
      <div className={classes.column}>
        <Typography
          className={classes.clientName}
          data-test="masonry-client-name"
        >
          <span className={classes.clientNamePart}>{matter.clientName}</span>
          {department && (
            <>
              <span>&nbsp;|&nbsp;</span>
              <span className={classes.departmentPart}>{department}</span>
            </>
          )}
        </Typography>
        <Typography
          data-test="masonry-matter-name"
          className={classes.matterName}
        >
          {matter.name}
        </Typography>
      </div>
      <div style={{ display: 'flex', marginLeft: 'auto' }}>
        <Tooltip title={getRoleTooltip()}>
          <div className={classes.iconHolder} style={{}}>
            {isMatterCosts && (
              <div>
                <JurCosts
                  colour={colorModifiers.secondaryText(rawColours.text.black)}
                  className={classes.matterIcon}
                />
              </div>
            )}
            <div>
              {isTeamMember && !isMatterAdmin && (
                <EditIcon className={classes.matterIcon} />
              )}
              {isMatterViewer && !isTeamMember && !isMatterAdmin && (
                <VisibilityIcon className={classes.matterIcon} />
              )}
              {isMatterViewer && !isTeamMember && isMatterAdmin && (
                <JurViewAdmin
                  color={juralioColours.darkText.secondary}
                  className={classes.matterIcon}
                />
              )}
              {isMatterAdmin && isTeamMember && (
                <JurFullAccess
                  size={'small'}
                  color={juralioColours.darkText.secondary}
                />
              )}
              {isMatterAdmin && !isTeamMember && !isMatterViewer && (
                <SettingsIcon className={classes.matterIcon} />
              )}
            </div>
          </div>
        </Tooltip>
        {matter.userDefinedReferenceNumber && (
          <Tooltip
            title={`${t('entity.matterNumber')} ${
              matter.userDefinedReferenceNumber
            }`}
          >
            <div className={classes.matterRefNumberWrapper}>
              <MattersIcon className={classes.matterIcon} />
              <Typography
                variant="subtitle2"
                className={classes.refNumber}
                data-test="masonry-reference-number"
              >
                {matter.userDefinedReferenceNumber}
              </Typography>
            </div>
          </Tooltip>
        )}
      </div>
    </div>
  )
}

const MatterMasonry = props => {
  const { classes } = style()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [projectCountLimit, setProjectCountLimit] = useState(4)
  const [isHovering, setIsHovering] = useState(false)
  const [doubleHoverCheck, setDoubleHoverCheck] = useState(0)
  const history = useNavigate()

  //the data structure is different depending on what route it is called from, this smoothes it out into  a unified structure
  if (props.matter.projects.items && !props.matter.projects.isLoaded) {
    return null
  }
  const projects = props.matter.projects.items
    ? props.matter.projects.items
    : props.matter.projects

  if (Object.keys(projects).includes('isLoaded') && !projects.isLoaded) {
    return null
  }

  return (
    // 'Class'es required for layout.
    <div class="item" data-test="masonry-item">
      <div className={classes.content} class="content">
        <Paper
          className={doubleHoverCheck ? classes.paperNoHover : classes.paper}
          onClick={() => {
            if (!props.isMobile) {
              dispatch(setMatterDetails(props.matter))
              history(getMatterOverviewUrl(props.matter.id))
            }
          }}
          onMouseEnter={() => {
            projects.length === 1 && setIsHovering(true)
          }}
          onMouseLeave={() => {
            setIsHovering(false)
          }}
        >
          <MasonryTitle
            matter={props.matter}
            isMobile={props.isMobile}
            forceHover={isHovering}
          />
          {projects.slice(0, projectCountLimit).map((project, i) => (
            <div
              onMouseEnter={() => setDoubleHoverCheck(1)}
              onMouseLeave={() => setDoubleHoverCheck(0)}
              className={classes.workstreamCard}
              key={i}
            >
              <WorkstreamChip
                forceHover={isHovering}
                workstream={project}
                matter={props.matter}
                isDefaultWorkstream={
                  projects.length === 1 && project.isPrivate === false
                }
                handleRedirect={() => {}}
                isExpanded={false}
                handleMouseOver={() => {}}
                handleMouseLeave={() => {}}
                showGoToText={false}
                masonry={true}
                addAdditionalPadding={
                  (i === projectCountLimit - 1 &&
                    !projects.length > projectCountLimit) ||
                  i === projects.length - 1
                }
              />
            </div>
          ))}
          {projects.length > projectCountLimit && (
            <div className={classes.seeMoreWrapper}>
              <Button
                className={classes.seeMoreButton}
                onClick={e => {
                  e.stopPropagation()
                  setProjectCountLimit(projects.length)
                  setTimeout(() => {
                    props.resizeMasonry()
                  }, 100) //need to wait for the rerender to allow us to manage the grid
                }}
                data-test="see-more-projects"
              >
                <Typography className={classes.seeMoreText}>
                  {t('common.seeMore')}
                </Typography>
              </Button>
            </div>
          )}
          <div style={{ paddingBottom: '5px' }} />
        </Paper>
      </div>
    </div>
  )
}

export default MatterMasonry
