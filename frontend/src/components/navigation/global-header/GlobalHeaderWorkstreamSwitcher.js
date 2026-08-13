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

import {
  ClickAwayListener,
  Divider,
  MenuItem,
  MenuList,
  Popover,
  Typography,
} from '@mui/material'
import classNames from 'classnames'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import JurMatter from '../../../assets/images/JurMatter'
import rawColours from '../../../theme/raw-colours'
import { useLocation, useNavigate } from 'react-router'
import {
  getMatterAdminUrl,
  getMatterCostsLink,
  getOverviewUrl,
  getTaskMapUrl,
  locationContextHelper,
} from '../common/location-context-helper'
import { useSelector } from 'react-redux'
import juralioColours from '../../../theme/juralio-colours'
import JurWorkstream from '../../../assets/images/JurWorkstream'
import colorModifiers from '../../../theme/color-modifiers'
import JurCosts from '../../../assets/images/JurCostsIcon'
import SettingsIcon from '@mui/icons-material/Settings'
import { ACTIVITIES } from '../../../app/constants'

const style = makeStyles()(theme => ({
  lozenge: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: colorModifiers.rowOpacity(rawColours.text.black),
    borderRadius: theme.spacing(0.5),
    marginRight: theme.spacing(),
    height: theme.spacing(3),
    alignItems: 'center',
    cursor: 'pointer',
  },
  workstreamIcon: {
    color: colorModifiers.primaryText(rawColours.primary.black[200]),
    marginLeft: theme.spacing(0.5),
    height: theme.spacing(2),
    width: theme.spacing(2),
  },
  refNumber: {
    marginRight: theme.spacing(0.5),
    marginLeft: theme.spacing(0.5),
    color: colorModifiers.primaryText(rawColours.primary.black[200]),
    fontSize: theme.spacing(1.5),
  },
  menuOption: {
    textTransform: 'capitalize',
  },
  menuOptionActive: {
    color: rawColours.primary.grey.main,
    backgroundColor: rawColours.primary.black[200],
  },
  lozengeSelected: {
    backgroundColor: juralioColours.whiteText.secondary,
  },
  menuList: {
    maxHeight: theme.spacing(34.375),
    overflowY: 'auto',
  },
  menuIcon: {
    marginRight: theme.spacing(1),
  },
  costsIconWrapper: {
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(1),
  },
  workstreamName: {
    maxWidth: theme.spacing(31.25),
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
}))

const GlobalHeaderWorkstreamSwitcher = props => {
  const { showOverviewMenu, setShowOverviewMenu, anchorEl } = props
  const location = useLocation()
  const history = useNavigate()

  const { classes } = style()
  const { t } = useTranslation()

  const matter = useSelector(state => state.matterDetails)
  const matterId = locationContextHelper.getMatterIdFromLocation(location)
  const workstreamId = locationContextHelper.getProjectIdFromLocation(location)
  const matterOverviewLink =
    locationContextHelper.getMatterOverviewUrl(matterId)
  const matterAdminLink = getMatterAdminUrl(matterId)
  const matterCostsLink = getMatterCostsLink(matterId)
  const hasMatterCostsAccess = matter?.matter?.activities?.includes(
    ACTIVITIES.MATTER_COSTS
  )

  const lozenge = (workstream, selected) => {
    return (
      <div
        className={classNames(classes.lozenge, {
          [classes.lozengeSelected]: selected,
        })}
      >
        <JurWorkstream className={classes.workstreamIcon} />
        <Typography variant="body2" className={classes.refNumber}>
          {workstream.referenceNumber.slice(1)}
        </Typography>
      </div>
    )
  }

  return (
    <div>
      <Popover
        data-test="overview-switcher"
        open={showOverviewMenu}
        anchorEl={anchorEl.current}
        onClose={() => setShowOverviewMenu(false)}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClick={() => {
          setShowOverviewMenu(false)
        }}
      >
        <ClickAwayListener
          onClickAway={() => {
            setShowOverviewMenu(false)
          }}
        >
          <MenuList className={classes.menuList}>
            <MenuItem
              data-test="go-to-matter-overview"
              className={classNames(classes.menuOption, {
                [classes.menuOptionActive]:
                  !location.pathname.includes('/workstream') &&
                  location.pathname.includes('/overview'),
              })}
              onClick={() => {
                setShowOverviewMenu(false)
                history(matterOverviewLink)
              }}
            >
              <JurMatter className={classes.menuIcon} />
              <Typography variant="caption">
                {t('navigationLinks.matterOverview')}
              </Typography>
            </MenuItem>
            <MenuItem
              data-test="go-to-matter-admin"
              className={classNames(classes.menuOption, {
                [classes.menuOptionActive]:
                  location.pathname.includes('/matteradmin'),
              })}
              onClick={() => {
                setShowOverviewMenu(false)
                history(matterAdminLink)
              }}
            >
              <SettingsIcon className={classes.menuIcon} />
              <Typography variant="caption">
                {t('navigationLinks.matterAdmin')}
              </Typography>
            </MenuItem>
            {hasMatterCostsAccess && (
              <MenuItem
                data-test="go-to-matter-costs"
                className={classNames(classes.menuOption, {
                  [classes.menuOptionActive]:
                    location.pathname.includes('/costs'),
                })}
                onClick={() => {
                  setShowOverviewMenu(false)
                  history(matterCostsLink)
                }}
              >
                <div className={classes.costsIconWrapper}>
                  <JurCosts
                    colour={
                      location.pathname.includes('/costs')
                        ? rawColours.primary.grey.main
                        : 'black'
                    }
                  />
                </div>
                <Typography variant="caption">
                  {t('navigationLinks.costs')}
                </Typography>
              </MenuItem>
            )}
            <Divider />
            {matter?.matter?.projects
              ?.sort((a, b) => a.id - b.id)

              ?.map(workstream => {
                const selected = parseInt(workstreamId) === workstream.id
                if (
                  (workstream.active && !workstream.isPrivate) ||
                  (workstream.active &&
                    workstream.isPrivate &&
                    workstream.isPrivateMember)
                ) {
                  return (
                    <MenuItem
                      key={workstream.id}
                      data-test="workstream-button"
                      className={classNames(classes.menuOption, {
                        [classes.menuOptionActive]: selected,
                      })}
                      onClick={() => {
                        setShowOverviewMenu(false)
                        if (location.pathname.includes('/workstream')) {
                          if (location.pathname.includes('/task')) {
                            history(
                              getTaskMapUrl(null, matterId, workstream.id)
                            )
                          } else {
                            window.location.href = window.location.href.replace(
                              workstreamId,
                              workstream.id
                            )
                          }
                        } else {
                          history(getOverviewUrl(matterId, workstream.id))
                        }
                      }}
                    >
                      {lozenge(workstream, selected)}
                      <Typography
                        className={classes.workstreamName}
                        variant="caption"
                      >
                        {workstream.name}
                      </Typography>
                    </MenuItem>
                  )
                }
              })}
          </MenuList>
        </ClickAwayListener>
      </Popover>
    </div>
  )
}

export default GlobalHeaderWorkstreamSwitcher
