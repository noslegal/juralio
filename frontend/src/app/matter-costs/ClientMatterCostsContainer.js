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

import React, { useCallback, useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { makeStyles } from 'tss-react/mui'
import BigDataSpinner from '../../components/feedback/big-data-spinner/BigDataSpinner'
import matterCostsService from '../../services/costs/matter-costs-service'
import ClientCostInitialScreen from './ClientCostInitialScreen'
import ClientCostsDashboard from './ClientCostsDashboard'
import FixedFeeSetup from './fixed-fee-setup/FixedFeeSetup'
import { outOfScopeFromDetails } from './fixed-fee-setup/helpers'
import CostsReadOnlyNotSetup from './CostsReadOnlyNotSetup'

const WIZARD_MODE = { FRESH: 'fresh', OBJECT: 'object' }

const useStyles = makeStyles()(theme => ({
  root: {
    height: '100%',
    borderRadius: theme.spacing(0.5),
  },
  advisorEmptyOuter: {
    padding: theme.spacing(4),
  },
  advisorEmptyContainer: {
    padding: theme.spacing(5),
    textAlign: 'center',
  },
  advisorEmptyTitle: {
    marginBottom: theme.spacing(2),
  },
  advisorEmptyBody: {
    maxWidth: 560,
    margin: '0 auto',
  },
}))

const ClientMatterCostsContainer = ({ matterId, userPosition, readOnly }) => {
  const { classes } = useStyles()
  const [loaded, setLoaded] = useState(false)
  const [stageData, setStageData] = useState(null)
  const [wizardMode, setWizardMode] = useState(null)

  const fetchStageData = useCallback(() => {
    if (!matterId) return Promise.resolve()
    return matterCostsService.getClientCostStageData(matterId).then(res => {
      if (res?.status === 200) {
        setStageData(res.body)
      }
    })
  }, [matterId])

  useEffect(() => {
    if (!matterId) {
      setLoaded(true)
      return
    }
    fetchStageData().finally(() => setLoaded(true))
  }, [matterId, fetchStageData])

  if (!loaded) {
    return (
      <div className={classes.root}>
        <BigDataSpinner size={180} />
      </div>
    )
  }

  const projectionStageList = stageData?.projectionStageList || []
  const hasAnyProjection = projectionStageList.length > 0
  const hasFinalisedProjection = projectionStageList.some(p => p?.snapshot)

  const latestProjection = projectionStageList.reduce((latest, p) => {
    const endMs = p?.period?.endDate ? dayjs(p.period.endDate).valueOf() : 0
    const latestMs = latest?.period?.endDate
      ? dayjs(latest.period.endDate).valueOf()
      : 0
    return endMs > latestMs ? p : latest
  }, null)
  const latestEndMs = latestProjection?.period?.endDate
    ? dayjs(latestProjection.period.endDate).valueOf()
    : 0
  const nextStart =
    latestEndMs > 0
      ? dayjs(latestEndMs).add(1, 'month').startOf('month').toDate()
      : null
  // A new projection must start no earlier than the month after the previous
  // projection ends — i.e. the same month as the preset default start, so the
  // previous projection's final month can't be selected.
  const minStart =
    latestEndMs > 0
      ? dayjs(latestEndMs).add(1, 'month').startOf('month').toDate()
      : null
  // Preset the new projection from the most recent one.
  const previousCurrency = stageData?.rateTableDetails?.currency || null
  const previousOutOfScope = outOfScopeFromDetails(
    latestProjection?.outOfScopeDetails
  )

  const closeToDashboard = hasFinalisedProjection
    ? () => fetchStageData().finally(() => setWizardMode(null))
    : null

  const handleConfirmed = () => {
    fetchStageData().finally(() => setWizardMode(null))
  }

  if (readOnly) {
    if (hasFinalisedProjection) {
      return (
        <div className={classes.root}>
          <ClientCostsDashboard
            matterId={matterId}
            projectionStageList={projectionStageList}
            rtd={
              stageData?.rateTableDetails
                ? { rateTableDetails: stageData.rateTableDetails }
                : null
            }
            readOnly
          />
        </div>
      )
    }
    return (
      <div className={classes.root}>
        <CostsReadOnlyNotSetup />
      </div>
    )
  }

  if (wizardMode === WIZARD_MODE.FRESH) {
    return (
      <div className={classes.root}>
        <FixedFeeSetup
          matterId={matterId}
          userPosition={userPosition}
          freshFlow
          defaultStart={nextStart}
          minStart={minStart}
          defaultCurrency={previousCurrency}
          defaultOutOfScope={previousOutOfScope}
          hasPreviousProjection={hasFinalisedProjection}
          onClose={closeToDashboard}
          onConfirmed={handleConfirmed}
        />
      </div>
    )
  }

  if (
    wizardMode &&
    typeof wizardMode === WIZARD_MODE.OBJECT &&
    wizardMode.projectionId
  ) {
    return (
      <div className={classes.root}>
        <FixedFeeSetup
          matterId={matterId}
          userPosition={userPosition}
          targetProjectionPeriodId={wizardMode.projectionId}
          skipWelcomeBack={projectionStageList.length > 1}
          liveEditMode={!!wizardMode.liveEdit}
          hasPreviousProjection={hasFinalisedProjection}
          onClose={closeToDashboard}
          onConfirmed={handleConfirmed}
        />
      </div>
    )
  }

  if (hasFinalisedProjection) {
    return (
      <div className={classes.root}>
        <ClientCostsDashboard
          matterId={matterId}
          projectionStageList={projectionStageList}
          rtd={
            stageData?.rateTableDetails
              ? { rateTableDetails: stageData.rateTableDetails }
              : null
          }
          onAddProjection={() => setWizardMode(WIZARD_MODE.FRESH)}
          onResumeProjection={(projectionId, liveEdit = false) =>
            setWizardMode({ projectionId, liveEdit })
          }
          onRefresh={fetchStageData}
        />
      </div>
    )
  }

  if (!hasAnyProjection) {
    return (
      <div className={classes.root}>
        <ClientCostInitialScreen
          onGetStarted={() => setWizardMode(WIZARD_MODE.FRESH)}
        />
      </div>
    )
  }

  return (
    <div className={classes.root}>
      <FixedFeeSetup
        matterId={matterId}
        userPosition={userPosition}
        hasPreviousProjection={hasFinalisedProjection}
        onConfirmed={handleConfirmed}
      />
    </div>
  )
}

export default ClientMatterCostsContainer
