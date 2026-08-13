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

import React, { useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import MatterRates from './matter-rates/MatterRates'
import MatterRatesTable from './matter-rates/MatterRatesTable'
import CostInitialScreen from './CostInitialScreen'
import CostsProjectionDashboard from './outcomes/CostsProjectionsDashboard'
import RatesModal from './matter-rates/RatesModal'
import { useSelector } from 'react-redux'
import MatterNewProjectionContainer from './MatterNewProjectionContainer'
import dayjs from 'dayjs'
import CostsReadOnlyNotSetup from './CostsReadOnlyNotSetup'
import CostAssumption from './CostAssumption'

const useStyles = makeStyles()(theme => ({
  ratesModalMask: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  ratesModalContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1001,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: theme.spacing(3),
    overflowY: 'auto',
  },
  hidden: {
    display: 'none',
  },
}))

const MatterCosts = props => {
  const {
    selectedPage,
    setSelectedPage,
    isMatterAdmin,
    pageInfo,
    matterId,
    setPageInfo,
    rates,
    setRates,
    rateTypes,
    refetchCostsData,
    goTo,
    isViewOnly,
    isFullUser,
    userPosition,
  } = props
  const { classes } = useStyles()
  const [showRatesModal, setShowRatesModal] = useState(false)
  const [showAssumptionsModal, setShowAssumptionsModal] = useState(false)
  const [doReplace, setDoReplace] = useState(false)
  const [editRates, setEditRates] = useState(false)
  const [selectedSnapshotRates, setSelectedSnapshotRates] = useState(null)
  const [selectedSnapshotRtd, setSelectedSnapshotRtd] = useState(null)
  const [selectedSnapshotPeriods, setSelectedSnapshotPeriods] = useState(null)
  const [selectedSnapshotAssumptions, setSelectedSnapshotAssumptions] =
    useState(null)
  const [selectedSnapshotDate, setSelectedSnapshotDate] = useState(null)
  const orgId = useSelector(state => state.auth.data.details.organisationId)

  return (
    <div>
      {showRatesModal && (
        <div>
          <div className={classes.ratesModalMask}></div>
          <div className={classes.ratesModalContainer}>
            <RatesModal
              setDoReplace={setDoReplace}
              rates={rates}
              setRates={setRates}
              matterRTD={pageInfo.rtd.rateTableDetails}
              rateTypes={rateTypes}
              periods={pageInfo.rtd.periods}
              isMatterAdmin={isMatterAdmin}
              editRates={editRates}
              setEditRates={setEditRates}
              setShowRatesModal={setShowRatesModal}
              orgId={orgId}
              setSelectedPage={setSelectedPage}
              selectedSnapshotRates={selectedSnapshotRates}
              selectedSnapshotRtd={selectedSnapshotRtd}
              selectedSnapshotPeriods={selectedSnapshotPeriods}
              selectedSnapshotDate={selectedSnapshotDate}
              isViewOnly={isViewOnly}
            />
          </div>
        </div>
      )}
      {showAssumptionsModal && (
        <CostAssumption
          matterId={matterId}
          isViewOnly={isViewOnly}
          snapshotAssumptions={selectedSnapshotAssumptions?.assumptions}
          snapshotCostTimeEstimates={
            selectedSnapshotAssumptions?.costTimeEstimateList
          }
          snapshotDate={selectedSnapshotDate}
          onClose={() => setShowAssumptionsModal(false)}
        />
      )}

      {selectedPage === 0 && (
        <>
          {(!isFullUser || isViewOnly) && <CostsReadOnlyNotSetup />}
          {isMatterAdmin && !isViewOnly && (
            <CostInitialScreen
              pageInfo={pageInfo}
              setSelectedPage={setSelectedPage}
              setShowRatesModal={setShowRatesModal}
            />
          )}
          {!isMatterAdmin && !pageInfo.finishedMatterResource && (
            <CostsReadOnlyNotSetup />
          )}
        </>
      )}
      {selectedPage === 1 && !editRates && (
        <>
          {
            <MatterRates
              isMatterAdmin={isMatterAdmin}
              pageInfo={pageInfo}
              setSelectedPage={setSelectedPage}
              matterId={matterId}
              refetchCostsData={refetchCostsData}
              setPageInfo={setPageInfo}
              setRates={setRates}
              startInReplaceFlow={doReplace}
              setInReplaceFlow={setDoReplace}
              isViewOnly={isViewOnly}
              userPosition={userPosition}
            />
          }
        </>
      )}
      {editRates && (
        <>
          <MatterRatesTable
            isMatterAdmin={isMatterAdmin}
            rates={rates}
            rateTypes={rateTypes}
            orgId={orgId}
            period={pageInfo.rtd.periods}
            rtd={pageInfo.rtd.rateTableDetails}
            isFirstTimeFlow={false}
            setRates={setRates}
            setDoReplace={setDoReplace}
            matterId={matterId}
            editRates={editRates}
            setEditRates={setEditRates}
            setShowRatesModal={setShowRatesModal}
            setPageInfo={setPageInfo}
            isViewOnly={isViewOnly}
          />
        </>
      )}
      {selectedPage === 2 && (
        <div
          className={
            editRates || doReplace || showRatesModal ? classes.hidden : ''
          }
        >
          <CostsProjectionDashboard
            pageInfo={pageInfo}
            matterId={matterId}
            selectedPage={selectedPage}
            setSelectedPage={setSelectedPage}
            setPageInfo={setPageInfo}
            rates={rates}
            goTo={goTo}
            showRatesModal={showRatesModal}
            setShowRatesModal={setShowRatesModal}
            showAssumptionsModal={showAssumptionsModal}
            setShowAssumptionsModal={setShowAssumptionsModal}
            isMatterAdmin={isMatterAdmin}
            editRates={editRates}
            doReplace={doReplace}
            setSelectedSnapshotRates={setSelectedSnapshotRates}
            setSelectedSnapshotRtd={setSelectedSnapshotRtd}
            setSelectedSnapshotPeriods={setSelectedSnapshotPeriods}
            setSelectedSnapshotAssumptions={setSelectedSnapshotAssumptions}
            setSelectedSnapshotDate={setSelectedSnapshotDate}
            isViewOnly={isViewOnly}
          />
        </div>
      )}
      {selectedPage === 3 && (
        <MatterNewProjectionContainer
          rtd={pageInfo.rtd.rateTableDetails}
          matterId={matterId}
          setSelectedPage={setSelectedPage}
          setPageInfo={setPageInfo}
          startDate={dayjs(
            pageInfo.projectionPeriodList.filter(x => !x.isRetired)[
              pageInfo.projectionPeriodList.filter(x => !x.isRetired).length - 1
            ]?.startDate
          )
            .startOf('month')
            .toDate()}
          newStartdate={dayjs(
            pageInfo.projectionPeriodList.filter(x => !x.isRetired)[
              pageInfo.projectionPeriodList.filter(x => !x.isRetired).length - 1
            ]?.endDate
          )
            .startOf('month')
            .add(1, 'month')
            .toDate()}
          endDate={dayjs(
            pageInfo.projectionPeriodList.filter(x => !x.isRetired)[
              pageInfo.projectionPeriodList.filter(x => !x.isRetired).length - 1
            ]?.endDate
          )
            .endOf('month')
            .toDate()}
          isValidSnapshots={
            pageInfo.projectionPeriodList.filter(x => !x.isRetired).length > 0
              ? true
              : false
          }
        />
      )}
    </div>
  )
}

export default MatterCosts
