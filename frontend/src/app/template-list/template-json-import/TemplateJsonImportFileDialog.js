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

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import TaskIcon from '@mui/icons-material/Task'
import {
  Box,
  DialogContent,
  IconButton,
  Link,
  TextField,
  Typography,
} from '@mui/material'
import PropTypes from 'prop-types'
import React, { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import { MAX_FIELD_LENGTHS } from '../../constants'
import JuralioDialog from '../../../components/dialog/juralio-dialog/JuralioDialog'

const formatFileSize = bytes => {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  return `${Math.round(bytes / 1000)} KB`
}

const useStyles = makeStyles()(theme => ({
  dropZone: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1.5px dashed ${theme.palette.divider}`,
    borderRadius: theme.spacing(1),
    padding: theme.spacing(4, 3),
    cursor: 'pointer',
    transition: 'border-color 0.2s, background-color 0.2s',
    userSelect: 'none',
    '&:hover': {
      borderColor: theme.palette.primary.main,
      backgroundColor: `${theme.palette.primary.main}08`,
    },
  },
  dropZoneActive: {
    borderColor: theme.palette.primary.main,
    backgroundColor: `${theme.palette.primary.main}0d`,
  },
  iconBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: theme.spacing(6),
    height: theme.spacing(6),
    borderRadius: theme.spacing(1),
    backgroundColor: theme.palette.action.hover,
    border: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(1.5),
  },
  uploadLabel: {
    marginBottom: theme.spacing(0.5),
    display: 'flex',
    gap: theme.spacing(0.5),
    whiteSpace: 'nowrap',
  },
  helperRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(0.5),
  },
  helperText: {
    color: theme.palette.text.secondary,
  },
  infoIcon: {
    fontSize: '1rem',
    color: theme.palette.text.secondary,
    cursor: 'pointer',
  },
  fileCard: {
    display: 'flex',
    alignItems: 'center',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.spacing(1),
    padding: theme.spacing(1.5, 2),
    marginBottom: theme.spacing(2.5),
  },
  fileCardError: {
    alignItems: 'flex-start',
    borderColor: theme.palette.error.main,
    backgroundColor: `${theme.palette.error.main}08`,
    marginBottom: theme.spacing(1.5),
  },
  fileCardIcon: {
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(1.5),
    flexShrink: 0,
  },
  fileCardIconError: {
    color: theme.palette.error.main,
    marginTop: theme.spacing(0.25),
  },
  fileCardInfo: {
    flex: 1,
    minWidth: 0,
  },
  fileCardName: {
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  fileCardSubtitle: {
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.25),
  },
  tryAgain: {
    marginTop: theme.spacing(0.5),
    fontWeight: 700,
    cursor: 'pointer',
  },
  deleteIconError: {
    color: theme.palette.error.main,
    marginTop: theme.spacing(0.25),
  },
  fileCardSize: {
    color: theme.palette.text.secondary,
  },
  errorSection: {
    marginBottom: theme.spacing(2),
  },
  errorSectionLabel: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.5),
  },
  errorRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
  },
  errorText: {
    color: theme.palette.error.main,
  },
  nameLabel: {
    marginBottom: theme.spacing(0.5),
    fontWeight: 500,
  },
  nameHelper: {
    marginTop: theme.spacing(0.5),
    color: theme.palette.text.secondary,
  },
  hiddenInput: {
    display: 'none',
  },
  uploadLink: {
    cursor: 'pointer',
    fontWeight: 600,
  },
  findOutMoreLink: {
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  },
}))

const TemplateJsonImportFileDialog = ({
  onSubmit,
  onFilePicked,
  cancelHandler,
  errorMessage,
  isLoading,
}) => {
  const { t } = useTranslation()
  const { classes, cx } = useStyles()
  const fileInputRef = useRef(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [templateName, setTemplateName] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const hasError = !!errorMessage
  const isFileSelected = !!selectedFile

  const pickFile = useCallback(
    file => {
      setSelectedFile(file)
      if (onFilePicked) onFilePicked(file.size, file)
    },
    [onFilePicked]
  )

  const handleFileChange = e => {
    const file = e.target.files[0]
    if (file) pickFile(file)
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setTemplateName('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (onFilePicked) onFilePicked(null)
  }

  const handleAction = () => {
    if (!selectedFile || !templateName.trim() || hasError) return
    onSubmit(selectedFile, templateName.trim())
  }

  const handleDragOver = useCallback(e => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(e => {
    e.preventDefault()
    if (e.currentTarget.contains(e.relatedTarget)) return
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    e => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (!file) return
      pickFile(file)
    },
    [pickFile]
  )

  return (
    <JuralioDialog
      open={true}
      titleText={t('templateJsonImport.selectFileTitle')}
      titleIcon={FileUploadIcon}
      actionLabel={t('common.create')}
      disabled={!selectedFile || !templateName.trim() || hasError || isLoading}
      handleAction={handleAction}
      handleCancel={cancelHandler}
      showLoadingBar={isLoading}
      loadingText={t('templateJsonImport.importingText')}
      disableSingleClickAction={true}
    >
      <DialogContent>
        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          className={classes.hiddenInput}
          onChange={handleFileChange}
          data-test="json-import-file-input"
        />

        {!isFileSelected && (
          <Box
            className={cx(
              classes.dropZone,
              isDragging && classes.dropZoneActive
            )}
            onClick={() => fileInputRef.current.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            data-test="json-import-drop-zone"
          >
            <Box className={classes.iconBox}>
              <FileUploadIcon />
            </Box>
            <Typography variant="body2" className={classes.uploadLabel}>
              <Link component="span" className={classes.uploadLink}>
                {t('templateJsonImport.clickToUpload')}
              </Link>
              {t('templateJsonImport.orDragAndDrop')}
            </Typography>
            <Box className={classes.helperRow}>
              <Typography variant="caption" className={classes.helperText}>
                {t('templateJsonImport.selectFileHelper')}
              </Typography>
            </Box>
          </Box>
        )}

        {isFileSelected && (
          <>
            <Box
              className={cx(
                classes.fileCard,
                hasError && classes.fileCardError
              )}
              data-test="json-import-file-card"
            >
              <TaskIcon
                className={cx(
                  classes.fileCardIcon,
                  hasError && classes.fileCardIconError
                )}
              />
              <Box className={classes.fileCardInfo}>
                <Typography
                  variant="body2"
                  className={classes.fileCardName}
                  data-test="json-import-file-name"
                >
                  {selectedFile.name}
                </Typography>
                {hasError ? (
                  <>
                    <Typography
                      variant="body2"
                      className={classes.fileCardSubtitle}
                    >
                      {t('templateJsonImport.errorCardSubtitle')}
                    </Typography>
                    <Link
                      component="span"
                      variant="body2"
                      className={classes.tryAgain}
                      onClick={() => fileInputRef.current.click()}
                      data-test="json-import-try-again"
                    >
                      {t('templateJsonImport.tryAgain')}
                    </Link>
                  </>
                ) : (
                  <Typography
                    variant="caption"
                    className={classes.fileCardSize}
                  >
                    {formatFileSize(selectedFile.size)}
                  </Typography>
                )}
              </Box>
              <IconButton
                size="small"
                onClick={handleRemoveFile}
                data-test="json-import-remove-file"
                aria-label={t('common.delete')}
                className={hasError ? classes.deleteIconError : undefined}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>

            {hasError && (
              <Box
                className={classes.errorSection}
                data-test="json-import-error"
              >
                <Typography
                  variant="body2"
                  className={classes.errorSectionLabel}
                >
                  {t('templateJsonImport.errorSectionLabel')}
                </Typography>
                <Box className={classes.errorRow}>
                  <Typography variant="body2" className={classes.errorText}>
                    {errorMessage}
                  </Typography>
                </Box>
              </Box>
            )}

            {!hasError && (
              <>
                <Typography variant="body2" className={classes.nameLabel}>
                  {t('templateJsonImport.renamePlaceholder')}
                </Typography>
                <TextField
                  value={templateName}
                  fullWidth
                  size="small"
                  inputProps={{ maxLength: MAX_FIELD_LENGTHS.TEMPLATE_NAME }}
                  onChange={e => setTemplateName(e.target.value)}
                  data-test="json-import-rename-field"
                  autoFocus
                />
                <Typography variant="caption" className={classes.nameHelper}>
                  {t('templateJsonImport.nameHelper')}
                </Typography>
              </>
            )}
          </>
        )}
      </DialogContent>
    </JuralioDialog>
  )
}

TemplateJsonImportFileDialog.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onFilePicked: PropTypes.func,
  cancelHandler: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  isLoading: PropTypes.bool,
}

export default TemplateJsonImportFileDialog
