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

import { DialogContent } from '@mui/material'
import React, { useState } from 'react'
import EditGradeRatioTable from './EditGradeRatioTable'
import JuralioDialog from '../../../components/dialog/juralio-dialog/JuralioDialog'
import { useTranslation } from 'react-i18next'
import matterCostsService from '../../../services/costs/matter-costs-service'
import { getCostRatios } from './MatterCostsTableHelper'

const EditGradeRatioDialog = props => {
  const { gradeDialogType, matter, isSnapshot } = props
  const { t } = useTranslation()
  const [gradeHourPayload, setGradeHourPayload] = useState([])
  const [cantSave, setCantSave] = useState(true)
  const [showLoadingBar, setShowLoadingBar] = useState(false)
  return (
    <JuralioDialog
      showLoadingBar={showLoadingBar}
      titleIcon={null}
      titleText={
        isSnapshot
          ? t('matterRates.seeGradeRatios')
          : t('matterRates.editGradeRatiosTitle')
      }
      disabled={cantSave}
      actionLabel={t('common.save')}
      handleAction={() => {
        setShowLoadingBar(true)
        setCantSave(true || props.isSnapshot)
        matterCostsService
          .batchUpdateCostRatioData(matter.id, gradeHourPayload)
          .then(res => {
            if (res.status === 200) {
              matterCostsService.getCostStageData(matter.id).then(res => {
                if (res.status === 200) {
                  props.setPageInfo(res.body)
                  props.closeHandler()
                }
              })
            }
          })
      }}
      handleCancel={() => {
        props.closeHandler()
      }}
      open={props.display}
      largeSize={true}
    >
      <DialogContent>
        <EditGradeRatioTable
          isSnapshot={isSnapshot}
          fullPeriod={props.fullPeriod}
          matter={matter}
          matterId={matter.id}
          tasks={props.cteList}
          grades={
            gradeDialogType.matter
              ? props.costRatios
              : gradeDialogType.workstreamId
                ? getCostRatios(props.costRatios, {
                    task: {
                      projectId: matter.projects.filter(
                        x => x.id === gradeDialogType.workstreamId
                      )[0].id,
                    },
                  })
                : gradeDialogType.cteId
                  ? getCostRatios(
                      props.costRatios,
                      props.cteList.filter(
                        x => x.id === gradeDialogType.cteId
                      )[0]
                    )
                  : props.costRatios
          }
          setGradeHourPayload={setGradeHourPayload}
          setCantSave={setCantSave}
          gradeDialogType={gradeDialogType}
          workstreamName={
            gradeDialogType.workstreamId
              ? matter.projects.filter(
                  x => x.id === gradeDialogType.workstreamId
                )[0].name
              : ''
          }
          resetRatios={() => {
            let x = gradeDialogType
            x.projectionPeriodId = props.fullPeriod.id
            setCantSave(true)
            matterCostsService
              .resetCostRatios(matter.id, gradeDialogType)
              .then(res => {
                if (res.status === 200) {
                  matterCostsService.getCostStageData(matter.id).then(res => {
                    if (res.status === 200) {
                      props.setPageInfo(res.body)
                      props.closeHandler()
                    }
                  })
                }
              })
          }}
        />
      </DialogContent>
    </JuralioDialog>
  )
}
export default EditGradeRatioDialog
