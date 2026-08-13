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

import { Paper, Tab, Tabs } from '@mui/material'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import { LabelsIcon } from '../../../../theme/navigation/CommonIcons'
import rawColours from '../../../../theme/raw-colours'
import { LABEL_TYPES } from '../../../constants'
import LabelList from './components/LabelList'
import PanelTitle from './PanelTitle'

const useStyles = makeStyles()(theme => ({
  root: {
    width: '100%',
  },
  tab: {
    color: rawColours.primary.black[100],
    opacity: 1,
    '&.Mui-selected': {
      color: rawColours.primary.primary.main,
    },
  },
}))

const tabIndicatorProps = {
  style: { background: rawColours.primary.primary.main, marginTop: 8 },
}

const LabelsAdminPanel = props => {
  const { classes } = useStyles()
  const {
    addNewHandler,
    deleteHandler,
    isLabelLimitReached,
    isLoaded,
    labels,
    updateHandler,
    updateLabelNameHandler,
  } = props
  const { t } = useTranslation()
  const [selectedTab, setSelectedTab] = useState(LABEL_TYPES.RISK)
  const [editLabelId, setEditLabelId] = useState(null)
  const commonListText = {
    addNew: t('common.add'),
    cancel: t('common.cancel'),
    delete: t('common.delete'),
    addPlaceholder: t('labels.common.addPlaceholderText'),
    save: t('common.save'),
  }

  const updateSelectedTab = value => {
    if (value === selectedTab) {
      return
    }
    resetTabStates()
    setSelectedTab(
      selectedTab === LABEL_TYPES.RISK ? LABEL_TYPES.WORKFLOW : LABEL_TYPES.RISK
    )
  }
  const tabChangeResetTasks = { resetHandlers: [] }
  const resetTabStates = () => {
    tabChangeResetTasks.resetHandlers.forEach(job => job())
  }

  const updateLabelName = label => {
    updateLabelNameHandler(label)
  }

  const labelEditHandlers = {
    add: addNewHandler,
    update: updateHandler,
    updateLabelName: updateLabelName,
    delete: deleteHandler,
  }

  return (
    <div className={classes.root}>
      <Tabs
        value={selectedTab}
        onChange={(event, value) => updateSelectedTab(value)}
        position="static"
        elevation={0}
        indicatorColor="primary"
        slotProps={{
          indicator: tabIndicatorProps,
        }}
      >
        <Tab
          label={t('labels.risks')}
          data-test="risk-tab"
          value={LABEL_TYPES.RISK}
          className={classes.tab}
        />
        <Tab
          label={t('labels.workflow')}
          data-test="workflow-tab"
          value={LABEL_TYPES.WORKFLOW}
          className={classes.tab}
        />
      </Tabs>
      <Paper style={{ padding: '24px' }}>
        <PanelTitle
          icon={<LabelsIcon />}
          header={
            selectedTab === LABEL_TYPES.RISK
              ? t('organisationAdmin.labels.riskHeader')
              : t('organisationAdmin.labels.workflowHeader')
          }
          caption={t('organisationAdmin.labels.subheader')}
        />
        {selectedTab === LABEL_TYPES.RISK ? (
          <div>
            <LabelList
              listText={{
                disabledEnableText: t(
                  'organisationAdmin.labels.unableToEnable'
                ),
                title: t('labels.headers.standardLabels'),
              }}
              labelType={LABEL_TYPES.RISK}
              labels={labels.risks.system}
              editHandlers={labelEditHandlers}
              isLoaded={isLoaded}
              isCustomLabel={false}
              listId="risksystem"
              isLabelLimitReached={isLabelLimitReached}
            />
            <LabelList
              labels={labels.risks.organisation}
              labelType={LABEL_TYPES.RISK}
              editLabelId={editLabelId}
              setEditLabelId={setEditLabelId}
              isLoaded={isLoaded}
              isCustomLabel={true}
              listId="riskbespoke"
              editHandlers={labelEditHandlers}
              listText={{
                add: t('labels.buttons.addRiskLabel'),
                disabledAddText: t('organisationAdmin.labels.unableToAdd'),
                title: t('labels.headers.organisatonLabels'),
                zeroState: t('labels.zeroStates.organisationRisks'),
                ...commonListText,
              }}
              tabChangeResetTasks={tabChangeResetTasks}
              isLabelLimitReached={isLabelLimitReached}
            />
          </div>
        ) : (
          <div>
            <LabelList
              listText={{
                disabledEnableText: t(
                  'organisationAdmin.labels.unableToEnable'
                ),
                title: t('labels.headers.standardLabels'),
              }}
              labelType={LABEL_TYPES.WORKFLOW}
              labels={labels.workflow.system}
              editHandlers={labelEditHandlers}
              isLoaded={isLoaded}
              isCustomLabel={false}
              listId="workflowsystem"
              isLabelLimitReached={isLabelLimitReached}
            />
            <LabelList
              labels={labels.workflow.organisation}
              labelType={LABEL_TYPES.WORKFLOW}
              editLabelId={editLabelId}
              setEditLabelId={setEditLabelId}
              isLoaded={isLoaded}
              isCustomLabel={true}
              listId="workflowbespoke"
              editHandlers={labelEditHandlers}
              listText={{
                add: t('labels.buttons.addWorkflowLabel'),
                disabledAddText: t('organisationAdmin.labels.unableToAdd'),
                title: t('labels.headers.organisatonLabels'),
                zeroState: t('labels.zeroStates.organisationWorkflow'),

                ...commonListText,
              }}
              tabChangeResetTasks={tabChangeResetTasks}
              isLabelLimitReached={isLabelLimitReached}
            />
          </div>
        )}
      </Paper>
    </div>
  )
}

LabelsAdminPanel.propTypes = {
  addNewHandler: PropTypes.func.isRequired,
  deleteHandler: PropTypes.func.isRequired,
  isAddEnabled: PropTypes.bool,
  isLoaded: PropTypes.bool.isRequired,
  labels: PropTypes.object.isRequired,
  updateHandler: PropTypes.func.isRequired,
}
export default LabelsAdminPanel
