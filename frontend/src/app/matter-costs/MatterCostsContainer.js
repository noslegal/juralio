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

import React, { useEffect } from 'react'
import { makeStyles } from 'tss-react/mui'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router'
import { JuralioNamedColours } from '../../theme/juralio-named-colours'
import BigDataSpinner from '../../components/feedback/big-data-spinner/BigDataSpinner'
import { getMatterIdFromLocation } from '../../components/navigation/common/location-context-helper'
import { fetchMatterDetails } from '../matter-details/matter-details-actions'
import { useUserPosition } from '../../hooks/user-hooks'
import { POSITIONS } from '../constants'
import AdvisorMatterCostsContainer from './AdvisorMatterCostsContainer'
import ClientMatterCostsContainer from './ClientMatterCostsContainer'

const useStyles = makeStyles()(theme => ({
  root: {
    backgroundColor: JuralioNamedColours.beige[100],
    height: '100%',
    borderRadius: theme.spacing(0.5),
  },
}))

const MatterCostsContainer = props => {
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const location = useLocation()
  const matterId = getMatterIdFromLocation(location)
  const matter = useSelector(state => state.matterDetails)
  const userPosition = useUserPosition(matter.matter)

  useEffect(() => {
    if (matterId) {
      dispatch(fetchMatterDetails(matterId))
    }
  }, [dispatch, matterId])

  if (userPosition?.positionData?.id === undefined) {
    return (
      <div className={classes.root}>
        <BigDataSpinner size={180} />
      </div>
    )
  }

  if (userPosition.isClient && userPosition.isInternalGroup) {
    return (
      <ClientMatterCostsContainer
        matterId={matterId}
        userPosition={userPosition}
      />
    )
  }

  const matterHasInternalClientGroup = (
    matter.matter?.positionsOfGroups || []
  ).some(p => p.group?.isInternal && p.position?.name === POSITIONS.CLIENT.name)

  if (userPosition.isAdvisor && matterHasInternalClientGroup) {
    return (
      <ClientMatterCostsContainer
        matterId={matterId}
        userPosition={userPosition}
        readOnly
      />
    )
  }

  return (
    <AdvisorMatterCostsContainer
      matterId={matterId}
      userPosition={userPosition}
      goTo={props.goTo}
    />
  )
}

export default MatterCostsContainer
