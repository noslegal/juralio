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
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import { MAX_IMAGE_WIDTH } from '../../../app/constants'
import { displaySnackbar } from '../../../app/global-snackbar/global-snackbar-actions'
import JuralioDialog from '../../../components/dialog/juralio-dialog/JuralioDialog'
import resizeImageFile, {
  validateImageFile,
} from '../../../services/helpers/image-helper'
import organisationService from '../../../services/organisation/organisation-service'
import juralioColours from '../../../theme/juralio-colours'
import OrganisationAvatar from '../common/OrganisationAvatar'
import {
  hideOrganisationEditModal,
  updateDisplayedOrgLogos,
} from '../organisation-actions'

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

const OrganisationImageDialog = props => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const isMobileView = useMediaQuery(theme.breakpoints.down('md'))
  const organisation = useSelector(
    state => state.organisation?.editOrganisation
  )

  const imageField = useRef(null)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [error, setError] = useState(null)
  const [currentImage, setCurrentImage] = useState(null)

  useEffect(() => {
    if (organisation.id !== null && organisation.customLogo) {
      organisationService
        .getOrganisationLogo(organisation.id)
        .then(response => {
          if (response.status === StatusCodes.OK) {
            const existingLogoFile = new File(
              [response.body],
              t('sysAdmin.organisations.currentImage')
            )
            setCurrentImage(existingLogoFile)
          }
        })
    }
    return () => setCurrentImage(null)
  }, [organisation.customLogo, organisation.id, t])

  const handleClick = e => {
    //using a ref with hidden input to display MUI elements to user rather than styling an input to look like one
    imageField.current.click()
  }

  const closeModal = () => dispatch(hideOrganisationEditModal())

  const submitLogo = () => {
    organisationService
      .setOrganisationLogo(organisation.id, uploadedImage)
      .then(res => {
        if (res.status === StatusCodes.OK) {
          organisation.customLogo = true
          dispatch(updateDisplayedOrgLogos(organisation))
          closeModal()
          dispatch(
            displaySnackbar(t('sysAdmin.organisations.successfulUpload'))
          )
        } else {
          setError(t('sysAdmin.organisations.failedUpload'))
        }
      })
  }

  const deleteLogo = () => {
    organisationService.deleteOrganisationLogo(organisation.id).then(res => {
      if (res.status === StatusCodes.OK) {
        organisation.customLogo = false
        dispatch(updateDisplayedOrgLogos(organisation))
        closeModal()
        dispatch(displaySnackbar(t('sysAdmin.organisations.successfulDelete')))
        setCurrentImage(null)
        setUploadedImage(null)
      } else {
        setError(t('sysAdmin.organisations.failedDelete'))
      }
    })
  }

  const onImageChange = e => {
    if (e.target.files.length === 0) {
      // used when user cancels out of file select
      return
    }

    const uploadedImage = e.target.files[0]

    setError(null)

    const validationError = validateImageFile(uploadedImage, t)
    if (validationError) {
      setUploadedImage(null)
      setError(validationError)
    } else {
      resizeImageFile(uploadedImage, setUploadedImage, MAX_IMAGE_WIDTH)
    }
  }

  return (
    <JuralioDialog
      open={true}
      titleText={
        <div>
          <Typography variant="h6">
            {t('sysAdmin.organisations.organisationImage')}
          </Typography>
        </div>
      }
      titleIcon={PublishIcon}
      handleCancel={closeModal}
      onClose={closeModal}
      fullScreen={isMobileView}
      handleAction={submitLogo}
      disabled={uploadedImage === null}
      actionLabel={t('sysAdmin.organisations.confirm')}
    >
      <DialogContent>
        <div
          className={classes.uploadWrapper}
          data-test={'organisationImageModal'}
        >
          <OrganisationAvatar
            organisation={props.organisation}
            editable={false}
          />
          <Button
            data-test="uploadOrganaisationLogoButton"
            variant="outlined"
            className={classes.uploadButton}
            onClick={handleClick}
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
          name="myImage"
          data-test="hidden-logo-input"
          onChange={onImageChange}
        />

        {uploadedImage && (
          <div>
            <img
              className={classes.imagePreview}
              data-test={'organisation-logo-preview'}
              src={URL.createObjectURL(uploadedImage)}
              alt={uploadedImage.name}
            />
            <Typography
              data-test={'organisationLogoFileName'}
              className={classes.imageName}
            >
              {uploadedImage.name}
            </Typography>
          </div>
        )}

        {!uploadedImage && !error && currentImage && (
          <div>
            <img
              className={classes.imagePreview}
              data-test={'organisation-logo-preview'}
              src={URL.createObjectURL(currentImage)}
              alt={currentImage.name}
            />

            <Button
              variant="outlined"
              onClick={deleteLogo}
              className={classes.deleteLogoButton}
              data-test="delete-logo-button"
              endIcon={<DeleteIcon className={classes.deleteLogo} />}
            >
              {t('sysAdmin.organisations.deleteImage')}
            </Button>
          </div>
        )}

        {error && (
          <Typography
            data-test={'organisation-logo-error-text'}
            className={classes.fileError}
          >
            {error}
          </Typography>
        )}
      </DialogContent>
    </JuralioDialog>
  )
}

OrganisationImageDialog.propTypes = {
  organisation: PropTypes.object,
}

export default OrganisationImageDialog
