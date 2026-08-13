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
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import ConfirmedUserReportsContainer from '../../../app/organisation/users/panels/confirmed-user-reports/ConfirmedUserReportsContainer'
import withLoader from '../../../components/feedback/with-loader/WithLoader'
import ManageOrganisationUsers from '../../../components/layouts/manage-users/organisation/ManageOrganisationUsers'
import BackToListLink from '../../../components/navigation/back-to-list-link/BackToListLink'
import Header from '../../common/header/Header'
import OrganisationAvatar from '../common/OrganisationAvatar'
import OrganisationSettings from '../common/OrganisationSettings'
import OrganisationImageDialog from './OrganisationImageDialog'

const useStyles = makeStyles()(theme => ({
  root: {
    paddingBottom: theme.spacing(2),
  },
  organisationHeader: {
    display: 'flex',
    alignItems: 'center',
  },
  organisationNameField: {
    paddingTop: theme.spacing(),
    overflow: 'hidden',
  },
  settingsWrapper: {
    marginLeft: 'auto',
  },
}))

const OrganisationDetail = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const showOrganisationEditDialog = useSelector(
    state => state.organisation.showOrganisationEditDialog
  )
  const [pageToggle, setPageToggle] = useState(0)

  const useToggle = () => {
    switch (pageToggle) {
      case 0:
        setPageToggle(1)
        break
      case 1:
        setPageToggle(0)
        break
      default:
        break
    }
  }
  return (
    <React.Fragment>
      <div className={classes.root} data-test="organisation-detail">
        <BackToListLink
          actionHandler={() => props.setSelectedOrganisation(undefined)}
          linkText={t('sysAdmin.organisations.backToOrganisationsList')}
        />
        <div className={classes.organisationHeader}>
          <OrganisationAvatar
            organisation={props.organisation}
            editable={true}
          />
          <div className={classes.organisationNameField}>
            <Header
              clearErrorMessages={props.clearOrganisationUniqueNameErrorMessage}
              handleTitleChange={props.updateOrganisationName}
              hideSearch
              organisation={props.organisation}
              shouldRenderBreadCrumb={false}
              isOrg={false}
              title={props.organisation?.name || ''}
            />
          </div>
          <div className={classes.settingsWrapper}>
            <Button variant="contained" onClick={useToggle}>
              {t(
                `sysAdmin.organisations.${
                  pageToggle === 0 ? 'showReports' : 'showUsers'
                }`
              )}
            </Button>
            <OrganisationSettings organisation={props.organisation} />
          </div>
        </div>
      </div>
      {pageToggle === 0 && (
        <ManageOrganisationUsers
          organisationId={props.organisation?.id}
          isSysadmin={true}
        />
      )}
      {pageToggle === 1 && (
        <ConfirmedUserReportsContainer
          organisationId={props.organisation?.id}
        />
      )}

      {showOrganisationEditDialog && <OrganisationImageDialog />}
    </React.Fragment>
  )
}

export default withLoader(200)(OrganisationDetail)

OrganisationDetail.propTypes = {
  clearOrganisationUniqueNameErrorMessage: PropTypes.func.isRequired,
  organisation: PropTypes.object.isRequired,
  setSelectedOrganisation: PropTypes.func.isRequired,
  updateOrganisationName: PropTypes.func.isRequired,
}
