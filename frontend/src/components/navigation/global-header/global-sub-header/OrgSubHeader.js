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

import { Button } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import rawColours from '../../../../theme/raw-colours'
import { isOrgOwner } from '../../../../services/user/helper/user-role-service'
import { useSelector } from 'react-redux'
import {
  LabelsIcon,
  MattersIcon,
  PeopleIcon,
} from '../../../../theme/navigation/CommonIcons'
import JurCosts from '../../../../assets/images/JurCostsIcon'
import SettingsIcon from '@mui/icons-material/Settings'

const styles = makeStyles()(theme => ({
  button: {
    borderRadius: '0px 0px 0px 0px',
    borderColor: '#D0D5DD',
    height: theme.spacing(4),
    textTransform: 'none',
    color: rawColours.primary.black[200],
    '&:hover': {
      color: rawColours.primary.grey.main,
      backgroundColor: rawColours.primary.black[200],
      borderColor: '#D0D5DD',
    },
  },
  icon: {
    fill: rawColours.primary.black[200],
  },
}))

const OrgSubHeader = props => {
  const { classes } = styles()
  const history = useNavigate()
  const { t } = useTranslation()
  const userAuthData = useSelector(state => state.auth.data.auth)
  const instanceSettings = useSelector(state => state.instanceSettings)
  const organisation = useSelector(
    state => state.organisation.selectedOrganisation
  )
  let orgTabItem = parseInt(sessionStorage.getItem('orgTabItem'))
  const [selectedItem, setSelectedItem] = useState(orgTabItem)
  const [isHover, setIsHover] = useState(0)

  useEffect(() => {
    //eslint-disable-next-line
    orgTabItem = parseInt(sessionStorage.getItem('orgTabItem'))
    setSelectedItem(orgTabItem)
  }, [orgTabItem])

  const isCurrentUserOrgOwner = isOrgOwner(userAuthData)

  const isUserConfirmationEnabled =
    instanceSettings.settings.enableUserConfirmation
  const isCostsEnabled =
    instanceSettings.settings?.costsEnabled && organisation?.costsEnabled
  const userReportTab = isCostsEnabled ? 5 : 4

  return (
    <div style={{ marginTop: 8 }}>
      <Button
        onMouseEnter={() => setIsHover(0)}
        onMouseLeave={() => setIsHover(null)}
        variant="outlined"
        startIcon={
          <PeopleIcon
            style={
              selectedItem === 0 || isHover === 0
                ? {
                    fill: rawColours.primary.grey.main,
                  }
                : {}
            }
            className={classes.icon}
          />
        }
        data-test="accounts"
        style={
          selectedItem === 0
            ? {
                backgroundColor: rawColours.primary.black[200],
                color: rawColours.primary.grey.main,
                borderRadius: '5px 0px 0px 5px',
              }
            : { borderRadius: '5px 0px 0px 5px' }
        }
        className={classes.button}
        onClick={() => {
          setSelectedItem(0)
          history(`/organisation/accounts`)
        }}
      >
        {t('navigationLinks.accounts')}
      </Button>
      <Button
        variant="outlined"
        onMouseEnter={() => setIsHover(1)}
        onMouseLeave={() => setIsHover(null)}
        startIcon={
          <MattersIcon
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
        data-test="matters"
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
          history(`/organisation/matters`)
        }}
      >
        {t('navigationLinks.matters')}
      </Button>
      <Button
        onMouseEnter={() => setIsHover(2)}
        onMouseLeave={() => setIsHover(null)}
        variant="outlined"
        startIcon={
          <LabelsIcon
            style={
              selectedItem === 2 || isHover === 2
                ? {
                    fill: rawColours.primary.grey.main,
                  }
                : {}
            }
            className={classes.icon}
          />
        }
        data-test="labels"
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
          history(`/organisation/labels`)
        }}
      >
        {t('navigationLinks.labels')}
      </Button>
      <Button
        onMouseEnter={() => setIsHover(3)}
        onMouseLeave={() => setIsHover(null)}
        variant="outlined"
        startIcon={
          <SettingsIcon
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
        data-test="settings"
        style={
          selectedItem === 3 && !isCostsEnabled
            ? {
                backgroundColor: rawColours.primary.black[200],
                color: rawColours.primary.grey.main,
                borderRadius: '0px 5px 5px 0px',
              }
            : selectedItem === 3 && isCostsEnabled
              ? {
                  backgroundColor: rawColours.primary.black[200],
                  color: rawColours.primary.grey.main,
                }
              : {}
        }
        className={classes.button}
        onClick={() => {
          setSelectedItem(3)
          history(`/organisation/settings`)
        }}
      >
        {t('navigationLinks.setting')}
      </Button>

      {isCostsEnabled && (
        <Button
          onMouseEnter={() => setIsHover(4)}
          onMouseLeave={() => setIsHover(null)}
          variant="outlined"
          startIcon={
            <JurCosts
              className={classes.icon}
              colour={
                selectedItem === 4 || isHover === 4
                  ? rawColours.primary.grey.main
                  : rawColours.primary.black[200]
              }
            />
          }
          data-test="costs"
          style={
            selectedItem === 4
              ? {
                  backgroundColor: rawColours.primary.black[200],
                  color: rawColours.primary.grey.main,
                  borderRadius: '0px 5px 5px 0px',
                }
              : {
                  borderRadius: '0px 5px 5px 0px',
                }
          }
          className={classes.button}
          onClick={() => {
            setSelectedItem(4)
            history(`/organisation/costs`)
          }}
        >
          {t('navigationLinks.costs')}
        </Button>
      )}

      {isUserConfirmationEnabled && isCurrentUserOrgOwner && (
        <Button
          onMouseEnter={() => setIsHover(6)}
          onMouseLeave={() => setIsHover(null)}
          variant="outlined"
          data-test="confirmationReports"
          style={
            selectedItem === userReportTab || isHover === 6
              ? {
                  backgroundColor: rawColours.primary.black[200],
                  color: rawColours.primary.grey.main,
                  borderRadius: '0px 5px 5px 0px',
                }
              : { borderRadius: '0px 5px 5px 0px' }
          }
          className={classes.button}
          onClick={() => {
            setSelectedItem(userReportTab)
            history(`/organisation/reports`)
          }}
        >
          {t('navigationLinks.userReports')}
        </Button>
      )}
    </div>
  )
}

export default OrgSubHeader
