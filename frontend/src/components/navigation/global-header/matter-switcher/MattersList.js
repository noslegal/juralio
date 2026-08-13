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

import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import SettingsIcon from '@mui/icons-material/Settings'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { Divider, Paper, Tooltip, Typography } from '@mui/material'
import Skeleton from '@mui/material/Skeleton'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import { ACTIVITIES } from '../../../../app/constants'
import zeroStateImage from '../../../../assets/images/MartenWalkLeft.png'
import withRouter from '../../../../services/navigation/WithRouter'
import colorModifiers from '../../../../theme/color-modifiers'
import juralioColours from '../../../../theme/juralio-colours'
import { MattersIcon } from '../../../../theme/navigation/CommonIcons'
import rawColours from '../../../../theme/raw-colours'
import SimpleChip from '../../../data-display/simple-chip/SimpleChip'
import { getMatterOverviewUrl } from '../../common/location-context-helper'
import JurCosts from '../../../../assets/images/JurCostsIcon'
import JurFullAccess from '../../../../assets/images/JurFullAccess'
import JurViewAdmin from '../../../../assets/images/JurViewAdmin'

const style = makeStyles()(theme => ({
  container: {
    width: '100%',
    height: '78%',
    overflowX: 'hidden',
    overflowY: 'scroll',
    position: 'absolute',
    zIndex: 2,
  },
  settingsIcon: {
    width: theme.spacing(2),
    height: theme.spacing(2),
    color: rawColours.primary.white.primary,
    marginLeft: 'auto',
  },
  skeletonContainer: {
    display: 'flex',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  skeletonCircle: {
    marginLeft: theme.spacing(2),
  },
  skeletonText: {
    height: theme.spacing(2),
    width: theme.spacing(36),
  },
  skeletonTextWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: theme.spacing(2),
  },
  skeletonTextBarRight: {
    height: theme.spacing(2),
    marginBottom: 'auto',
    width: theme.spacing(12),
    marginTop: theme.spacing(0.5),
    marginLeft: theme.spacing(2),
  },
  matterItemContainer: {
    display: 'flex',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    cursor: 'pointer',
    margin: '4px 16px',
    paddingLeft: theme.spacing(2),
    backgroundColor: colorModifiers.primaryBackground(
      rawColours.primary.matterCreateBlue.secondary
    ),
    '&:hover': {
      backgroundColor: rawColours.primary.headerColours.blue,
    },
  },
  selectedMatterContainer: {
    backgroundColor: rawColours.primary.headerColours.blue,
  },
  matterItemTextWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  matterId: {
    marginLeft: 'auto',
    marginRight: theme.spacing(0.5),
    color: rawColours.primary.white.primary,
    fontSize: theme.spacing(1.5),
  },
  matterIdName: {
    marginRight: theme.spacing(2),
    color: rawColours.primary.white.primary,
    fontSize: theme.spacing(1.5),
    fontWeight: 400,
    textAlign: 'end',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    maxWidth: theme.spacing(9),
  },
  clientName: {
    display: 'flex',
    marginRight: theme.spacing(4),
    lineHeight: '20px',
    fontSize: theme.spacing(1.5),
    maxWidth: theme.spacing(38),
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    color: rawColours.primary.white.primary,
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
  flexWrap: {
    display: 'flex',
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  matterName: {
    marginRight: theme.spacing(4),
    fontSize: theme.spacing(1.5),
    fontWeight: 500,
    maxWidth: theme.spacing(31),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: rawColours.primary.white.primary,
  },
  matterItemRHSContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: 'auto',
  },
  matterIdContainer: {
    display: 'flex',
  },
  zeroStateContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
  },
  zeroStateText: {
    margin: 'auto',
    color: juralioColours.whiteText.primary,
  },
  searchStateContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
  },
  searchStateText: {
    margin: 'auto',
    marginTop: theme.spacing(2),
  },
  searchStateWrapper: {
    paddingTop: theme.spacing(3),
  },
  matterIcon: {
    color: rawColours.primary.white.primary,
    width: '0.75em',
    height: '0.75em',
  },
  matterOverviewLink: {
    color: rawColours.primary.white.primary,
    textDecoration: 'none',
    display: 'flex',
    flexDirection: 'row',
  },
  matterOverviewLinkText: {
    color: rawColours.primary.white.primary,
    fontSize: theme.spacing(1.5),
  },
  matterOverviewArrow: {
    height: theme.spacing(2),
    marginTop: 'auto',
    marginBottom: 'auto',
    color: rawColours.primary.white.primary,
  },
  image: {
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: theme.spacing(3),
    display: 'block',
  },
}))

