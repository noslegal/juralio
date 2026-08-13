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
import CloseIcon from '@mui/icons-material/Close'
import InfoIcon from '@mui/icons-material/Info'
import SearchIcon from '@mui/icons-material/Search'
import {
  alpha,
  IconButton,
  InputBase,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import JurWebLink from '../../assets/images/JurWebLink'
import CardCarousel from '../../components/data-display/card-carousel/CardCarousel'
import { useIsViewOnly } from '../../hooks/matter/viewer/matter-viewer-hooks'
import {
  fetchMatterResources,
  fetchMatterWorkstreamResources,
} from '../../redux/ducks/matter-resources'
import { hasRole } from '../../services/user/helper/user-role-service'
import colorModifiers from '../../theme/color-modifiers'
import rawColours from '../../theme/raw-colours'
import { LINK_RESOURCES, USER_ROLES } from '../constants'

const style = makeStyles()(theme => ({
  root: {},
  heading: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    paddingBottom: theme.spacing(1),
    marginTop: theme.spacing(),
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
  },
  headingText: {
    paddingRight: theme.spacing(1),
    width: 'fit-content',
    whiteSpace: 'nowrap',
  },
  switchAndText: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: theme.spacing(2),
  },
  floatRight: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  floatLeft: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
  },
  searchIcon: {
    marginRight: theme.spacing(0.5),
    color: rawColours.primary.black[100],
  },
  inputRoot: {
    color: 'inherit',
  },

  closeIcon: {
    cursor: 'pointer',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '13ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
  infoIcon: {
    color: rawColours.primary.black[100],
  },
  titleIcon: {
    marginRight: theme.spacing(),
  },
  matterResources: {},
  mainResources: {
    width: '60%',
    marginRight: theme.spacing(),
    padding: theme.spacing(0.5),
  },
  secondaryResources: {
    width: 'calc(40% - 24px)',
    backgroundColor: rawColours.primary.white.secondary,
    borderRadius: theme.spacing(1),
    padding: theme.spacing(0.5),
    paddingRight: theme.spacing(0),
  },
  titleText: {
    color: colorModifiers.filterIn(rawColours.text.black),
    marginLeft: theme.spacing(),
  },
  switcher: {
    width: 'fit-content',
    whiteSpace: 'nowrap',
  },
}))

