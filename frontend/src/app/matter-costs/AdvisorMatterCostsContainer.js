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
import { makeStyles } from 'tss-react/mui'
import { useSelector } from 'react-redux'
import { JuralioNamedColours } from '../../theme/juralio-named-colours'
import { ACTIVITIES } from '../constants'
import matterCostsService from '../../services/costs/matter-costs-service'
import BigDataSpinner from '../../components/feedback/big-data-spinner/BigDataSpinner'
import costsService from '../../services/costs/costs-service'
import matterService from '../../services/matter/matter-service'
import { useIsViewOnly } from '../../hooks/matter/viewer/matter-viewer-hooks'
import MatterCosts from './MatterCosts'

const useStyles = makeStyles()(theme => ({
  root: {
    backgroundColor: JuralioNamedColours.beige[100],
    height: '100%',
    borderRadius: theme.spacing(0.5),
  },
}))

const AdvisorMatterCostsContainer = ({ matterId, userPosition, goTo }) => {
  const { classes } = useStyles()
  const [selectedPage, setSelectedPage] = useState(0)
  const matter = useSelector(state => state.matterDetails)
  const isMatterAdmin =
    matter?.matter?.activities?.indexOf(ACTIVITIES.MATTER_ADMIN) > -1
  const [pageInfo, setPageInfo] = useState({})
  const [showSpinner, setShowSpinner] = useState(true)
  const [snapshotList, setSnapshotList] = useState([])
  const [rates, setRates] = useState([])
  const [rateTypes, setRateTypes] = useState([])
  const isViewOnly = useIsViewOnly(matter.matter)
  const isReadOnly = !isMatterAdmin || isViewOnly
  const userData = useSelector(state => state.auth.data.details)

  const refetchCostsData = () => {
    matterService.getMatter(matterId)
    matterCostsService.getCostStageData(matterId).then(res => {
      if (res.status === 200) {
        setPageInfo(res.body)
        if (res.body.finishedMatterRates && rates.length === 0) {
          costsService
            .getMatterRateTable(
              res.body.rtd.rateTableDetails.id,
              matterId,
              false
            )
            .then(res => {
              if (res.status === 200) {
                setRates(res.body)
              }
            })
        }
      }
    })
  }

  useEffect(() => {
    if (
      userPosition?.positionData?.id === undefined ||
      rateTypes.length !== 0
    ) {
      return
    }

    matterService.getMatter(matterId)

    const loadStageData = () =>
      matterCostsService.getCostStageData(matterId).then(res => {
        if (res.status === 200) {
          setPageInfo(res.body)
          if (!res.body.finishedMatterRates) {
            setSelectedPage(res.body.stage)
          }
          if (res.body.finishedMatterRates) {
            if (res.body.hasProjectionPeriods) {
              setSelectedPage(2)
            }
            costsService
              .getMatterRateTable(
                res.body.rtd.rateTableDetails.id,
                matterId,
                false
              )
              .then(res => {
                if (res.status === 200) {
                  setRates(res.body)
                  setShowSpinner(false)
                }
              })
            let snaplist = []
            if (res.body.projectionStageList) {
              res.body.projectionStageList.forEach(p => {
                if (p.snapshot) {
                  const snapshot = JSON.parse(p.snapshot)
                  snaplist.push(snapshot)
                }
              })
              setSnapshotList(snaplist)
            }
          } else {
            setShowSpinner(false)
          }
        }
      })

    // Read-only users (matter viewers / non matter-admins) cannot POST
    // /rate_type — it requires ROLE_ORG_ADMIN and would 403, leaving the page
    // stuck on the spinner. Rate types only drive the editable wizard, which
    // they never see, so skip straight to the read-only stage data.
    if (isReadOnly) {
      loadStageData()
    } else {
      costsService.getRateTypes(userPosition?.positionData?.id).then(res => {
        if (res.status === 200) {
          setRateTypes(res.body)
          loadStageData()
        }
      })
    }
  }, [userPosition.positionData]) // eslint-disable-line

  if (showSpinner) {
    return (
      <div className={classes.root}>
        <BigDataSpinner size={180} />
      </div>
    )
  }

  return (
    <MatterCosts
      selectedPage={selectedPage}
      setSelectedPage={setSelectedPage}
      isMatterAdmin={isMatterAdmin}
      pageInfo={pageInfo}
      matterId={matterId}
      refetchCostsData={refetchCostsData}
      setPageInfo={setPageInfo}
      snapshotList={snapshotList}
      rates={rates}
      setRates={setRates}
      rateTypes={rateTypes}
      goTo={goTo}
      isViewOnly={isReadOnly}
      isFullUser={!userData.isExternal}
      userPosition={userPosition}
    />
  )
}

export default AdvisorMatterCostsContainer
