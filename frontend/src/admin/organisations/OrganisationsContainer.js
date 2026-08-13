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

import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import {
  cleanState,
  fetchGroups,
  getOrganisations,
  updateOrganisation,
} from '../../admin/organisations/organisation-actions'
import ConfirmationDialog from '../../components/dialog/confirmation-dialog/ConfirmationDialog'
import withLoader from '../../components/feedback/with-loader/WithLoader'
import OrganisationImageDialog from './detail/OrganisationImageDialog'
import OrganisationsTableContainer from './table/OrganisationsTableContainer'

const OrganisationsTableContainerWithLoader = withLoader(200)(
  OrganisationsTableContainer
)

const OrganisationsContainer = props => {
  const { t } = useTranslation()
  const dispatch = useDispatch()

  const hasLoadedOrgs = useSelector(
    state => state.organisation?.organisationsList
  )

  const organisationsList = useSelector(
    state => state.organisation.organisationsList
  )

  const showOrganisationEditDialog = useSelector(
    state => state.organisation.showOrganisationEditDialog
  )

  const [context, setContext] = useState('enable')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [onConfirmationRunFunction, setOnConfirmationRunFunction] = useState(
    () => () => {}
  )

  useEffect(() => {
    dispatch(getOrganisations()).then(res => {
      dispatch(fetchGroups())
    })
    return () => dispatch(cleanState)
  }, [dispatch, t])

  const handleAction = () => {
    onConfirmationRunFunction()
    setShowConfirmation(false)
  }

  const handleCancel = () => setShowConfirmation(false)

  const handleChangeOrganisationActivity = (id, properties) => {
    setOnConfirmationRunFunction(
      () => () => dispatch(updateOrganisation(id, properties))
    )
    properties.enabled ? setContext('enable') : setContext('disable')
    setShowConfirmation(true)
  }

  return (
    <React.Fragment>
      {organisationsList && (
        <OrganisationsTableContainerWithLoader
          isLoaded={hasLoadedOrgs.length > 0}
          organisations={organisationsList}
          setSelectedOrganisation={props.setSelectedOrganisation}
          handleChangeOrganisationActivity={handleChangeOrganisationActivity}
          getOrganisations={() => dispatch(getOrganisations())}
        />
      )}
      {showConfirmation && (
        <ConfirmationDialog
          titleText={t('organisation.confirmationDialog.enabled.titleText', {
            context,
          })}
          promptText={t('organisation.confirmationDialog.enabled.promptText', {
            context,
          })}
          actionText={t('organisation.confirmationDialog.actionText')}
          cancelHandler={handleCancel}
          actionHandler={handleAction}
          usageContext="OrganisationActivity"
          warningText={null}
        />
      )}
      {showOrganisationEditDialog && <OrganisationImageDialog />}
    </React.Fragment>
  )
}

OrganisationsContainer.propTypes = {
  setSelectedOrganisation: PropTypes.func.isRequired,
}

export default OrganisationsContainer
