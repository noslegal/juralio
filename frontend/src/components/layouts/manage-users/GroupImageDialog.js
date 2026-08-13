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

import DeleteIcon from '@mui/icons-material/Delete'
import PublishIcon from '@mui/icons-material/Publish'
import {
  Button,
  DialogContent,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { StatusCodes } from 'http-status-codes'
import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import { MAX_IMAGE_WIDTH } from '../../../app/constants'
import { displaySnackbar } from '../../../app/global-snackbar/global-snackbar-actions'
import JuralioDialog from '../../dialog/juralio-dialog/JuralioDialog'
import resizeImageFile, {
  validateImageFile,
} from '../../../services/helpers/image-helper'
import organisationService from '../../../services/organisation/organisation-service'
import juralioColours from '../../../theme/juralio-colours'
import GroupAvatar from './GroupAvatar'

const useStyles = makeStyles()(theme => ({
  uploadButton: {
    color: juralioColours.greenBlue.primary,
  },
  uploadWrapper: {
    display: 'flex',
    marginLeft: theme.spacing(),
  },
  imageInput: {
    visibility: 'hidden',
  },
  fileError: {
    color: 'red',
    textAlign: 'center',
  },
  uploadHelperText: {
    color: juralioColours.darkText.secondary,
    marginTop: theme.spacing(1),
  },
  imagePreview: {
    display: 'flex',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  imageName: {
    wordBreak: 'break-word',
    textAlign: 'center',
    marginTop: theme.spacing(2),
  },
  deleteLogoButton: {
    display: 'flex',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: theme.spacing(),
    color: juralioColours.greenBlue.primary,
  },
  deleteLogo: {
    fill: juralioColours.named.black[200],
  },
}))

const GroupImageDialog = props => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const isMobileView = useMediaQuery(theme.breakpoints.down('md'))

  const imageField = useRef(null)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState(null)
  const [error, setError] = useState(null)
  const [currentImage, setCurrentImage] = useState(null)
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState(null)

  useEffect(() => {
    if (props.group.customLogo) {
      organisationService
        .getGroupLogo(props.orgId, props.group.id)
        .then(response => {
          if (response.status === StatusCodes.OK) {
            const existingLogoFile = new File(
              [response.body],
              t('organisationAdmin.groups.currentImage')
            )
            setCurrentImage(existingLogoFile)
            const url = URL.createObjectURL(existingLogoFile)
            setCurrentPreviewUrl(url)
          }
        })
    }
    return () => {
      setCurrentImage(null)
      setCurrentPreviewUrl(prev => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })
    }
  }, [props.group.customLogo, props.group.id, props.orgId, t])

  useEffect(() => {
    if (uploadedImage) {
      const url = URL.createObjectURL(uploadedImage)
      setUploadedPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setUploadedPreviewUrl(null)
    }
  }, [uploadedImage])

  const submitLogo = () => {
    organisationService
      .setGroupLogo(props.orgId, props.group.id, uploadedImage)
      .then(res => {
        if (res.status === StatusCodes.OK) {
          props.onLogoChange(props.group.id, true)
          props.onClose()
          dispatch(
            displaySnackbar(t('organisationAdmin.groups.successfulUpload'))
          )
        } else {
          setError(t('organisationAdmin.groups.failedUpload'))
        }
      })
  }

  const deleteLogo = () => {
    organisationService
      .deleteGroupLogo(props.orgId, props.group.id)
      .then(res => {
        if (res.status === StatusCodes.OK) {
          props.onLogoChange(props.group.id, false)
          props.onClose()
          dispatch(
            displaySnackbar(t('organisationAdmin.groups.successfulDelete'))
          )
          setCurrentImage(null)
          setUploadedImage(null)
        } else {
          setError(t('organisationAdmin.groups.failedDelete'))
        }
      })
  }

  const onImageChange = e => {
    if (e.target.files.length === 0) {
      return
    }
    const file = e.target.files[0]
    setError(null)
    const validationError = validateImageFile(file, t)
    if (validationError) {
      setUploadedImage(null)
      setError(validationError)
    } else {
      resizeImageFile(file, setUploadedImage, MAX_IMAGE_WIDTH)
    }
  }

  return (
    <JuralioDialog
      open={true}
      titleText={
        <Typography variant="h6">
          {t('organisationAdmin.groups.logoDialogTitle')}
        </Typography>
      }
      titleIcon={PublishIcon}
      handleCancel={props.onClose}
      onClose={props.onClose}
      fullScreen={isMobileView}
      handleAction={submitLogo}
      disabled={uploadedImage === null}
      actionLabel={t('sysAdmin.organisations.confirm')}
    >
      <DialogContent>
        <div className={classes.uploadWrapper} data-test="groupImageModal">
          <GroupAvatar
            group={props.group}
            orgId={props.orgId}
            editable={false}
          />
          <Button
            data-test="uploadGroupLogoButton"
            variant="outlined"
            className={classes.uploadButton}
            onClick={() => imageField.current.click()}
          >
            {t('sysAdmin.organisations.uploadImage')}
          </Button>
        </div>
        <Typography variant="caption" className={classes.uploadHelperText}>
          {t('organisationAdmin.groups.uploadHelperText')}
        </Typography>
        <input
          type="file"
          ref={imageField}
          className={classes.imageInput}
          name="groupLogo"
          data-test="hidden-group-logo-input"
          onChange={onImageChange}
        />

        {uploadedImage && uploadedPreviewUrl && (
          <div>
            <img
              className={classes.imagePreview}
              data-test="group-logo-preview"
              src={uploadedPreviewUrl}
              alt={uploadedImage.name}
            />
            <Typography className={classes.imageName}>
              {uploadedImage.name}
            </Typography>
          </div>
        )}

        {!uploadedImage && !error && currentImage && currentPreviewUrl && (
          <div>
            <img
              className={classes.imagePreview}
              data-test="group-logo-preview"
              src={currentPreviewUrl}
              alt={currentImage.name}
            />
            <Button
              variant="outlined"
              onClick={deleteLogo}
              className={classes.deleteLogoButton}
              data-test="delete-group-logo-button"
              endIcon={<DeleteIcon className={classes.deleteLogo} />}
            >
              {t('organisationAdmin.groups.deleteImage')}
            </Button>
          </div>
        )}

        {error && (
          <Typography
            data-test="group-logo-error-text"
            className={classes.fileError}
          >
            {error}
          </Typography>
        )}
      </DialogContent>
    </JuralioDialog>
  )
}

GroupImageDialog.propTypes = {
  group: PropTypes.object.isRequired,
  orgId: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onLogoChange: PropTypes.func.isRequired,
}

export default GroupImageDialog
