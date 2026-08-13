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

import { mdiFileExcel } from '@mdi/js'
import DeleteIcon from '@mui/icons-material/Delete'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import {
  Button,
  CardContent,
  ClickAwayListener,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Popover,
  SvgIcon,
} from '@mui/material'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { withStyles } from 'tss-react/mui'
import {
  showCopyTemplateDialog,
  showDeleteTemplateDialog,
  showExportTemplateDialog,
  updateTemplate,
  updateTemplateImageNoFetch,
} from '../../../../app/template/template-actions'
import { useIsViewOnly } from '../../../../hooks/matter/viewer/matter-viewer-hooks'
import { useUserAuthData, useUserRole } from '../../../../hooks/user-hooks'
import templateService from '../../../../services/template/template-service'
import { isKnowledgeManager } from '../../../../services/user/helper/user-role-service'
import juralioColours from '../../../../theme/juralio-colours'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import EditIcon from '@mui/icons-material/Edit'
import JurWebLink from '../../../../assets/images/JurWebLink'
import AddPhotoIcon from '@mui/icons-material/AddPhotoAlternate'
import UnsplashSearchContainer from '../../../unsplash/UnsplashSearchContainer'
import { getTemplateIdFromLocation } from '../../common/location-context-helper'
import AddResourceDialog from '../../../../app/matter-resources/AddResourceDialog'
import RenameDialog from '../../../../app/rename-dialog/RenameDialog'
import LightButton from '../../../inputs/light-button/LightButton'
import { useLocation } from 'react-router'

const styles = theme => ({
  optionsButton: {
    cursor: 'pointer',
    textTransform: 'unset',
    color: juralioColours.darkText.secondary,
    '&:hover': {
      color: juralioColours.darkText.disabled,
    },
  },
  dropdownWrapper: {
    position: 'absolute',
    right: theme.spacing(2),
    marginTop: theme.spacing(5.25),
  },
  dropdownContentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: theme.spacing(17),
    padding: theme.spacing(1.5),
  },
  dropdownOptionsButton: {
    textTransform: 'unset',
    color: juralioColours.darkText.secondary,
    marginTop: 'auto',
    marginBottom: 'auto',
    justifyContent: 'flex-start',
  },
  wrapper: {
    display: 'flex',
    marginRight: theme.spacing(2),
  },
  divider: {
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(),
  },
  optionsDropdownIcon: {
    height: theme.spacing(2),
    width: 'unset',
  },
})

const OptionsDropdown = props => {
  const {
    classes,
    setShowUnsplashSearch,
    setShowResourceDialog,
    setShowRenameDialog,
  } = props
  const dispatch = useDispatch()
  const isOrgAdmin = useSelector(state =>
    state.auth?.data?.auth?.roles.includes('ROLE_ORG_ADMIN')
  )
  const { t } = useTranslation()

  const userAuthData = useUserAuthData()
  const template = useSelector(state => state.template.template)
  const isSystemTemplate = template.isSystemTemplate
  const isPublished = template?.published

  const isViewOnly = useIsViewOnly({ activities: [] })
  const [downloadMenuAnchor, setDownloadMenuAnchor] = useState(null)

  if (!isKnowledgeManager(userAuthData)) return null

  return (
    <Popover
      open={props.showDropdown}
      anchorEl={props.anchorEl.current}
      className={classes.dropdownWrapper}
      onKeyDown={e => {
        if (e.keyCode === 27) {
          props.setShowDropdown(!props.showDropdown)
        }
      }}
    >
      <ClickAwayListener
        onClickAway={e => {
          e.stopPropagation()
          props.setShowDropdown(!props.showDropdown)
        }}
      >
        <CardContent className={classes.dropdownContentWrapper}>
          {isKnowledgeManager(userAuthData) && !isViewOnly && (
            <Button
              className={classes.dropdownOptionsButton}
              startIcon={<EditIcon />}
              data-test="rename-template"
              onClick={() => {
                setShowRenameDialog(true)
              }}
            >
              {t('common.rename')}
            </Button>
          )}
          {isKnowledgeManager(userAuthData) && !isViewOnly && (
            <Button
              className={classes.dropdownOptionsButton}
              startIcon={<JurWebLink />}
              data-test="add-resource"
              onClick={() => {
                setShowResourceDialog(true)
              }}
            >
              {t('operationMenuItem.addResource')}
            </Button>
          )}
          {isKnowledgeManager(userAuthData) && !isViewOnly && (
            <Button
              className={classes.dropdownOptionsButton}
              startIcon={<AddPhotoIcon />}
              data-test="add-image"
              onClick={e => {
                setShowUnsplashSearch(true)
              }}
            >
              {t('operationMenuItem.addImage')}
            </Button>
          )}
          <Divider className={classes.divider} />
          {!isViewOnly && (
            <Button
              className={classes.dropdownOptionsButton}
              startIcon={<FileCopyIcon />}
              data-test="menu-text-copy-template"
              onClick={() => {
                dispatch(showCopyTemplateDialog(true))
                props.close()
              }}
            >
              {t('operationMenuItem.copy')}
            </Button>
          )}
          {isPublished && isKnowledgeManager(userAuthData) && !isViewOnly && (
            <Button
              className={classes.dropdownOptionsButton}
              startIcon={<VisibilityOffIcon />}
              data-test="menu-text-unpublish-template"
              onClick={() => {
                if (isPublished) {
                } else {
                }

                dispatch(updateTemplate(template.id, { published: false }))
              }}
            >
              {t('common.unpublish')}
            </Button>
          )}
          {isOrgAdmin && !isSystemTemplate && !isViewOnly && (
            <Button
              className={classes.dropdownOptionsButton}
              data-test="menu-text-delete-template"
              startIcon={<DeleteIcon />}
              onClick={() => {
                dispatch(showDeleteTemplateDialog(true))
                props.close()
              }}
            >
              {t('operationMenuItem.delete')}
            </Button>
          )}
          <Divider className={classes.divider} />
          <>
            <Button
              className={classes.dropdownOptionsButton}
              startIcon={<FileDownloadIcon />}
              data-test="menu-text-download-template"
              onClick={e => setDownloadMenuAnchor(e.currentTarget)}
            >
              {t('common.download')}
            </Button>
            <Menu
              anchorEl={downloadMenuAnchor}
              open={Boolean(downloadMenuAnchor)}
              onClose={() => setDownloadMenuAnchor(null)}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
              <MenuItem
                data-test="menu-text-download-template-excel"
                onClick={() => {
                  setDownloadMenuAnchor(null)
                  dispatch(showExportTemplateDialog(true))
                  props.close()
                }}
              >
                <ListItemIcon>
                  <SvgIcon fontSize="small">
                    <path d={mdiFileExcel} />
                  </SvgIcon>
                </ListItemIcon>
                <ListItemText>
                  {t('operationMenuItem.downloadAsExcel')}
                </ListItemText>
              </MenuItem>
              <MenuItem
                data-test="menu-text-download-template-json"
                onClick={() => {
                  setDownloadMenuAnchor(null)
                  templateService.downloadTemplateAsJson(
                    template.id,
                    template.name
                  )
                  props.close()
                }}
              >
                <ListItemIcon>
                  <IntegrationInstructionsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>
                  {t('operationMenuItem.downloadAsJson')}
                </ListItemText>
              </MenuItem>
            </Menu>
          </>
        </CardContent>
      </ClickAwayListener>
    </Popover>
  )
}

