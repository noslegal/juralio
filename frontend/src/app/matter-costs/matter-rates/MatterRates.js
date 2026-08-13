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

import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import MatterRatesSetupFlow from './MatterRatesSetupFlow'
import MatterRatesTable from './MatterRatesTable'
import costsService from '../../../services/costs/costs-service'
import BigDataSpinner from '../../../components/feedback/big-data-spinner/BigDataSpinner'

const MatterRates = props => {
  const { isViewOnly, matterId, isMatterAdmin, pageInfo, userPosition } = props
  const [stage, setStage] = useState(0)
  const [doReplace, setDoReplace] = useState(false)
  const orgId = useSelector(state => state.auth.data.details.organisationId)
  const [matterRTD, setMatterRTD] = useState()
  const [rates, setRates] = useState()
  const [rateTypes, setRateTypes] = useState()
  const [periods, setPeriods] = useState()
  const [showSpinner, setShowSpinner] = useState(true)

  useEffect(() => {
    setDoReplace(false)
    setShowSpinner(true)
    costsService.getRateTypes(userPosition?.positionData?.id).then(res => {
      if (res.status === 200) {
        setRateTypes(res.body)
        if (pageInfo.finishedMatterRates) {
          costsService.getMatterRateTableDetails(matterId).then(res => {
            if (res.status === 200) {
              setMatterRTD(res.body.rateTableDetails)
              setPeriods(res.body.periods)
              costsService
                .getMatterRateTable(
                  res.body.rateTableDetails.id,
                  matterId,
                  false
                )
                .then(res => {
                  if (res.status === 200) {
                    setRates(res.body)
                    if (props.startInReplaceFlow) {
                      setStage(0)
                      setDoReplace(true)
                    } else {
                      setStage(4)
                    }
                    setShowSpinner(false)
                  }
                })
            }
          })
        } else {
          setShowSpinner(false)
        }
      }
    })
  }, []) // eslint-disable-line
  return (
    <div>
      {stage < 4 && !showSpinner && (
        <MatterRatesSetupFlow
          isMatterAdmin={isMatterAdmin}
          doReplace={doReplace}
          stage={stage}
          setStage={setStage}
          setDoReplace={setDoReplace}
          rateTypes={rateTypes}
          setSelectedPage={props.setSelectedPage}
          refetchCostsData={props.refetchCostsData}
          setPageInfo={props.setPageInfo}
          matterId={matterId}
          isModal={props.isModal}
          setRates={props.setRates}
          setInReplaceFlow={props.setInReplaceFlow}
          isViewOnly={isViewOnly}
          userPosition={userPosition}
        />
      )}
      {stage === 4 && !showSpinner && (
        <MatterRatesTable
          isMatterAdmin={isMatterAdmin}
          rates={rates}
          rateTypes={rateTypes}
          orgId={orgId}
          period={periods}
          rtd={matterRTD}
          isFirstTimeFlow={false}
          setRates={setRates}
          setStage={setStage}
          setDoReplace={setDoReplace}
          matterId={matterId}
          isViewOnly={isViewOnly}
        />
      )}
      {showSpinner && <BigDataSpinner size={80} />}
    </div>
  )
}
export default MatterRates
