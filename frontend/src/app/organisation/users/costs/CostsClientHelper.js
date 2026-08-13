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

import { Button, Typography } from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import CostsFlowDiagram from './CostsFlowDiagram'
import GradeTable from './GradeTable'
import OtherCostsTable from './OtherCostsTable'
import RateTypeTable from './RateTypeTable'
import BuildNewTableForm from './BuildNewTableForm'
// import costsService from '../../../../services/costs/costs-service'
// import { RATE_TABLE_TYPES } from '../../../constants'
// import { getCurrentOrganisation } from '../../../../admin/organisations/organisation-actions'
import ArrowCircleLeftOutlinedIcon from '@mui/icons-material/ArrowCircleLeftOutlined'
import ClientRateTable from './ClientRateTable'

export const getClientCostsContent = (
  stage,
  t,
  classes,
  currency,
  setCurrency,
  workType,
  setWorkType,
  location,
  setLocation,
  period,
  setPeriod,
  latestStage,
  organisationId,
  grades,
  gradeCategories,
  rateTypes,
  otherCosts,
  setButtonDisabled,
  rates,
  rateTableDetails,
  fullPeriod,
  rateTableType,
  setRateTableType,
  rateTableTemplate,
  setRateTableTemplate,
  setRatePayload,
  selectedRTD,
  clientName,
  setClientName,
  setRates,
  setGrades,
  setRateTypes,
  setOtherCosts,
  setStage,
  finaliseRatesFailed,
  setFinaliseRatesFailed,
  position
) => {
  switch (stage) {
    case 0:
      return (
        <div data-test="welcome-screen">
          <Typography className={classes.textDiv} variant="h6">
            {t('organisationAdmin.costs.stage1P1')}
          </Typography>
          <Typography
            dangerouslySetInnerHTML={{
              __html: t('organisationAdmin.costs.stage1P2'),
            }}
            className={classes.textDiv}
            variant="body1"
          ></Typography>
          <CostsFlowDiagram
            stage={stage}
            noClick={true}
            latestStage={latestStage}
            showTitle={true}
          />
          <Typography
            dangerouslySetInnerHTML={{
              __html: t('organisationAdmin.costs.stage1P3'),
            }}
            className={classes.textDiv}
            variant="body1"
          ></Typography>
          <Typography
            dangerouslySetInnerHTML={{
              __html: t('organisationAdmin.costs.stage1P4'),
            }}
            className={classes.textDiv}
            variant="body1"
          ></Typography>
          <Typography
            dangerouslySetInnerHTML={{
              __html: t('organisationAdmin.costs.stage1P5'),
            }}
            className={classes.textDiv}
            variant="body1"
          ></Typography>
        </div>
      )
    case 1:
      return (
        <div data-test="explain-screen">
          <Typography
            dangerouslySetInnerHTML={{
              __html: t('organisationAdmin.costs.stage2P1'),
            }}
            variant="subtitle1"
            className={classes.textDiv}
          ></Typography>
          <Typography variant="h6">
            {t('organisationAdmin.costs.stage2P2')}
          </Typography>
          <Typography variant="body1">
            {t('organisationAdmin.costs.stage2P3')}
          </Typography>
          <Typography
            style={{ fontStyle: 'italic' }}
            className={classes.textDiv}
            variant="body1"
          >
            {t('organisationAdmin.costs.stage2P4')}
          </Typography>
          <Typography variant="h6">
            {t('organisationAdmin.costs.stage2P5')}
          </Typography>
          <Typography variant="body1">
            {t('organisationAdmin.costs.stage2P6')}
          </Typography>
          <Typography
            style={{ fontStyle: 'italic' }}
            className={classes.textDiv}
            variant="body1"
          >
            {t('organisationAdmin.costs.stage2P7')}
          </Typography>
          <Typography variant="h6">
            {t('organisationAdmin.costs.stage2P8')}
          </Typography>
          <Typography variant="body1">
            {t('organisationAdmin.costs.stage2P9')}
          </Typography>
          <Typography
            style={{ fontStyle: 'italic' }}
            className={classes.textDiv}
            variant="body1"
          >
            {t('organisationAdmin.costs.stage2P10')}
          </Typography>
          <div className={classes.greyBox}>
            <InfoOutlinedIcon className={classes.greyBoxIcon} />
            <Typography
              style={{ alignSelf: 'center' }}
              dangerouslySetInnerHTML={{
                __html: t('organisationAdmin.costs.stage2P11'),
              }}
            ></Typography>
          </div>
        </div>
      )
    case 2:
      return (
        <div>
          <Typography className={classes.textDiv} variant="h6">
            {t('organisationAdmin.costs.stage3P1')}
          </Typography>
          <Typography
            dangerouslySetInnerHTML={{
              __html: t('organisationAdmin.costs.stage3P2'),
            }}
            className={classes.textDiv}
            variant="body1"
          ></Typography>
          <Typography className={classes.textDiv} variant="body1">
            {t('organisationAdmin.costs.stage3P3')}
          </Typography>
          <Typography className={classes.textDiv} variant="body1">
            {t('organisationAdmin.costs.stage3P4')}
          </Typography>
        </div>
      )
    case 3:
      return (
        <div>
          <Typography className={classes.textDiv} variant="h6">
            {t('organisationAdmin.costs.stage4P1')}
          </Typography>
          <Typography className={classes.textDiv} variant="body1">
            {t('organisationAdmin.costs.stage4P2')}
          </Typography>
          <Typography
            className={classes.textDiv}
            dangerouslySetInnerHTML={{
              __html: t('organisationAdmin.costs.stage4P3'),
            }}
            variant="body1"
          ></Typography>

          <Typography
            className={classes.textDiv}
            dangerouslySetInnerHTML={{
              __html: t('organisationAdmin.costs.stage4P4'),
            }}
            variant="body1"
          ></Typography>

          <Typography
            className={classes.textDiv}
            variant="body1"
            dangerouslySetInnerHTML={{
              __html: t('organisationAdmin.costs.stage4P5'),
            }}
          ></Typography>
        </div>
      )
    case 4:
      return (
        <div>
          <Typography className={classes.textDiv} variant="h6">
            {t('organisationAdmin.costs.stage5P1')}
          </Typography>
          <Typography className={classes.textDiv} variant="body1">
            {t('organisationAdmin.costs.stage5P2')}
          </Typography>
          <Typography className={classes.textDiv} variant="body1">
            {t('organisationAdmin.costs.stage5P3')}
          </Typography>
          <Typography className={classes.textDiv} variant="body1">
            {t('organisationAdmin.costs.stage5P4')}
          </Typography>
        </div>
      )
    case 5:
      return (
        <BuildNewTableForm
          currency={currency}
          location={location}
          workType={workType}
          period={period}
          setCurrency={setCurrency}
          setLocation={setLocation}
          setWorkType={setWorkType}
          setPeriod={setPeriod}
          rateTableType={rateTableType}
          setRateTableType={setRateTableType}
          rateTableTemplate={rateTableTemplate}
          setRateTableTemplate={setRateTableTemplate}
          rateTableDetails={rateTableDetails}
          clientName={clientName}
          setClientName={setClientName}
          isFirstTimeFlow={true}
          setButtonDisabled={setButtonDisabled}
          position={position}
        />
      )
    case 6:
      return (
        <div>
          <Typography className={classes.textDiv}>
            {t('organisationAdmin.costs.stage7P1')}
          </Typography>
          <Typography className={classes.textDiv}>
            {t('organisationAdmin.costs.stage7P2')}
          </Typography>
        </div>
      )
    case 7:
      return <div></div>
    case 8:
      return (
        <>
          <Button
            style={{ marginBottom: '16px', marginRight: 'auto' }}
            onClick={() => {
              setStage(7)
            }}
            startIcon={<ArrowCircleLeftOutlinedIcon />}
          >
            <Typography>{t('common.back')}</Typography>
          </Button>
          <BuildNewTableForm
            currency={currency}
            location={location}
            workType={workType}
            period={period}
            setCurrency={setCurrency}
            setLocation={setLocation}
            setWorkType={setWorkType}
            setPeriod={setPeriod}
            rateTableType={rateTableType}
            setRateTableType={setRateTableType}
            rateTableTemplate={rateTableTemplate}
            setRateTableTemplate={setRateTableTemplate}
            rateTableDetails={rateTableDetails}
            clientName={clientName}
            setClientName={setClientName}
            isFirstTimeFlow={false}
            setButtonDisabled={setButtonDisabled}
            position={position}
          />
        </>
      )
    case 9:
      return (
        <div>
          <GradeTable
            grades={grades}
            orgId={organisationId}
            gradeCategories={gradeCategories}
            setButtonDisabled={setButtonDisabled}
            setGrades={setGrades}
          />
        </div>
      )
    case 10:
      return (
        <RateTypeTable
          rateTypes={rateTypes}
          orgId={organisationId}
          setButtonDisabled={setButtonDisabled}
          setRateTypes={setRateTypes}
          position={position}
        />
      )
    case 11:
      return (
        <OtherCostsTable
          costs={otherCosts}
          orgId={organisationId}
          setButtonDisabled={setButtonDisabled}
          setOtherCosts={setOtherCosts}
        />
      )
    case 12:
      //card click
      return (
        <ClientRateTable
          associatedTableRetired={
            selectedRTD.client &&
            rateTableDetails.filter(
              x => x?.rateTableDetails?.id === selectedRTD.associated_id
            )[0]?.rateTableDetails?.is_retired
          }
          associatedClientTables={rateTableDetails.filter(
            x =>
              x.rateTableDetails.client &&
              x.rateTableDetails.associated_id === selectedRTD.id &&
              !x.rateTableDetails.is_retired
          )}
          rates={rates}
          grades={grades}
          rateTypes={rateTypes}
          orgId={organisationId}
          period={fullPeriod}
          rtd={selectedRTD}
          parentClasses={classes}
          isFirstTimeFlow={false}
          selectedRTD={selectedRTD}
          setRates={setRates}
          setStage={setStage}
          finaliseFailed={finaliseRatesFailed}
          setFinaliseFailed={setFinaliseRatesFailed}
          validRTDRetire={
            rateTableDetails.filter(
              x => !x.rateTableDetails.is_retired && !x.rateTableDetails.client
            ).length > 1
          }
        />
      )
    case 13:
      //organisation new table
      return (
        <ClientRateTable
          setRatePayload={setRatePayload}
          grades={grades}
          rateTypes={rateTypes}
          rates={rates}
          orgId={organisationId}
          period={fullPeriod}
          rtd={selectedRTD}
          parentClasses={classes}
          isFirstTimeFlow={true}
          selectedRTD={selectedRTD}
          finaliseFailed={finaliseRatesFailed}
          setFinaliseFailed={setFinaliseRatesFailed}
          addBackButton={true}
          setStage={setStage}
        />
      )
    case 14:
      //client new table
      return (
        <ClientRateTable
          setRatePayload={setRatePayload}
          grades={grades}
          rateTypes={rateTypes}
          rates={rates}
          orgId={organisationId}
          period={fullPeriod}
          rtd={selectedRTD}
          parentClasses={classes}
          isFirstTimeFlow={true}
          selectedRTD={selectedRTD}
          finaliseFailed={finaliseRatesFailed}
          setFinaliseFailed={setFinaliseRatesFailed}
          addBackButton={true}
          setStage={setStage}
          associatedTableRetired={
            selectedRTD.client &&
            rateTableDetails?.filter(
              x => x.rateTableDetails?.id === selectedRTD.associated_id
            )[0]?.rateTableDetails?.is_retired
          }
          validRTDRetire={
            rateTableDetails.filter(
              x => !x.rateTableDetails.is_retired && !x.rateTableDetails.client
            ).length > 1
          }
        />
      )
    default:
      return t('')
  }
}

