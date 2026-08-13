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

import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import OrganisationAvatar from '../../../admin/organisations/common/OrganisationAvatar'
import { getCurrentOrganisation } from '../../../admin/organisations/organisation-actions'
import OrgAdminFtue from '../../../components/data-display/ftue/org-admin/OrgAdminFtue'
import ManageOrganisationUsers from '../../../components/layouts/manage-users/organisation/ManageOrganisationUsers'
import { isOrgOwner } from '../../../services/user/helper/user-role-service'
import { getDetailsAttribute } from '../../../services/user/user-data-service'
import MattersListPanel from '../../matter-list/MattersListPanel'
import ConfirmedUserReportsContainer from './panels/confirmed-user-reports/ConfirmedUserReportsContainer'
import LabelsAdminPanelContainer from './panels/LabelsAdminPanelContainer'
import TemporaryPasswordDisplayDialog from './TemporaryPasswordDisplayDialog'
import juralioColours from '../../../theme/juralio-colours'
import rawColours from '../../../theme/raw-colours'
import SettingsPanel from './SettingsPanel'
import { Typography } from '@mui/material'
//import CostsContainer from './costs/CostsContainer'
import CostsWrapper from './costs/CostsWrapper'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  paperHeader: {
    paddingBottom: theme.spacing(1),
    borderRadius: theme.spacing(0),
    background: rawColours.primary.grey.main,
    position: 'absolute',
    top: theme.spacing(9),
    zIndex: 10000,
    left: theme.spacing(30),
  },
  paperDiv: {
    margin: theme.spacing(2.5),
    height: '100%',
  },
  paperClass: {
    padding: theme.spacing(3),
  },
  button: {
    height: 32,
    textTransform: 'none',
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
    color: juralioColours.darkText.secondary,
    '&:hover': {
      color: rawColours.primary.grey.main,
      backgroundColor: rawColours.primary.black[200],
    },
  },
  roleError: { alignSelf: 'center', marginTop: theme.spacing(16.5) },
}))

const OrganisationContainer = props => {
  const isOrgAdmin = useSelector(state =>
    state.auth?.data?.auth?.roles.includes('ROLE_ORG_ADMIN')
  )
  let listItems
  const { t } = useTranslation()

  const userAuthData = useSelector(state => state.auth.data.auth)
  const instanceSettings = useSelector(state => state.instanceSettings)
  const organisation = useSelector(
    state => state.organisation.selectedOrganisation
  )

  const isCurrentUserOrgOwner = isOrgOwner(userAuthData)
  const isCostsEnabled =
    instanceSettings.settings?.costsEnabled && organisation?.costsEnabled

  const isUserConfirmationEnabled =
    instanceSettings.settings.enableUserConfirmation
  const dispatch = useDispatch()
  const { classes } = useStyles()
  const [item, setItem] = useState(props.goTo)

  useEffect(() => {
    setItem(props.goTo)
    sessionStorage.setItem('orgTabItem', props.goTo)
  }, [props.goTo])

  useEffect(() => {
    dispatch(getCurrentOrganisation())
  }, [t, dispatch])

  listItems = {
    users: {
      number: 0,
      dataTest: 'accounts',
      prompt: organisation?.name,
      logo: (
        <OrganisationAvatar
          organisationId={organisation?.id}
          editable={false}
        />
      ),
      caption: t('organisationAdmin.caption'),
      header: t('organisationAdmin.accounts.header'),
      subtitle: t('organisationAdmin.accounts.subtitle'),
      component: <ManageOrganisationUsers organisationId={organisation?.id} />,
    },
    matters: {
      number: 1,
      dataTest: 'matters',
      prompt: organisation?.name,
      caption: t('organisationAdmin.caption'),
      header: t('organisationAdmin.matters.header'),
      subtitle: t('organisationAdmin.matters.subtitle'),
      component: <MattersListPanel organisationId={organisation?.id} />,
    },
    labels: {
      number: 2,
      dataTest: 'labels',
      prompt: organisation?.name,
      header: t('organisationAdmin.labels.header'),
      subtitle: t('organisationAdmin.labels.subtitle'),
      component: <LabelsAdminPanelContainer />,
    },
    Settings: {
      number: 3,
      dataTest: 'settings',
      prompt: organisation?.name,
      header: t('organisationAdmin.settings.header'),
      subtitle: t('organisationAdmin.settings.subtitle'),
      component: <SettingsPanel organisation={organisation} />,
    },
  }
  if (isCostsEnabled) {
    listItems.costs = {
      number: 4,
      dataTest: 'costs',
      prompt: organisation?.name,
      header: t('organisationAdmin.costs.header'),
      component: (
        <CostsWrapper router={props.router} organisationId={organisation?.id} />
        // <CostsContainer
        //   router={props.router}
        //   organisationId={organisation?.id}
        // />
      ),
    }
  }
  if (isUserConfirmationEnabled && isCurrentUserOrgOwner) {
    listItems.confirmationReports = {
      number: isCostsEnabled ? 5 : 4,
      dataTest: 'confirmationReports',
      prompt: organisation?.name,
      header: t('organisationAdmin.confirmationReports.header'),
      subtitle: t('organisationAdmin.confirmationReports.subtitle'),
      component: (
        <ConfirmedUserReportsContainer organisationId={organisation?.id} />
      ),
    }
  }

  if (isOrgAdmin) {
    return (
      <div className={classes.root}>
        {!getDetailsAttribute([
          'firstTimeUserExperience',
          'hasSeenOrgAdmin',
        ]) && <OrgAdminFtue />}
        <div className={classes.paperDiv}>
          <div
            data-test={
              Object.entries(listItems)[item]
                ? `${Object.entries(listItems)[item][1].dataTest}-content`
                : ''
            }
            className={classes.paperClass}
          >
            {Object.entries(listItems)[item]
              ? Object.entries(listItems)[item][1].component
              : ''}
          </div>
        </div>

        <TemporaryPasswordDisplayDialog />
      </div>
    )
  } else {
    return (
      <Typography
        data-test="zero-state-text"
        className={classes.roleError}
        variant="h4"
      >
        {'To manage your organisation, please contact an organisation admin'}
      </Typography>
    )
  }
}

export default OrganisationContainer
