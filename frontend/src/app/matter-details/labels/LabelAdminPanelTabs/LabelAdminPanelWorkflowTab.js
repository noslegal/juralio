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

import React from 'react'
import { useTranslation } from 'react-i18next'
import { LABEL_TYPES } from '../../../constants'
import LabelList from '../../../organisation/users/panels/components/LabelList'
const LabelAdminPanelWorkflowTab = props => {
  const {
    labels,
    labelEditHandlers,
    isMatterEditor,
    isLoaded,
    isLabelLimitReached,
    editLabelId,
    setEditLabelId,
    tabChangeResetTasks,
    commonListText,
    updateHandler,
  } = props
  const { t } = useTranslation()
  return (
    <div>
      <LabelList
        listText={{
          disabledEnableText: t('matterAdmin.labels.unableToEnable'),
          title: t('matterAdmin.labels.standard'),
        }}
        labelType={LABEL_TYPES.WORKFLOW}
        labels={labels.workflow.system}
        editHandlers={labelEditHandlers}
        updateHandler={updateHandler}
        showUsageCount={isMatterEditor}
        isLoaded={isLoaded}
        isCustomLabel={false}
        listId="workflowsystem"
        isLabelLimitReached={isLabelLimitReached}
      />
      {labels.workflow.organisation.length > 0 && (
        <LabelList
          listText={{
            disabledEnableText: t('matterAdmin.labels.unableToEnable'),
            title: t('matterAdmin.labels.organisation'),
          }}
          labelType={LABEL_TYPES.WORKFLOW}
          labels={labels.workflow.organisation}
          editHandlers={labelEditHandlers}
          showUsageCount={isMatterEditor}
          isLoaded={isLoaded}
          isCustomLabel={false}
          listId="workfloworganisation"
          isLabelLimitReached={isLabelLimitReached}
        />
      )}
      <LabelList
        labels={labels.workflow.bespoke}
        labelType={LABEL_TYPES.WORKFLOW}
        editLabelId={editLabelId}
        setEditLabelId={setEditLabelId}
        showUsageCount={isMatterEditor}
        isLoaded={isLoaded}
        isCustomLabel={true}
        listId="workflowbespoke"
        editHandlers={labelEditHandlers}
        listText={{
          title: t('matterAdmin.labels.bespokeToMatter'),
          disabledAddText: t('matterAdmin.labels.unableToAdd'),
          add: t('labels.buttons.addWorkflowLabel'),
          zeroState: t('matterAdmin.labels.zeroStates.workflow'),
          ...commonListText,
        }}
        tabChangeResetTasks={tabChangeResetTasks}
        isLabelLimitReached={isLabelLimitReached}
      />
    </div>
  )
}
export default LabelAdminPanelWorkflowTab