const loadingSkeleton = (classes, i) => {
  return (
    <div className={classes.skeletonContainer} key={'SK' + i}>
      <Skeleton
        className={classes.skeletonCircle}
        variant="circular"
        width={40}
        height={40}
        key={i + '-1'}
      />
      <div className={classes.skeletonTextWrapper} key={i + '-5'}>
        <Skeleton
          className={classes.skeletonText}
          key={i + '-2'}
          variant="text"
        />
        <Skeleton
          className={classes.skeletonText}
          key={i + '-3'}
          variant="text"
        />
      </div>
      <Skeleton
        className={classes.skeletonTextBarRight}
        key={i + '-4'}
        variant="text"
      />
    </div>
  )
}

const MatterItem = props => {
  const { t } = useTranslation()
  const department = props.matterData?.department
  const getRoleTooltip = () => {
    let title = ''
    if (props.isMatterAdmin) {
      if (props.isMatterViewer) {
        title = t('matterSwitcher.isMatterAdmin&Viewer')
      } else if (props.isTeamMember) {
        title = t('matterSwitcher.isMatterAll')
      } else {
        title = t('matterSwitcher.isMatterAdmin')
      }
    } else {
      if (props.isMatterViewer) {
        title = t('matterSwitcher.isMatterViewer')
      } else if (props.isTeamMember) {
        title = t('matterSwitcher.isMatterEditor')
      }
    }

    if (props.isMatterCosts) {
      title = title + ', inc costs'
    }

    return title
  }

  return (
    <Paper
      className={`${props.classes.matterItemContainer} ${
        props.isSelected && props.classes.selectedMatterContainer
      }`}
      onClick={props.onClick}
      key={props.id}
      data-test="matter-switcher-matter-item"
    >
      <div className={props.classes.matterItemTextWrapper}>
        <Typography
          style={{
            color: rawColours.primary.white.primary,
            marginRight: 'auto',
            marginLeft: '2px',
          }}
          className={props.classes.clientName}
          data-test="matter-item-client-name"
          variant="body2"
        >
          <span className={props.classes.clientNamePart}>{props.client}</span>
          {department && (
            <>
              <span>&nbsp;|&nbsp;</span>
              <span className={props.classes.departmentPart}>{department}</span>
            </>
          )}
        </Typography>
        <Typography
          style={{ color: rawColours.primary.white.primary }}
          className={props.classes.matterName}
          data-test="matter-item-matter-name"
          variant="subtitle2"
        >
          {props.matter}
        </Typography>
      </div>
      <div className={props.classes.matterItemRHSContainer}>
        <div className={props.classes.flexWrap}>
          <Tooltip title={getRoleTooltip()}>
            {props.isMatterCosts && (
              <JurCosts
                colour={'white'}
                className={props.classes.settingsIcon}
              />
            )}
            {props.isTeamMember && !props.isMatterAdmin && (
              <EditIcon className={props.classes.settingsIcon} />
            )}
            {props.isMatterViewer &&
              !props.isMatterAdmin &&
              !props.isTeamMember && (
                <VisibilityIcon className={props.classes.settingsIcon} />
              )}
            {props.isMatterViewer &&
              props.isMatterAdmin &&
              !props.isTeamMember && (
                <JurViewAdmin
                  color={'white'}
                  className={props.classes.settingsIcon}
                />
              )}

            {props.isMatterAdmin &&
              !props.isTeamMember &&
              !props.isMatterViewer && (
                <SettingsIcon className={props.classes.settingsIcon} />
              )}
            {props.isMatterAdmin && props.isTeamMember && (
              <JurFullAccess color="white" size={'small'} />
            )}
          </Tooltip>
          {props.id && (
            <Tooltip title={`${t('entity.matterNumber')} ${props.id}`}>
              <div className={props.classes.matterIdContainer}>
                <MattersIcon className={props.classes.matterIcon} />
                <Typography
                  className={props.classes.matterIdName}
                  data-test="matter-item-matter-reference"
                >
                  {props.id}
                </Typography>
              </div>
            </Tooltip>
          )}
        </div>
        {props.isClosed && (
          <SimpleChip
            text={t('common.closed')}
            options={{
              dataTest: 'closed-chip',
              color: rawColours.primary.white.primary,
              backgroundColor: juralioColours.taskStatus.filteredIn.done,
              minWidth: 68,
              marginRight: 16,
            }}
          />
        )}
        {!props.isClosed &&
          (props.isTeamMember || props.isMatterViewer) &&
          props.isSelected &&
          props.switcherContext &&
          props.activeWorkstreams > 0 && (
            <Link
              to={getMatterOverviewUrl(props.matterId)}
              className={props.classes.matterOverviewLink}
            >
              <Typography
                onClick={props.handleClose}
                className={props.classes.matterOverviewLinkText}
                data-test="go-to-matter-overview"
              >
                {t('matterSelector.goToMatterOverview')}
              </Typography>
              <ArrowForwardIcon className={props.classes.matterOverviewArrow} />
            </Link>
          )}
        {((props.activeWorkstreams > 1 &&
          !props.isSelected &&
          props.switcherContext) ||
          (props.activeWorkstreams > 1 && !props.switcherContext)) && (
          <div
            style={{
              display: 'flex',
              marginRight: '16px',
              marginLeft: 'auto',
              color: 'white',
            }}
          >
            <Typography>{props.activeWorkstreams + ' workstreams'}</Typography>
          </div>
        )}
      </div>
    </Paper>
  )
}

