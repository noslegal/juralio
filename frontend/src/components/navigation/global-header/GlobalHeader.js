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

import { useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { withStyles } from 'tss-react/mui'
import withRouter from '../../../services/navigation/WithRouter'
import juralioColours from '../../../theme/juralio-colours'
import { SignOutIcon } from '../../../theme/navigation/CommonIcons'
import Divider from '../common/Divider'
import GlobalSubHeader from './global-sub-header/GlobalSubHeader'
import GlobalHeaderButton from './GlobalHeaderButton'
import GlobalHeaderTitle from './GlobalHeaderTitle'
import CurrentMatterTemplateTitle from './matter-switcher/CurrentMatterTemplateTitle'
import MatterSwitcherContainer from './matter-switcher/MatterSwitcherContainer'
import SearchContainer from '../search/SearchContainer'
import { useNavigate } from 'react-router-dom'
import rawColours from '../../../theme/raw-colours'
import AdminSubHeader from './global-sub-header/AdminSubHeader'
import OrgSubHeader from './global-sub-header/OrgSubHeader'
import { getMatterIdFromLocation } from '../common/location-context-helper'
import { renderUseTemplateButton } from './global-sub-header/global-sub-header-helpers'
import GlobalSubHeaderOptionsDropdown from '../global-header/global-sub-header/GlobalSubHeaderOptionsDropdown'

const styles = theme => ({
  globalHeader: {
    height: theme.spacing(10.5),
    position: 'relative',
    zIndex: '1000',
    backgroundColor: rawColours.primary.grey.main,
    boxShadow: `0px 2px 2px 0px ${juralioColours.move.shadow}`,
    borderBottom: '1px solid',
  },
  globalHeaderWithSubHeader: {
    height: theme.spacing(10.5),
    position: 'relative',
    zIndex: '1000',
    backgroundColor: rawColours.primary.grey.main,
    border: '1px solid',
  },
  globalHeaderContent: {
    padding: theme.spacing(1),
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  globalHeaderLeftComponent: {
    display: 'flex',
    height: '-webkit-fill-available',
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(1.5),
  },
  globalButtonWrapper: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  globalHeaderLeftIconWrapper: {
    marginTop: 'auto',
    marginBottom: 'auto',
    display: 'flex',
    textAlignLast: 'center',
    paddingTop: theme.spacing(1.5),
    paddingRight: theme.spacing(2),
  },
  globalHeaderLeftIcon: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: theme.spacing(5),
  },
  homeIcon: { marginLeft: '-32px', marginTop: '-12px' },
})

const validSubHeaderLocations = [
  '/timeline',
  '/roadmap',
  '/taskmap',
  '/overview',
  '/task/',
  '/improvedTaskmap',
  '/costs',
  '/taskList',
]

const GlobalHeader = props => {
  const { classes, router, isSysAdmin, isOrgAdmin, user, showFab } = props
  let location = router.location
  const { t } = useTranslation()
  const history = useNavigate()
  const [isSearchToggled, setIsSearchToggled] = useState(false)
  const [showHover, setShowHover] = useState(0)
  const [willRenderSubHeader, setWillRenderSubHeader] = useState(true)
  const [isFocused, setFocus] = useState(false)
  const [showGlobalTitle, setShowGlobalTitle] = useState(null)
  const [globalCaption, setGlobalCaption] = useState(false)
  const selectionMode = useSelector(state => state.template.selectionMode)
  const theme = useTheme()

  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isTemplate = location.pathname.includes('/template')
  const isOverview = location.pathname.includes('/overview')
  const isTaskMap =
    location.pathname.includes('/taskmap') ||
    location.pathname.includes('/improvedTaskmap')
  const templateHasLoaded = useSelector(state => state.template.isLoaded)

  const getTitleAndSubtitle = () => {
    if (location.pathname.includes('/home')) {
      setShowGlobalTitle(true)
      setGlobalCaption(t('globalHeader.welcome'))
    } else if (location.pathname.includes('/templates')) {
      setShowGlobalTitle(true)
      setGlobalCaption(t('globalHeader.template'))
    } else if (location.pathname.includes('/organisation')) {
      setShowGlobalTitle(true)
      setGlobalCaption(t('globalHeader.orgAdmin'))
    } else if (location.pathname.includes('/organisation/costs')) {
      setShowGlobalTitle(true)
      setGlobalCaption(t('globalHeader.costs'))
    } else {
      setShowGlobalTitle(false)
      setGlobalCaption('')
    }
  }

  useEffect(() => {
    const isValidPath =
      validSubHeaderLocations.filter(s => location.pathname.includes(s))
        .length > 0

    if (!isValidPath || isMobile || selectionMode || isSearchToggled) {
      setWillRenderSubHeader(false)
    } else {
      setWillRenderSubHeader(true)
    }
    getTitleAndSubtitle()
  }, [isMobile, location, selectionMode, isSearchToggled]) //eslint-disable-line

  const shouldRenderProjectSelector = !isSysAdmin

  return isSysAdmin ? (
    <div className={classes.globalHeader} data-test="global-header">
      <div className={classes.globalHeaderContent}>
        {/* <NavHeaderIcon /> */}
        {shouldRenderProjectSelector && <MatterSwitcherContainer />}
        <GlobalHeaderTitle
          isSysAdmin={isSysAdmin}
          title={'System Administrator'}
        />
        <Divider />
        <GlobalHeaderButton
          tool="Logout"
          meta="logout"
          location={location.pathname}
          icon={SignOutIcon}
          href={'/logout'}
        />
      </div>
    </div>
  ) : (
    <div
      className={
        willRenderSubHeader
          ? classes.globalHeaderWithSubHeader
          : classes.globalHeader
      }
      data-test="global-header"
    >
      <div className={classes.globalHeaderContent}>
        <div>
          <div
            style={
              !isFocused
                ? {
                    display: 'flex',
                  }
                : {
                    display: 'flex',
                    marginTop: '-32px',
                  }
            }
          >
            {!isFocused && !showGlobalTitle && (
              <CurrentMatterTemplateTitle
                location={location.pathname}
                isFocused={isFocused}
                matterId={getMatterIdFromLocation(location)}
              />
            )}

            {showGlobalTitle && !isSearchToggled && (
              <GlobalHeaderTitle
                isSysAdmin={false}
                caption={globalCaption}
                flipped={showGlobalTitle}
              />
            )}
          </div>
          {willRenderSubHeader &&
            !isSearchToggled &&
            !location.pathname.includes('/matteradmin') &&
            !location.pathname.includes('/organisation') && (
              <GlobalSubHeader isMobile={false} />
            )}
          {!isSearchToggled && location.pathname.includes('/matteradmin') && (
            <AdminSubHeader router={router} />
          )}
          {!isSearchToggled &&
            isOrgAdmin &&
            location.pathname.includes('/organisation') &&
            !location.pathname.includes('Costs') && (
              <OrgSubHeader router={router} />
            )}
        </div>
        {isTemplate && !isSearchToggled && (
          <div
            style={{
              alignContent: 'center',
              //borderLeft: '1px solid grey',
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <>
              {!window.location.href.includes('templates') &&
                renderUseTemplateButton(templateHasLoaded, classes)}
              {isTemplate && (isOverview || isTaskMap) && (
                <GlobalSubHeaderOptionsDropdown isTemplate={isTemplate} />
              )}
            </>
          </div>
        )}
        <div
          style={
            isSearchToggled
              ? { width: '100%' }
              : !isTemplate
                ? { marginLeft: 'auto' }
                : {}
          }
        >
          <SearchContainer
            showHover={showHover}
            setShowHover={setShowHover}
            setFocus={setFocus}
            setIsSearchToggled={setIsSearchToggled}
          />
        </div>
      </div>
    </div>
  )
}

export default withRouter(withStyles(GlobalHeader, styles))
