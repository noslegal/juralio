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

import PublishIcon from '@mui/icons-material/Publish'
import {
  Button,
  DialogContent,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import JuralioDialog from '../../dialog/juralio-dialog/JuralioDialog'
import organisationService from '../../../services/organisation/organisation-service'
import { fetchGroups } from '../../../admin/organisations/organisation-actions'
import GroupsIcon from '@mui/icons-material/Groups'
import { MAX_IMAGE_WIDTH, POSITIONS } from '../../../app/constants'
import resizeImageFile, {
  validateImageFile,
} from '../../../services/helpers/image-helper'
import juralioColours from '../../../theme/juralio-colours'

const style = makeStyles()(theme => ({
  wrapper: {
    height: `calc(100% - ${theme.spacing(11)})`,
  },
  textField: {
    width: '100%',
  },
  additionalTextField: {
    marginTop: theme.spacing(2),
  },
  preview: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    fontSize: theme.spacing(1.75),
  },
  logoSection: {
    marginTop: theme.spacing(2),
  },
  uploadButton: {
    color: juralioColours.greenBlue.primary,
    marginTop: theme.spacing(1),
  },
  imageInput: {
    visibility: 'hidden',
    height: 0,
  },
  imagePreview: {
    display: 'flex',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: theme.spacing(1),
    maxWidth: '100%',
  },
  imageName: {
    wordBreak: 'break-word',
    textAlign: 'center',
    marginTop: theme.spacing(1),
  },
  fileError: {
    color: 'red',
    marginTop: theme.spacing(1),
  },
}))

const CreateGroupDialog = props => {
  const { showDialog, setShowDialog, isSysadmin, groups } = props
  const dispatch = useDispatch()
  const { classes } = style()
  const { t } = useTranslation()

  const [error, setError] = useState(false)
  const [value, setValue] = useState('')
  const [postion, setPosition] = useState(0)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState(null)
  const [imageError, setImageError] = useState(null)
  const imageField = useRef(null)

  useEffect(() => {
    if (uploadedImage) {
      const url = URL.createObjectURL(uploadedImage)
      setUploadedPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setUploadedPreviewUrl(null)
    }
  }, [uploadedImage])

  useEffect(() => {
    if (groups && !isSysadmin) {
      setPosition(
        groups?.filter(g => g.isInternal === true)[0]?.defaultPosition.name ===
          POSITIONS.CLIENT.name
          ? POSITIONS.ADVISOR.value
          : POSITIONS.CLIENT.value
      )
    }
  }, [groups, isSysadmin])

  const handleCreate = () => {
    let payload = {
      name: value,
      isInternal: false,
      positionId: postion,
    }
    organisationService.saveGroup(props.orgId, payload).then(res => {
      const newGroupId = res.body?.id
      const afterLogo = () => {
        if (isSysadmin) {
          dispatch(fetchGroups())
          setShowDialog(false)
        } else {
          organisationService.getGroupsForOrg(props.orgId).then(groupsRes => {
            props.setSelectedOrgGroups(groupsRes.body)
            setShowDialog(false)
          })
        }
      }
      if (uploadedImage && newGroupId) {
        organisationService
          .setGroupLogo(props.orgId, newGroupId, uploadedImage)
          .then(afterLogo)
      } else {
        afterLogo()
      }
    })
  }

  const onImageChange = e => {
    if (e.target.files.length === 0) return
    const file = e.target.files[0]
    setImageError(null)
    const validationError = validateImageFile(file, t)
    if (validationError) {
      setUploadedImage(null)
      setImageError(validationError)
    } else {
      resizeImageFile(file, setUploadedImage, MAX_IMAGE_WIDTH)
    }
  }

  const checkGroupWithNameExists = name => {
    for (let index = 0; index < props.groups.length; index++) {
      const element = props.groups[index]
      if (element.name === name) {
        return true
      }
    }
    return false
  }

  return (
    <JuralioDialog
      disableSingleClickAction={true}
      actionLabel={t('common.confirm')}
      onClose={() => setShowDialog(false)}
      open={showDialog}
      handleCancel={() => {
        setShowDialog(false)
        setValue('')
      }}
      handleAction={() => {
        handleCreate()
      }}
      titleText={'Create new group'}
      disabled={error || value.length === 0}
      titleIcon={GroupsIcon}
    >
      <DialogContent>
        <div>
          <TextField
            className={classes.textField}
            value={value}
            onChange={e => {
              setError(null)
              if (e.target.value === '' || e.target.value === null) {
                setError(t('organisationAdmin.groups.emptyName'))
              } else if (checkGroupWithNameExists(e.target.value)) {
                setError(t('organisationAdmin.groups.nameInUse'))
              }
              setValue(e.target.value)
            }}
            label={'Name'}
            data-test="name-field"
            error={error}
            helperText={error ? error : value?.length + '/70'}
            slotProps={{ htmlInput: { maxLength: 70 } }}
          />
          <Typography sx={{ marginTop: '20px' }} variant="subtitle2">
            {t('organisationAdmin.groups.addDialogSubtitle')}
          </Typography>
          <Select
            sx={{ height: 'fit-content' }}
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={postion}
            label="Position"
            onChange={e => {
              setPosition(e.target.value)
            }}
            variant="outlined"
          >
            <MenuItem value={0}>{'Client'}</MenuItem>
            <MenuItem value={1}>{'Advisor'}</MenuItem>
          </Select>
          <div className={classes.logoSection}>
            <Typography variant="subtitle2">
              {t('organisationAdmin.groups.addDialogLogoLabel')}
            </Typography>
            <Button
              variant="outlined"
              className={classes.uploadButton}
              startIcon={<PublishIcon />}
              onClick={() => imageField.current.click()}
            >
              {t('sysAdmin.organisations.uploadImage')}
            </Button>
            <Typography variant="caption" color="text.secondary">
              {t('organisationAdmin.groups.uploadHelperText')}
            </Typography>
            <input
              type="file"
              ref={imageField}
              className={classes.imageInput}
              name="groupLogo"
              onChange={onImageChange}
            />
            {uploadedImage && uploadedPreviewUrl && (
              <div>
                <img
                  className={classes.imagePreview}
                  src={uploadedPreviewUrl}
                  alt={uploadedImage.name}
                />
                <Typography className={classes.imageName}>
                  {uploadedImage.name}
                </Typography>
              </div>
            )}
            {imageError && (
              <Typography className={classes.fileError}>
                {imageError}
              </Typography>
            )}
          </div>
        </div>
      </DialogContent>
    </JuralioDialog>
  )
}

export default CreateGroupDialog
