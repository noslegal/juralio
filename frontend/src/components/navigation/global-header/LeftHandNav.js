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

import { Grow, Typography } from '@mui/material'
import { withStyles } from 'tss-react/mui'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import MatterSwitcherContainer from './matter-switcher/MatterSwitcherContainer'
import TemplateSwitcherContainer from './template-switcher/TemplateSwitcherContainer'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import rawColours from '../../../theme/raw-colours'
import juralioColours from '../../../theme/juralio-colours'
import withRouter from '../../../services/navigation/WithRouter'
import NavHeaderIcon from '../NavHeaderIcon'
import GlobalNotificationsButton from '../global-notifications/GlobalNotificationsButton'
import UserHeaderButton from '../user-menu/UserHeaderButton'
import OrgNavButton from './OrgNavButton'
import NavFab from '../fab-button/NavFab'

const styles = theme => ({
  navbar: {
    display: 'block',
    backgroundColor: juralioColours.globalHeader.background,
    width: '80px',
    height: '100%',
    zIndex: theme.zIndex.appBar,
  },
  globalHeaderWithSubHeader: {
    height: theme.spacing(16.5),
    position: 'relative',
    zIndex: theme.zIndex.appBar,
    backgroundColor: rawColours.primary.grey.main,
    border: '1px solid',
  },
  globalHeaderContent: {
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  globalHeaderLeftComponent: {
    display: 'flex',
    height: '-webkit-fill-available',
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(1.5),
  },
  navWrapper: {
    left: 16,
    display: 'block',
    width: 'fit-content',
    marginLeft: 'auto',
    marginRight: 'auto',
  },

  globalButtonWrapper: {
    position: 'absolute',
    bottom: 8,
    left: 20,
    display: 'block',
    width: 'fit-content',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  globalHeaderLeftIconWrapper: {
    marginTop: 'auto',
    marginBottom: 'auto',
    textAlignLast: 'center',
    paddingTop: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
    paddingLeft: theme.spacing(1.5),
  },
  globalHeaderLeftIcon: {
    marginTop: theme.spacing(1.5),
  },
  homeIcon: { marginLeft: '-32px', marginTop: '-12px' },
  nav: {},
  navLabel: {
    color: rawColours.primary.grey[200],
    marginLeft: 'auto',
    marginRight: 'auto',
    width: 'fit-content',
    display: 'block',
  },
  iconWrapper: {
    height: 'fit-content',
    width: 'fit-content',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
})

const LeftHandNav = props => {
  const { classes, router, isSysAdmin, isOrgAdmin, user, setShowFab, showFab } =
    props
  let location = router.location
  const { t } = useTranslation()
  const [showHover, setShowHover] = useState(0)
  const templateSelectionMode = useSelector(
    state => state.template.selectionMode
  )
  const projectSelctionMode = useSelector(state => state.project.selectionMode)
  const instanceSettings = useSelector(state => state.instanceSettings)

  return (
    <>
      {!isSysAdmin && (
        <div className={classes.navbar}>
          <div
            className={classes.globalHeaderContent}
            style={
              templateSelectionMode || projectSelctionMode
                ? { visibility: 'collapse' }
                : {}
            }
          >
            <div className={classes.globalHeaderLeftIconWrapper}>
              <div
                data-test="home"
                onMouseEnter={() => setShowHover(1)}
                onMouseLeave={() => setShowHover(0)}
              >
                <Link to="/home">
                  <NavHeaderIcon />
                </Link>
                <Grow in={showHover === 1}>
                  <Typography variant="caption" className={classes.navLabel}>
                    {t('navigationLinks.home')}
                  </Typography>
                </Grow>
              </div>
              <div
                data-test="matter-switcher-button"
                className={classes.globalHeaderLeftIcon}
                onMouseEnter={() => setShowHover(2)}
                onMouseLeave={() => setShowHover(0)}
              >
                <MatterSwitcherContainer
                  showFab={setShowFab}
                  showHover={showHover}
                />
                <Grow in={showHover === 2}>
                  <Typography variant="caption" className={classes.navLabel}>
                    {t('navigationLinks.matters')}
                  </Typography>
                </Grow>
              </div>
              <div
                data-test="template-switcher-button"
                onMouseEnter={() => setShowHover(3)}
                onMouseLeave={() => setShowHover(0)}
                className={classes.globalHeaderLeftIcon}
              >
                <TemplateSwitcherContainer
                  showFab={setShowFab}
                  showHover={showHover}
                />
                <Grow in={showHover === 3}>
                  <Typography variant="caption" className={classes.navLabel}>
                    {t('navigationLinks.templates')}
                  </Typography>
                </Grow>
              </div>
            </div>
            <div className={classes.globalButtonWrapper}>
              {showFab && (
                <div className={classes.navWrapper}>
                  <NavFab mobile={false} />{' '}
                </div>
              )}
              <div
                onMouseEnter={() => setShowHover(6)}
                onMouseLeave={() => setShowHover(0)}
                className={classes.iconWrapper}
              >
                <GlobalNotificationsButton showHover={showHover} />
              </div>
              {isOrgAdmin && (
                <div
                  onMouseEnter={() => setShowHover(7)}
                  onMouseLeave={() => setShowHover(0)}
                >
                  <OrgNavButton
                    costsEnabled={instanceSettings.settings?.costsEnabled}
                    showHover={showHover}
                  />
                </div>
              )}

              <UserHeaderButton user={user} isOrgAdmin={isOrgAdmin} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
export default withRouter(withStyles(LeftHandNav, styles))