export const getButtonText = (stage, t, showWelcomeBack) => {
  if (showWelcomeBack) {
    return t('organisationAdmin.costs.stageWelcomeBack')
  }
  switch (stage) {
    case 0:
      return t('organisationAdmin.costs.buttonText.0')
    case 1:
      return t('organisationAdmin.costs.buttonText.1')
    case 2:
      return t('organisationAdmin.costs.buttonText.2')
    case 3:
      return t('organisationAdmin.costs.buttonText.3')
    case 4:
      return t('organisationAdmin.costs.buttonText.4')
    case 5:
      return t('organisationAdmin.costs.buttonText.5')
    case 6:
      return t('organisationAdmin.costs.buttonText.6')
    case 7:
      return t('organisationAdmin.costs.buttonText.7')
    case 8:
      return t('organisationAdmin.costs.buttonText.8')
    case 13:
      return t('organisationAdmin.costs.buttonText.6')
    case 14:
      return t('organisationAdmin.costs.buttonText.6')
    default:
      return ''
  }
}

export const validateRateTablePayload = payload => {
  for (let i = 0; i < payload.length; i++) {
    const rate = payload[i]
    if (rate.isError) {
      return false
    }
  }
  return true
}

// export const getClientButtonClick = (
//   stage,
//   setStage,
//   showWelcomeBack,
//   setShowWelcomeBack,
//   orgId,
//   latestStage,
//   setLatestStage,
//   setShowSpinner,
//   setGrades,
//   setGradeCategories,
//   setRateTypes,
//   setOtherCosts,
//   currency,
//   workType,
//   clientName,
//   period,
//   setPeriod,
//   setFullPeriod,
//   location,
//   dataExists,
//   setRateTableDetails,
//   setRates,
//   ratePayload,
//   rateTableType,
//   setSelectedRTD,
//   rateTableTemplate,
//   dispatch,
//   setFinaliseRatesFailed
// ) => {
//   if (showWelcomeBack) {
//     setShowWelcomeBack(false)
//   } else {
//     if (stage === 0) {
//       setStage(stage + 1)
//       setLatestStage(latestStage + 1)
//     } else if (stage === 1) {
//       costsService.generateDefaultGradeData(orgId).then(res => {
//         if (res.status === 200) {
//           setGrades(res.body)
//           costsService.getOrganisationGradeCategories().then(res => {
//             if (res.status === 200) {
//               setGradeCategories(res.body)
//             }
//           })
//         }
//         setStage(stage + 1)
//         setLatestStage(latestStage + 1)
//       })
//     } else if (stage === 2) {
//       setStage(stage + 1)
//       setLatestStage(latestStage + 1)
//       costsService.generateDefaultRateTypeData(orgId).then(res => {
//         if (res.status === 200) {
//           setRateTypes(res.body)
//         }
//       })
//     } else if (stage === 3) {
//       setStage(stage + 1)
//       setLatestStage(latestStage + 1)
//       costsService.generateDefaultOtherCostsData(orgId).then(res => {
//         if (res.status === 200) {
//           setOtherCosts(res.body)
//         }
//       })
//     } else if (stage === 4) {
//       setStage(stage + 1)
//       setLatestStage(latestStage + 1)
//       document.body.scrollTop = 0 // For Safari
//       document.documentElement.scrollTop = 0 //For everything else
//     } else if (stage === 5) {
//       if (!dataExists) {
//         costsService
//           .createRateTableDetail({
//             currency: currency,
//             work_type: workType,
//             location: location,
//             client: false,
//             draft: true,
//           })
//           .then(res => {
//             setRateTableDetails(res.body)
//             costsService
//               .createPeriod({
//                 name: 'initial period',
//                 startDate: period,
//                 endDate: null,
//                 rateTableDetailId: res.body.id,
//               })
//               .then(res => {
//                 if (res.status === 200) {
//                   setPeriod(res.body.startDate)
//                   setFullPeriod([res.body])
//                   setStage(stage + 1)
//                   setLatestStage(latestStage + 1)
//                 }
//               })
//           })
//       } else {
//         setStage(stage + 1)
//         setLatestStage(latestStage + 1)
//       }
//     } else if (stage === 6) {
//       setShowSpinner(true)
//       costsService.bulkCreateRates(ratePayload).then(() => {
//         costsService.getRateTableDetail().then(res => {
//           if (res.status === 200) {
//             setStage(stage + 1)
//             setLatestStage(latestStage + 1)
//             setRateTableDetails(res.body)
//             setShowSpinner(false)
//             dispatch(getCurrentOrganisation())
//           }
//         })
//       })
//     } else if (stage === 7) {
//       setPeriod(undefined)
//       setStage(stage + 1)
//     } else if (stage === 8) {
//       if (rateTableType === RATE_TABLE_TYPES.ORGANISATION) {
//         costsService
//           .createRateTableDetail({
//             currency: currency,
//             work_type: workType,
//             location: location,
//             client: false,
//             draft: true,
//           })
//           .then(res => {
//             setSelectedRTD(res.body)
//             costsService
//               .createPeriod({
//                 name: 'initial period',
//                 startDate: period,
//                 endDate: null,
//                 rateTableDetailId: res.body.id,
//               })
//               .then(res => {
//                 if (res.status === 200) {
//                   setPeriod(res.body.startDate)
//                   setFullPeriod([res.body])
//                   setStage(13)
//                 }
//               })
//           })
//       } else {
//         //client table
//         costsService
//           .createRateTableDetail({
//             currency: currency,
//             work_type: workType,
//             location: location,
//             client: true,
//             draft: true,
//             rateTableDetails: rateTableTemplate,
//             client_name: clientName,
//           })
//           .then(res => {
//             const rtdId = res.body.id
//             setSelectedRTD(res.body)
//             costsService
//               .createPeriod({
//                 name: 'initial period',
//                 startDate: period,
//                 endDate: null,
//                 rateTableDetailId: res.body.id,
//               })
//               .then(res => {
//                 if (res.status === 200) {
//                   setFullPeriod([res.body])
//                   costsService.getRateTable(rtdId).then(res => {
//                     setRates(res.body)
//                     setStage(14)
//                   })
//                 }
//               })
//           })
//       }
//     } else if (stage === 13 || stage === 14) {
//       setShowSpinner(true)
//       if (validateRateTablePayload(ratePayload)) {
//         costsService.bulkCreateRates(ratePayload).then(() => {
//           costsService.getRateTableDetail(orgId).then(res => {
//             if (res.status === 200) {
//               setStage(7)
//               setLatestStage(7)
//               setRateTableDetails(res.body)
//               setFinaliseRatesFailed(false)
//               setShowSpinner(false)
//             }
//           })
//         })
//       } else {
//         setFinaliseRatesFailed(true)
//         setShowSpinner(false)
//       }
//     }
//   }
// }