const MatterResources = props => {
  const { openAddResourceDialog } = props
  const matterDetails = useSelector(state => state.matterDetails)
  const user = useSelector(state => state.auth.data.auth)
  const isKnowledgeManager = () => {
    return hasRole(USER_ROLES.ROLE_KNOWLEDGE_MANAGER, user)
  }
  const isMatterViewer = useIsViewOnly(matterDetails.matter)
  const orgFrozen = useIsViewOnly({ activities: [] })
  const dispatch = useDispatch()
  const { classes } = style()
  const { t } = useTranslation()
  const matterResources = useSelector(state => state.matterResources)
  const workstreamResources = useSelector(state => state.workstreamResources)
  const template = useSelector(state => state.template.template)
  const [searchQuery, setSearchQuery] = useState('')
  const [showExtraResources, setShowExtraResources] = useState(false)
  const isWorkstream = props.projectId !== undefined
  const resources = props.isTemplate
    ? template
    : isWorkstream
      ? workstreamResources
      : matterResources
  const disableAdd =
    resources?.resources?.length >= LINK_RESOURCES.MAX_COUNT ||
    (props.isTemplate ? !isKnowledgeManager() || orgFrozen : isMatterViewer)

  const inactiveWorkstreams = matterDetails.matter?.projects
    .filter(project => {
      return !project.active
    })
    .map(project => project.id)

  const hasTreeRelatedResources = isWorkstream
    ? resources.hasMatterResources
    : resources.hasWorkstreamResources
  const additionalResources = isWorkstream
    ? matterResources.resources
    : matterResources.workstreamResources.filter(
        workstream => !inactiveWorkstreams.includes(workstream.workstreamId)
      )

  const handleExtraResourceToggle = () => {
    if (showExtraResources) {
      setShowExtraResources(false)
    } else {
      setShowExtraResources(true)
      if (isWorkstream) {
        dispatch(fetchMatterResources(props.matterId))
      } else {
        dispatch(fetchMatterWorkstreamResources(props.matterId))
      }
    }
  }

  useEffect(() => {
    if (isWorkstream) {
      dispatch(fetchMatterWorkstreamResources(props.matterId))
    } else {
      dispatch(fetchMatterResources(props.matterId))
    }
    //eslint-disable-next-line
  }, [])

  const getTooltip = () => {
    if (props.isTemplate) {
      if (!isKnowledgeManager()) {
        return t('templates.knowledgeManagersOnlyResources')
      } else {
        return t('templates.maxResourcesReached')
      }
    }

    return isMatterViewer
      ? t('matter.overview.linkResourceViewOnly')
      : t('matter.overview.linkResourceMaxCountReached')
  }

  return (
    <div className={classes.matterResources}>
      <div className={classes.heading}>
        <div className={classes.floatLeft}>
          <JurWebLink className={classes.titleIcon} />

          <Typography
            variant="subtitle1"
            className={classes.headingText}
            data-test="resources-title"
          >
            {props.isTemplate
              ? t('project.overview.templateResources')
              : isWorkstream
                ? t('project.overview.workstreamResources')
                : t('matter.overview.matterResources')}
          </Typography>
          {!props.isSystemTemplate && (!isMatterViewer || props.isTemplate) && (
            <>
              <Tooltip
                disableFocusListener={!disableAdd}
                disableHoverListener={!disableAdd}
                title={getTooltip()}
              >
                <span>
                  <IconButton
                    data-test="add-resource-button"
                    onClick={() => openAddResourceDialog()}
                    disabled={disableAdd}
                    size="large"
                  >
                    <AddIcon />
                  </IconButton>
                </span>
              </Tooltip>
              {resources?.resources?.length === 0 && (
                <Tooltip title={t('matter.overview.matterResourceZeroState')}>
                  <InfoIcon
                    className={classes.infoIcon}
                    data-test="info-icon"
                  />
                </Tooltip>
              )}
            </>
          )}
          {hasTreeRelatedResources && (
            <div className={classes.switchAndText}>
              <Switch
                data-test="documents-panel-switch"
                color="primary"
                checked={showExtraResources}
                onChange={handleExtraResourceToggle}
              />
              <Typography
                variant="caption"
                data-test="documents-panel-switch-status"
                className={classes.switcher}
              >
                {isWorkstream
                  ? t('project.overview.seeMatterLevelLinks')
                  : t('matter.overview.seeWorkstreamLevelLinks')}
              </Typography>
            </div>
          )}
        </div>
        <div className={classes.floatRight}>
          {resources?.resources?.length > 0 && (
            <div className={classes.search}>
              <InputBase
                startAdornment={<SearchIcon className={classes.searchIcon} />}
                placeholder={t('matter.overview.searchResources')}
                value={searchQuery}
                data-test="resource-search"
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput,
                }}
                onChange={e => {
                  setSearchQuery(e.target.value)
                }}
                inputProps={{ 'aria-label': 'search' }}
                endAdornment={
                  searchQuery.length > 1 ? (
                    <CloseIcon
                      className={classes.closeIcon}
                      onClick={() => {
                        setSearchQuery('')
                      }}
                    />
                  ) : (
                    <div style={{ width: '24px' }} />
                  )
                }
              />
            </div>
          )}
        </div>
      </div>
      <div className={classes.row}>
        <div
          className={showExtraResources ? classes.mainResources : ''}
          style={{ overflowX: 'auto' }}
        >
          {showExtraResources && (
            <Typography variant="caption" className={classes.titleText}>
              {isWorkstream
                ? t('project.overview.workstreamLevel')
                : t('matter.overview.matterLevel')}
            </Typography>
          )}

          {resources?.resources && (
            <CardCarousel
              resources={resources?.resources}
              searchQuery={searchQuery}
              viewOnly={
                props.isTemplate
                  ? !isKnowledgeManager() || props.isSystemTemplate
                  : isMatterViewer
              }
              matterId={props.matterId}
              projectId={props.projectId}
              isTemplate={props.isTemplate}
            />
          )}
        </div>
        {showExtraResources && (
          <div className={classes.secondaryResources}>
            <Typography variant="caption" className={classes.titleText}>
              {!isWorkstream
                ? t('project.overview.workstreamLevel')
                : t('matter.overview.matterLevel')}
            </Typography>
            <CardCarousel
              resources={additionalResources}
              searchQuery={searchQuery}
              viewOnly={
                props.isTemplate
                  ? !isKnowledgeManager() || props.isSystemTemplate
                  : isMatterViewer
              }
              matterId={props.matterId}
              projectId={props.projectId}
              isTemplate={props.isTemplate}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default MatterResources
