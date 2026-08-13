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
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import JurWebLink from '../../assets/images/JurWebLink'
import JuralioDialog from '../../components/dialog/juralio-dialog/JuralioDialog'
import UrlInput from '../../components/flows/create-note-flow/UrlInput'
import { addMatterResource } from '../../redux/ducks/matter-resources'
import { addWorkstreamResource } from '../../redux/ducks/workstream-resources'
import { MAX_FIELD_LENGTHS } from '../constants'
import { addTemplateResource } from '../template/template-actions'
import LinkResourcePreview from './LinkResourcePreview'

const style = makeStyles()(theme => ({
  textField: {
    width: '100%',
  },
  preview: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    fontSize: theme.spacing(1.75),
  },
}))

const AddResourceDialog = props => {
  const { showResourceDialog, setShowResourceDialog } = props
  const dispatch = useDispatch()
  const { classes } = style()
  const { t } = useTranslation()

  const [resourceName, setResourceName] = useState('')
  const [url, setUrl] = useState('')
  const [urlError, setUrlError] = useState(false)

  const addResource = () => {
    if (props.isTemplate) {
      dispatch(
        addTemplateResource(props.projectId, resourceName, url, null)
      ).then(() => {
        setShowResourceDialog(false)
      })
    } else if (!props.projectId) {
      dispatch(addMatterResource(props.matterId, resourceName, url, null)).then(
        () => {
          setShowResourceDialog(false)
        }
      )
    } else {
      dispatch(
        addWorkstreamResource(
          props.matterId,
          props.projectId,
          resourceName,
          url,
          null
        )
      ).then(setShowResourceDialog(false))
    }
  }

  const isDisabled = resourceName === '' || url === '' || urlError

  return (
    <JuralioDialog
      actionLabel={t('common.add')}
      onClose={() => setShowResourceDialog(false)}
      open={showResourceDialog}
      handleCancel={() => setShowResourceDialog(false)}
      handleAction={addResource}
      titleText={t('createResource.addLink')}
      disabled={isDisabled}
      titleIcon={JurWebLink}
    >
      <DialogContent>
        <TextField
          className={classes.textField}
          value={resourceName}
          onChange={e => setResourceName(e.target.value)}
          label="Resource name"
          data-test="add-resource-name"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">{`${resourceName.length}/${MAX_FIELD_LENGTHS.RESOURCE_NAME}`}</InputAdornment>
              ),
            },

            htmlInput: { maxLength: 30 },
          }}
        />

        <UrlInput
          url={url}
          changeUrl={setUrl}
          isValidUrl={v => setUrlError(!v)}
        />
        {url.length > 0 && !urlError && (
          <Typography variant="overline" className={classes.preview}>
            {t('common.preview')}
          </Typography>
        )}
        {url.length > 0 && !urlError && (
          <LinkResourcePreview name={resourceName} url={url} />
        )}
      </DialogContent>
    </JuralioDialog>
  )
}

export default AddResourceDialog
