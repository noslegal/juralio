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

import { Button } from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import { LABEL_TYPES } from '../../../constants'
import LabelList from '../../../organisation/users/panels/components/LabelList'
import LabelMergeDialog from '../dialog/LabelMergeDialog'

const style = makeStyles()(theme => ({
  mergeButton: {
    marginLeft: 'auto',
    marginRight: theme.spacing(),
    padding: '3px 9px',
    fontSize: '13px',
  },
}))
const LabelAdminPanelUserDefinedTab = props => {
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
  } = props
  const { t } = useTranslation()
  const { classes } = style()
  const [showMerge, setShowMerge] = useState(false)
  return (
    <div>
      <LabelList
        labels={labels.userDefined}
        labelType={LABEL_TYPES.USER_DEFINED}
        editLabelId={editLabelId}
        setEditLabelId={setEditLabelId}
        showUsageCount={isMatterEditor}
        isLoaded={isLoaded}
        isCustomLabel={true}
        listId="userDefined"
        editHandlers={labelEditHandlers}
        listText={{
          title: t('matterAdmin.labels.userDefined'),
          disabledAddText: t('matterAdmin.labels.unableToAdd'),
          zeroState: t('matterAdmin.labels.zeroStates.userDefined'),
          add: t('labels.buttons.addUserDefinedLabel'),

          ...commonListText,
        }}
        tabChangeResetTasks={tabChangeResetTasks}
        isLabelLimitReached={isLabelLimitReached}
        additionalButton={
          labels.userDefined.length > 1 && (
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setShowMerge(true)}
              data-test="merge-hashtags"
              className={classes.mergeButton}
            >
              {t('matterAdmin.labels.mergeHashtags')}
            </Button>
          )
        }
      />

      {showMerge && (
        <LabelMergeDialog
          close={() => {
            setShowMerge(false)
          }}
          labels={labels.userDefined}
        />
      )}
    </div>
  )
}
export default LabelAdminPanelUserDefinedTab