const GlobalSubHeaderOptionsDropdown = props => {
  const anchorEl = useRef()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { classes, isOverview } = props
  const location = useLocation()
  const [showDropdown, setShowDropdown] = useState(false)
  const userRole = useUserRole()
  const [showUnsplashSearch, setShowUnsplashSearch] = useState(false)
  const [showResourceDialog, setShowResourceDialog] = useState(false)
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const template = useSelector(state => state.template.template)

  if (!userRole.isKnowledgeManager) {
    return <div className={classes.hiddenWrapper}>&nbsp;</div>
  }

  return (
    <div
      style={isOverview ? { marginLeft: 'auto' } : {}}
      ref={anchorEl}
      className={classes.wrapper}
    >
      {showRenameDialog && (
        <RenameDialog
          showRenameDialog={showRenameDialog}
          setShowRenameDialog={setShowRenameDialog}
        />
      )}
      {showResourceDialog && (
        <AddResourceDialog
          showResourceDialog={showResourceDialog}
          setShowResourceDialog={setShowResourceDialog}
          isTemplate={true}
          projectId={template.id}
        />
      )}
      {showUnsplashSearch && (
        <UnsplashSearchContainer
          anchorEl={anchorEl.current}
          onClose={() => {
            setShowUnsplashSearch(false)
          }}
          handleSelectedImage={(image, credit, artistName, tags) => {
            setShowUnsplashSearch(false)
            templateService.updateTemplate(
              getTemplateIdFromLocation(location),
              {
                url: image,
                urlCredit:
                  credit +
                  '?umt_source=Juralio+Template+Card+Background+Images&utm_medium=referral',
                urlCreditName: artistName,
                tags: tags,
              }
            )
            dispatch(updateTemplateImageNoFetch(image, credit, artistName))
          }}
        />
      )}
      {isOverview ? (
        <LightButton
          isNotStarted={false}
          caption={t('common.options')}
          clickHandler={() => {
            setShowDropdown(true)
          }}
          endIcon={
            <MoreVertIcon
              size="0.5"
              className={classes.optionsDropdownIcon}
              data-test="template-options-button"
            />
          }
        />
      ) : (
        <MoreVertIcon
          onClick={() => setShowDropdown(true)}
          data-test="template-options-button"
          className={classes.optionsButton}
        />
      )}

      {showDropdown && (
        <OptionsDropdown
          classes={classes}
          close={() => setShowDropdown(false)}
          anchorEl={anchorEl}
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
          setShowUnsplashSearch={setShowUnsplashSearch}
          setShowResourceDialog={setShowResourceDialog}
          setShowRenameDialog={setShowRenameDialog}
        />
      )}
    </div>
  )
}

export default withStyles(GlobalSubHeaderOptionsDropdown, styles)