const MatterList = props => {
  const { classes } = style()
  const auth = useSelector(state => state.auth)
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const getLoadingSkeleton = i => (
    <div key={'skeleton' + i}>
      {loadingSkeleton(classes, i)}
      {i < 9 && <Divider key={'d' + i} />}
    </div>
  )

  const canSeeMatters = matters => {
    matters = matters.filter(
      m =>
        m.activeWorkstreams !== null ||
        m.activities.includes(ACTIVITIES.MATTER_ADMIN)
    )
    return matters
  }

  const getMatterList = () => {
    let matters = canSeeMatters(props.matters)

    if (props.setSelectedMatterToTop && matters.length > 0) {
      const selectedMatter = matters.find(
        m => m.id === parseInt(props.router.location.pathname.split('/')[2])
      )
      matters = matters.filter(
        m => m.id !== parseInt(props.router.location.pathname.split('/')[2])
      )
      matters = [selectedMatter, ...matters]
    }

    return matters
      .filter(m => m !== undefined)
      .map((matter, i) => {
        return (
          <div key={matter.id}>
            <MatterItem
              isTeamMember={matter?.activities.includes(
                ACTIVITIES.MATTER_TEAM_MEMBER
              )}
              isMatterViewer={
                matter?.activities.includes(ACTIVITIES.MATTER_VIEWER) ||
                auth.data.details.roles.includes('FROZEN_ORG_USER')
              }
              isMatterAdmin={matter?.activities.includes(
                ACTIVITIES.MATTER_ADMIN
              )}
              isMatterCosts={matter?.activities.includes(
                ACTIVITIES.MATTER_COSTS
              )}
              classes={classes}
              matterData={matter}
              client={matter?.clientName}
              matter={matter?.name}
              id={matter.userDefinedReferenceNumber}
              isSelected={matter.id === props.selectedMatterId}
              onClick={() => {
                props.onClick(matter.id)
              }}
              matterId={matter.id}
              isClosed={matter.matterStatus === 'closed'}
              handleClose={props.handleClose}
              activeWorkstreams={matter.activeWorkstreams}
              switcherContext={props.switcherContext}
            />
            {i < props.matters.length - 1 && <Divider />}
          </div>
        )
      })
  }

  const getZeroState = () => {
    return (
      <div style={{ paddingTop: '240px' }}>
        <div className={classes.zeroStateContainer}>
          <Typography
            className={classes.zeroStateText}
            data-test="zero-state-text-1"
          >
            {t('projectSelector.noMatters')}
          </Typography>
        </div>
        {!props.showClosed && (
          <div className={classes.zeroStateContainer}>
            <Typography
              className={classes.zeroStateText}
              data-test="zero-state-text-2"
            >
              {t('projectSelector.noMatters2')}
            </Typography>
          </div>
        )}
        <img
          width={300}
          height={160}
          src={zeroStateImage}
          alt={'Pine marten walking left'}
          data-test="zero-state-image"
          className={classes.image}
        />
      </div>
    )
  }

  const getSearchState = () => {
    return (
      <div className={classes.searchStateWrapper}>
        <div className={classes.searchStateContainer}>
          <Typography className={classes.searchStateText}>
            {t('projectSelector.searching')}
          </Typography>
        </div>
        <img
          width={300}
          height={160}
          src={zeroStateImage}
          alt={'Pine marten walking left'}
          data-test="zero-state-image"
          className={classes.image}
        />
      </div>
    )
  }

  const getLazyLoadingState = () => {
    return getLoadingSkeleton()
  }

  const skeletonCount = window.innerHeight / 60

  return (
    <div
      className={classes.container}
      style={props.switcherContext ? {} : { position: 'relative' }}
      onScroll={props.onScroll}
      data-test="matter-switcher-matter-list"
    >
      {!props.isLoaded &&
        Array(Math.floor(skeletonCount))
          .fill(1)
          .map((_, i) => getLoadingSkeleton(i))}
      {props.isLoaded && getMatterList()}
      {props.isLoaded && props.isLazyLoading && getLazyLoadingState()}
      {props.isLoaded &&
        !props.isLazyLoading &&
        !props.searchInProgress &&
        props.matters.length === 0 &&
        getZeroState()}
      {props.isLoaded &&
        !props.isLazyLoading &&
        props.searchInProgress &&
        props.matters.length === 0 &&
        getSearchState()}
    </div>
  )
}

export default withRouter(MatterList)
