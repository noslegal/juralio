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

import React from 'react'
import SettingsIcon from '@mui/icons-material/Settings'
import {
  Button,
  Card,
  CardContent,
  ClickAwayListener,
  Divider,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import rawColours from '../../../theme/raw-colours'
import colorModifiers from '../../../theme/color-modifiers'
import { makeStyles } from 'tss-react/mui'
import juralioColours from '../../../theme/juralio-colours'
import { useSelector } from 'react-redux'
import {
  LabelsIcon,
  MattersIcon,
  PeopleIcon,
} from '../../../theme/navigation/CommonIcons'
import JurCosts from '../../../assets/images/JurCostsIcon'
import OrganisationAvatar from '../../../admin/organisations/common/OrganisationAvatar'

const useStyles = makeStyles()(theme => ({
  root: {
    padding: theme.spacing(0.5),
    cursor: 'pointer',
  },
  cardContainer: {
    position: 'absolute',
    left: 60,
    marginTop: theme.spacing(2),
    marginRight: theme.spacing(),
    width: theme.spacing(35),
    cursor: 'auto',
    bottom: 0,
  },
  orgDetailsContainer: {
    display: 'flex',
  },
  orgDetailsInfoContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: 'fit-content',
    margin: 'auto',
    marginLeft: theme.spacing(),
  },
  orgName: {
    fontSize: '14px',
    color: juralioColours.darkText.primary,
    whiteSpace: 'nowrap',
    width: theme.spacing(27),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    float: 'left',
    width: '100%',
  },
  divider: {
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(),
    maxWidth: 248,
  },
  menuButton: {
    justifyContent: 'flex-start',
    color: juralioColours.darkText.primary,
    textTransform: 'none',
    width: theme.spacing(31),
    fontWeight: 'unset !important',
  },
  icon: {
    fill: juralioColours.named.black[100],
  },
}))

const OrgNavButton = props => {
  const { classes } = useStyles()
  const [anchorEl, setAnchorEl] = React.useState(null)
  const { t } = useTranslation()
  const open = Boolean(anchorEl)
  const organisation = useSelector(
    state => state.organisation.selectedOrganisation
  )

  const handleOpen = event => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  return (
    <div className={classes.root}>
      <div
        style={{ margin: 'auto', width: 'fit-content' }}
        data-test={'header-org-menu-button'}
      >
        <SettingsIcon
          style={
            props.showHover === 7
              ? { fill: rawColours.status.notRequired.dark }
              : {
                  fill: colorModifiers.primaryBackground(
                    rawColours.status.notRequired.dark
                  ),
                }
          }
          onClick={handleOpen}
        />
      </div>
      {open && (
        <ClickAwayListener
          mouseEvent="onMouseDown"
          touchEvent="onTouchStart"
          onClickAway={e => setTimeout(() => handleClose(e), 200)}
        >
          <Card
            anchorEl={anchorEl}
            className={classes.cardContainer}
            data-test="user-header-dropdown-menu"
          >
            <CardContent className={classes.cardContent}>
              <div className={classes.orgDetailsContainer}>
                <OrganisationAvatar organisation={organisation} />
                <div
                  className={classes.orgDetailsInfoContainer}
                  data-test="user-header-user-info-section"
                >
                  <Typography className={classes.orgName}>
                    {organisation.name}
                  </Typography>
                </div>
              </div>
              <Divider className={classes.divider} />
              <Button
                fullWidth={true}
                className={classes.menuButton}
                component={Link}
                to={'/organisation/accounts'}
                onClick={handleClose}
                startIcon={<PeopleIcon className={classes.icon} />}
                data-test={'header-org-accounts-button'}
              >
                {t('navigationLinks.accounts')}
              </Button>
              <Button
                fullWidth={true}
                className={classes.menuButton}
                component={Link}
                to={'/organisation/matters'}
                onClick={handleClose}
                startIcon={<MattersIcon className={classes.icon} />}
                data-test="header-org-matters-button"
              >
                {t('navigationLinks.matters')}
              </Button>
              <Button
                fullWidth={true}
                className={classes.menuButton}
                component={Link}
                to={'/organisation/labels'}
                onClick={handleClose}
                startIcon={<LabelsIcon className={classes.icon} />}
                data-test="header-org-labels-button"
              >
                {t('navigationLinks.labels')}
              </Button>
              <Button
                fullWidth={true}
                className={classes.menuButton}
                onClick={handleClose}
                component={Link}
                startIcon={<SettingsIcon className={classes.icon} />}
                to={'/organisation/settings'}
                data-test="header-org-settings-button"
              >
                {t('navigationLinks.setting')}
              </Button>
              {props.costsEnabled && (
                <Button
                  fullWidth={true}
                  className={classes.menuButton}
                  onClick={handleClose}
                  component={Link}
                  startIcon={
                    <JurCosts
                      colour={rawColours.primary.black[200]}
                      className={classes.icon}
                      style={{ paddingLeft: 2 }}
                    />
                  }
                  to={'/organisation/costs'}
                  data-test="header-org-costs-button"
                >
                  {t('navigationLinks.costs')}
                </Button>
              )}
            </CardContent>
          </Card>
        </ClickAwayListener>
      )}
    </div>
  )
}
export default OrgNavButton
