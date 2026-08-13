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

import { Button, ButtonGroup, Tooltip } from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import {
  getMatterIdFromLocation,
  getMatterOverviewUrl,
  getProjectIdFromLocation,
} from '../../common/location-context-helper'
import rawColours from '../../../../theme/raw-colours'
import juralioColours from '../../../../theme/juralio-colours'
import {
  LabelsIcon,
  PeopleIcon,
} from '../../../../theme/navigation/CommonIcons'
import JurSummary from '../../../../assets/images/JurSummary'
import JurWorkstream from '../../../../assets/images/JurWorkstream'
import ArchiveIcon from '@mui/icons-material/Inventory'
import HistoryIcon from '@mui/icons-material/History'
import ShortcutIcon from '@mui/icons-material/Shortcut'
import { useSelector } from 'react-redux'

const styles = makeStyles()(theme => ({
  button: {
    borderColor: '#D0D5DD',
    height: theme.spacing(4),
    padding: '5px 10px',
    textTransform: 'none',
    color: juralioColours.darkText.secondary,
    '&:hover': {
      color: rawColours.primary.grey.main,
      backgroundColor: rawColours.primary.black[200],
    },
  },
  returnOverviewButton: {
    transform: 'scaleX(-1)',
  },
}))

const AdminSubHeader = props => {
  const { classes } = styles()
  const history = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const [isHover, setIsHover] = useState(false)
  const [selectedItem, setSelectedItem] = useState(
    props.router?.location?.state?.tabItem
      ? props.router?.location?.state?.tabItem
      : 0
  )
  const matterDetails = useSelector(state => state.matterDetails)
  const userAuthData = useSelector(state => state.auth.data.auth)
  const team = useSelector(state => state.matterTeam.mainPage.team)
  const isEditor =
    team
      .filter(t => t.teamMemberId)
      .map(x => x.user)
      .filter(user => user.username === userAuthData.username).length !== 0

  const isMatterViewer =
    team
      .filter(t => t.matterViewerId)
      .map(x => x.user)
      .filter(user => user.username === userAuthData.username).length !== 0

  const seeOverviewbutton =
    matterDetails.matter?.projects.filter(
      p => p.active && (p.isPrivateMember || !p.isPrivate)
    ).length > 0

  const showMatterOverviewLink =
    (isEditor || isMatterViewer) &&
    seeOverviewbutton &&
    matterDetails.matter.matterStatus !== 'closed' &&
    matterDetails.matter.activeWorkstreams > 0

  return (
    <div>
      <ButtonGroup>
        {showMatterOverviewLink && (
          <Tooltip title={t('navigationLinks.goToOverviewTooltip')}>
            <Button
              onMouseEnter={() => setIsHover('overview')}
              onMouseLeave={() => setIsHover(null)}
              data-test="go-to-matter-overview"
              onClick={() => {
                history(getMatterOverviewUrl(getMatterIdFromLocation(location)))
              }}
              className={classes.button}
            >
              <ShortcutIcon
                style={
                  isHover === 'overview'
                    ? {
                        fill: rawColours.primary.grey.main,
                      }
                    : {}
                }
                className={classes.returnOverviewButton}
              />
            </Button>
          </Tooltip>
        )}
        <Button
          onMouseEnter={() => setIsHover(0)}
          onMouseLeave={() => setIsHover(null)}
          variant="outlined"
          startIcon={
            <JurSummary
              colour={
                selectedItem === 0 || isHover === 0
                  ? rawColours.primary.grey.main
                  : rawColours.primary.black[200]
              }
              className={classes.icon}
            />
          }
          data-test="overview"
          style={
            selectedItem === 0
              ? {
                  backgroundColor: rawColours.primary.black[200],
                  color: rawColours.primary.grey.main,
                }
              : {}
          }
          className={classes.button}
          onClick={() => {
            setSelectedItem(0)
            history(`/matteradmin/${getMatterIdFromLocation(location)}`, {
              state: {
                tabItem: 0,
                workstreamId: getProjectIdFromLocation(location),
              },
            })
          }}
        >
          {t('navigationLinks.adminSum')}
        </Button>
        <Button
          onMouseEnter={() => setIsHover(1)}
          onMouseLeave={() => setIsHover(null)}
          variant="outlined"
          startIcon={
            <PeopleIcon
              style={
                selectedItem === 1 || isHover === 1
                  ? {
                      fill: rawColours.primary.grey.main,
                    }
                  : {}
              }
              className={classes.icon}
            />
          }
          data-test="matter-people"
          style={
            selectedItem === 1
              ? {
                  backgroundColor: rawColours.primary.black[200],
                  color: rawColours.primary.grey.main,
                }
              : {}
          }
          className={classes.button}
          onClick={() => {
            setSelectedItem(1)
            history(`/matteradmin/${getMatterIdFromLocation(location)}`, {
              state: {
                tabItem: 1,
                workstreamId: getProjectIdFromLocation(location),
              },
            })
          }}
        >
          {t('navigationLinks.people')}
        </Button>
        <Button
          onMouseEnter={() => setIsHover(2)}
          onMouseLeave={() => setIsHover(null)}
          variant="outlined"
          startIcon={
            <JurWorkstream
              colour={
                selectedItem === 2 || isHover === 2
                  ? rawColours.primary.grey.main
                  : rawColours.primary.black[200]
              }
              className={classes.icon}
            />
          }
          data-test="projects"
          style={
            selectedItem === 2
              ? {
                  backgroundColor: rawColours.primary.black[200],
                  color: rawColours.primary.grey.main,
                }
              : {}
          }
          className={classes.button}
          onClick={() => {
            setSelectedItem(2)
            history(`/matteradmin/${getMatterIdFromLocation(location)}`, {
              state: {
                tabItem: 2,
                workstreamId: getProjectIdFromLocation(location),
              },
            })
          }}
        >
          {t('navigationLinks.workstream')}
        </Button>
        <Button
          onMouseEnter={() => setIsHover(3)}
          onMouseLeave={() => setIsHover(null)}
          variant="outlined"
          startIcon={
            <ArchiveIcon
              style={
                selectedItem === 3 || isHover === 3
                  ? {
                      fill: rawColours.primary.grey.main,
                    }
                  : {}
              }
              className={classes.icon}
            />
          }
          data-test="archive"
          style={
            selectedItem === 3
              ? {
                  backgroundColor: rawColours.primary.black[200],
                  color: rawColours.primary.grey.main,
                }
              : {}
          }
          className={classes.button}
          onClick={() => {
            setSelectedItem(3)
            history(`/matteradmin/${getMatterIdFromLocation(location)}`, {
              state: {
                tabItem: 3,
                workstreamId: getProjectIdFromLocation(location),
              },
            })
          }}
        >
          {t('navigationLinks.archive')}
        </Button>
        <Button
          onMouseEnter={() => setIsHover(4)}
          onMouseLeave={() => setIsHover(null)}
          variant="outlined"
          startIcon={
            <LabelsIcon
              colour={
                selectedItem === 4 || isHover === 4
                  ? rawColours.primary.grey.main
                  : rawColours.primary.black[200]
              }
              className={classes.icon}
            />
          }
          data-test="labels"
          style={
            selectedItem === 4
              ? {
                  backgroundColor: rawColours.primary.black[200],
                  color: rawColours.primary.grey.main,
                }
              : {}
          }
          className={classes.button}
          onClick={() => {
            setSelectedItem(4)
            history(`/matteradmin/${getMatterIdFromLocation(location)}`, {
              state: {
                tabItem: 4,
                workstreamId: getProjectIdFromLocation(location),
              },
            })
          }}
        >
          {t('navigationLinks.labels')}
        </Button>
        <Button
          onMouseEnter={() => setIsHover(5)}
          onMouseLeave={() => setIsHover(null)}
          variant="outlined"
          startIcon={
            <HistoryIcon
              style={
                selectedItem === 5 || isHover === 5
                  ? {
                      fill: rawColours.primary.grey.main,
                    }
                  : {}
              }
              className={classes.icon}
            />
          }
          data-test="history"
          style={
            selectedItem === 5
              ? {
                  backgroundColor: rawColours.primary.black[200],
                  color: rawColours.primary.grey.main,
                }
              : {}
          }
          className={classes.button}
          onClick={() => {
            setSelectedItem(5)
            history(`/matteradmin/${getMatterIdFromLocation(location)}`, {
              state: {
                tabItem: 5,
                workstreamId: getProjectIdFromLocation(location),
              },
            })
          }}
        >
          {t('navigationLinks.history')}
        </Button>
      </ButtonGroup>
    </div>
  )
}

export default AdminSubHeader
