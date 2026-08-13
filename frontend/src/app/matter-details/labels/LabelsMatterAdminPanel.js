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
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import ClosedInfoBox from '../../../components/data-display/closed-info-box/ClosedInfoBox'
import { LabelsIcon } from '../../../theme/navigation/CommonIcons'
import rawColours from '../../../theme/raw-colours'
import { LABEL_TYPES } from '../../constants'
import PanelTitle from '../../organisation/users/panels/PanelTitle'
import LabelUsageDetailDialog from './dialog/LabelUsageDetailDialog'
import LabelAdminPanelRiskTab from './LabelAdminPanelTabs/LabelAdminPanelRiskTab'
import LabelAdminPanelUserDefinedTab from './LabelAdminPanelTabs/LabelAdminPanelUserDefinedTab'
import LabelAdminPanelWorkflowTab from './LabelAdminPanelTabs/LabelAdminPanelWorkflowTab'

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

const LabelsMatterAdminPanel = props => {
  const { classes } = useStyles()
  const {
    addNewHandler,
    deleteHandler,
    labels,
    matter,
    updateHandler,
    updateLabelNameHandler,
    isLoaded,
    isMatterEditor,
    isLabelLimitReached,
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

  const [selectedLabelUsage, setSelectedLabelUsage] = useState(null)
  const showLabelUsageDialog = label => {
    setSelectedLabelUsage(label)
  }

  const updateSelectedTab = value => {
    if (value === selectedTab) {
      return
    }
    resetTabStates()

    setSelectedTab(value)
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
    showLabelUsageDialog: showLabelUsageDialog,
  }

  const tabHeader =
    selectedTab === LABEL_TYPES.RISK
      ? t('matterAdmin.labels.riskHeader')
      : selectedTab === LABEL_TYPES.WORKFLOW
        ? t('matterAdmin.labels.workflowHeader')
        : t('labels.hashtags')

  return (
    <div className={classes.root}>
      {matter.matterStatus === 'closed' ? (
        <Paper style={{ padding: '24px' }}>
          <PanelTitle
            icon={<LabelsIcon />}
            header={t('matterAdmin.labels.header')}
            caption={''}
          />
          <ClosedInfoBox text={t('matterAdmin.labels.closedHelper')} />
        </Paper>
      ) : (
        <>
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
            <Tab
              label={t('labels.hashtags')}
              data-test="hashtag-tab"
              value={LABEL_TYPES.USER_DEFINED}
              className={classes.tab}
            />
          </Tabs>
          <Paper style={{ padding: '24px' }}>
            <PanelTitle
              icon={<LabelsIcon />}
              header={tabHeader}
              caption={t('matterAdmin.labels.subheader')}
            />
            {selectedTab === LABEL_TYPES.RISK && (
              <LabelAdminPanelRiskTab
                labels={labels}
                labelEditHandlers={labelEditHandlers}
                isMatterEditor={isMatterEditor}
                isLoaded={isLoaded}
                isLabelLimitReached={isLabelLimitReached}
                editLabelId={editLabelId}
                setEditLabelId={setEditLabelId}
                tabChangeResetTasks={tabChangeResetTasks}
                commonListText={commonListText}
              />
            )}
            {selectedTab === LABEL_TYPES.WORKFLOW && (
              <LabelAdminPanelWorkflowTab
                labels={labels}
                labelEditHandlers={labelEditHandlers}
                isMatterEditor={isMatterEditor}
                isLoaded={isLoaded}
                isLabelLimitReached={isLabelLimitReached}
                editLabelId={editLabelId}
                setEditLabelId={setEditLabelId}
                tabChangeResetTasks={tabChangeResetTasks}
                commonListText={commonListText}
                updateHandler={updateHandler}
              />
            )}
            {selectedTab === LABEL_TYPES.USER_DEFINED && (
              <LabelAdminPanelUserDefinedTab
                labels={labels}
                labelEditHandlers={labelEditHandlers}
                isMatterEditor={isMatterEditor}
                isLoaded={isLoaded}
                isLabelLimitReached={isLabelLimitReached}
                editLabelId={editLabelId}
                setEditLabelId={setEditLabelId}
                tabChangeResetTasks={tabChangeResetTasks}
                commonListText={commonListText}
                updateHandler={updateHandler}
              />
            )}

            {selectedLabelUsage && (
              <LabelUsageDetailDialog
                label={selectedLabelUsage}
                matter={matter}
                closeHandler={() => setSelectedLabelUsage(null)}
              />
            )}
          </Paper>
        </>
      )}
    </div>
  )
}

export default LabelsMatterAdminPanel