export const getClientWelcomeBackScreen = (t, classes, stage, latestStage) => {
  return (
    <div data-test="welcome-screen">
      <Typography className={classes.textDiv} variant="h6">
        {t('organisationAdmin.costs.stageWB1')}
      </Typography>
      {stage === 1 && (
        <Typography className={classes.textDiv} variant="body1">
          {t('organisationAdmin.costs.stageWB2')}
        </Typography>
      )}
      {stage > 1 && stage < 5 && (
        <Typography className={classes.textDiv} variant="body1">
          {t('organisationAdmin.costs.stageWB3')}
        </Typography>
      )}
      {stage > 4 && (
        <Typography className={classes.textDiv} variant="body1">
          {t('organisationAdmin.costs.stageWB4')}
        </Typography>
      )}
      <CostsFlowDiagram
        stage={stage}
        noClick={true}
        latestStage={latestStage}
        showTitle={false}
      />
      <Typography className={classes.textDiv} variant="body1">
        {t('organisationAdmin.costs.stageWB5', {
          stage: stage > 1 ? '✅' : '👉',
        })}
      </Typography>
      <Typography className={classes.textDiv} variant="body1">
        {t('organisationAdmin.costs.stageWB6', {
          stage: stage > 2 ? '✅' : stage === 2 ? '👉' : '',
        })}
      </Typography>
      <Typography className={classes.textDiv} variant="body1">
        {t('organisationAdmin.costs.stageWB7', {
          stage: stage > 3 ? '✅' : stage === 3 ? '👉' : '',
        })}
      </Typography>
      <Typography className={classes.textDiv} variant="body1">
        {t('organisationAdmin.costs.stageWB8', {
          stage: stage > 4 ? '✅' : stage === 4 ? '👉' : '',
        })}
      </Typography>
      <Typography className={classes.textDiv} variant="body1">
        {t('organisationAdmin.costs.stageWB9', {
          stage: stage > 4 ? '👉' : '',
        })}
      </Typography>
    </div>
  )
}
