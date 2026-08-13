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
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getSamlSettings } from '../../../redux/actions/instance-management-actions'
import {
  clearOrganisationUniqueNameErrorMessage,
  clearSelectedOrganisation,
  getOrganisation,
  updateOrganisation,
} from '../organisation-actions'
import OrganisationDetail from './OrganisationDetail'

const OrganisationDetailContainer = props => {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(getSamlSettings())
  }, []) //eslint-disable-line

  useEffect(() => {
    dispatch(getOrganisation(props.organisation.id))
    return () => dispatch(clearSelectedOrganisation())
  }, [dispatch, props.organisation.id]) //eslint-disable-line

  const organisation = useSelector(
    state => state.organisation?.selectedOrganisation
  )

  const updateOrganisationName = name =>
    dispatch(updateOrganisation(organisation.id, { name }))
  const clearOrganisationNameErrorMessage = () =>
    dispatch(clearOrganisationUniqueNameErrorMessage())

  return (
    <OrganisationDetail
      organisation={organisation}
      isLoaded={!!organisation}
      updateOrganisationName={updateOrganisationName}
      clearOrganisationUniqueNameErrorMessage={
        clearOrganisationNameErrorMessage
      }
      setSelectedOrganisation={props.setSelectedOrganisation}
    />
  )
}
OrganisationDetailContainer.propTypes = {
  organisation: PropTypes.object.isRequired,
  setSelectedOrganisation: PropTypes.func.isRequired,
}
export default OrganisationDetailContainer
