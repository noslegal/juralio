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

import {
  DialogContent,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import { MAX_FIELD_LENGTHS } from '../../../app/constants'
import IsWidthDown from '../../../hooks/width-helper'
import { TemplatesIcon } from '../../../theme/navigation/CommonIcons'
import JuralioDialog from '../../dialog/juralio-dialog/JuralioDialog'
import MatterSelect from '../../inputs/matter-select/MatterSelect'
import WorkstreamSelect from '../../inputs/workstream-select/WorkstreamSelect'

const styles = theme => ({
  radioGroup: {
    display: 'flex',
    flexDirection: 'row',
    paddingBottom: theme.spacing(2),
  },
  textEntryField: {
    width: '100%',
  },
  templateSourcePrompt: {
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(4),
  },
})

const CREATION_SOURCE = {
  SCRATCH: 'SCRATCH',
  PROJECT: 'PROJECT',
}

const CreateTemplateFlow = props => {
  const { t } = useTranslation()
  const [templateName, setTemplateName] = useState('')
  const [templateCreationSource, setTemplateCreationSource] = useState(
    CREATION_SOURCE.SCRATCH
  )
  const { classes } = makeStyles()(styles)()
  const [selectedMatterId, setSelectedMatterId] = useState(undefined)
  const [selectedProjectId, setSelectedProjectId] = useState(undefined)
  const [selectFirstProject, setSelectFirstProject] = useState(false)
  const [showLoadingBar, setShowLoadingBar] = useState(false)

  const onTemplateNameChange = e => setTemplateName(e.target.value)
  const onMatterChange = matter => {
    setSelectFirstProject(false)
    setSelectedMatterId(matter.id)
    if (matter.activeWorkstreams === 1) {
      setSelectFirstProject(true)
    }
  }
  const onProjectChange = project => setSelectedProjectId(project.id)

  const onCreate = () => {
    setShowLoadingBar(true)
    props.actions
      .createNewTemplate(selectedProjectId, templateName)
      .then(() => {
        props.cancelHandler()
      })
  }

  const disableCreateButton = () =>
    showLoadingBar ||
    (templateCreationSource === CREATION_SOURCE.PROJECT
      ? templateName === '' || !selectedMatterId || !selectedProjectId
      : templateName === '')

  const getFullScreenMode = () => IsWidthDown('sm', props.width)
  const handleRadioOptionChange = event =>
    setTemplateCreationSource(event.target.value)

  const renderTemplateNameInput = () => (
    <TextField
      className={classes.textEntryField}
      placeholder={t('templates.createTemplateNamePlaceholder')}
      data-test="new-template-name"
      onChange={onTemplateNameChange}
      value={templateName}
      slotProps={{
        htmlInput: { maxLength: MAX_FIELD_LENGTHS.TEMPLATE_NAME },
      }}
    />
  )

  const renderDestinationSelector = () =>
    templateCreationSource === CREATION_SOURCE.PROJECT ? (
      <>
        <Typography
          variant="body1"
          className={classes.templateSourcePrompt}
          data-test="templatise-prompt"
        >
          {t('templates.templateSourcePrompt')}
        </Typography>
        <MatterSelect onChange={onMatterChange} matterId={selectedMatterId} />
        <WorkstreamSelect
          key={selectedMatterId}
          selectionChangeHandler={onProjectChange}
          matterId={selectedMatterId}
          projectId={selectedProjectId}
          placeholder={t('common.chooseAWorkstream')}
          focus={!selectFirstProject && selectedMatterId && !selectedProjectId}
          selectFirstProject={selectFirstProject}
        />
      </>
    ) : null

  const renderRadioButtons = () => (
    <RadioGroup
      className={classes.radioGroup}
      aria-label="create-template-options"
      name="create-template-options"
      value={templateCreationSource}
      onChange={handleRadioOptionChange}
    >
      <FormControlLabel
        value="SCRATCH"
        control={<Radio />}
        label={t('templates.createFromScratch')}
        data-test={'create-from-scratch'}
      />
      <FormControlLabel
        value="PROJECT"
        control={<Radio />}
        label={t('templates.createFromProject')}
        data-test={'create-from-existing-project'}
      />
    </RadioGroup>
  )

  return (
    <JuralioDialog
      data-test="create-template-dialog"
      open={true}
      onClose={props.cancelHandler}
      fullScreen={getFullScreenMode()}
      titleText={t('templates.createTemplate')}
      titleIcon={TemplatesIcon}
      handleAction={onCreate}
      handleCancel={props.cancelHandler}
      actionLabel={t('common.create')}
      disabled={disableCreateButton()}
      usageContext="CreateTemplate"
      showLoadingBar={showLoadingBar}
      loadingText={t('templates.createTemplateFromWorkstreamLoadingText')}
    >
      <DialogContent>
        {renderRadioButtons()}
        {renderTemplateNameInput()}
        {renderDestinationSelector()}
      </DialogContent>
    </JuralioDialog>
  )
}

CreateTemplateFlow.propTypes = {
  cancelHandler: PropTypes.func.isRequired,
}

export default CreateTemplateFlow
