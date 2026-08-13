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

import { Button, CardContent, ClickAwayListener, Popover } from '@mui/material'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import { EditIcon } from '../../theme/navigation/CommonIcons'
import LightButton from '../../components/inputs/light-button/LightButton'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import DownloadIcon from '@mui/icons-material/Download'
import juralioColours from '../../theme/juralio-colours'
import RenameDialog from '../rename-dialog/RenameDialog'
import AddResourceDialog from '../matter-resources/AddResourceDialog'
import JurWebLink from '../../assets/images/JurWebLink'
import WorkstreamExportDialog from '../../components/dialog/workstream-export-dialog/WorkstreamExportDialog'
import GlobalSubHeaderOptionsDropdown from '../../components/navigation/global-header/global-sub-header/GlobalSubHeaderOptionsDropdown'
import { ACTIVITIES } from '../constants'
import { useSelector } from 'react-redux'

const useStyles = makeStyles()(theme => ({
  optionsDropdownIcon: {
    height: theme.spacing(2),
    width: 'unset',
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
}))

const OverviewOptionsContainer = props => {
  const { isMatterOverview, isTemplate, isViewOnly } = props
  const anchorEl = useRef()
  const [showOptionsMenu, setShowOptionsMenu] = useState(false)
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [showResourceDialog, setShowResourceDialog] = useState(false)
  const [showDownloadDialog, setShowDownloadDialog] = useState(false)
  const { classes } = useStyles()
  const { t } = useTranslation()
  const matterDetails = useSelector(state => state.matterDetails)
  const isMatterAdmin = matterDetails?.matter?.activities?.includes(
    ACTIVITIES.MATTER_ADMIN
  )

  if (isTemplate) {
    return (
      <GlobalSubHeaderOptionsDropdown
        isTemplate={isTemplate}
        isOverview={true}
      />
    )
  } else {
    return (
      <div ref={anchorEl} style={{ marginLeft: 'auto' }}>
        {showRenameDialog && (
          <RenameDialog
            showRenameDialog={showRenameDialog}
            setShowRenameDialog={setShowRenameDialog}
            isMatterOverview={isMatterOverview}
          />
        )}
        {showResourceDialog && (
          <AddResourceDialog
            showResourceDialog={showResourceDialog}
            setShowResourceDialog={setShowResourceDialog}
            isTemplate={false}
            matterId={props.matterId}
            projectId={isMatterOverview ? undefined : props.projectId}
          />
        )}
        {showDownloadDialog && (
          <WorkstreamExportDialog
            onClose={() => setShowDownloadDialog(false)}
            isTemplate={false}
          />
        )}
        {isViewOnly ? (
          <LightButton
            data-test="download-button"
            isNotStarted={false}
            caption={t('common.download')}
            clickHandler={() => {
              setShowDownloadDialog(true)
            }}
            endIcon={
              <DownloadIcon
                style={{ marginLeft: '8px' }}
                size="0.5"
                className={classes.optionsDropdownIcon}
                data-test="task-card-option-menu-button"
              />
            }
          />
        ) : (
          <LightButton
            data-test="options-button"
            isNotStarted={false}
            caption={t('common.options')}
            clickHandler={() => {
              setShowOptionsMenu(true)
            }}
            endIcon={
              <MoreVertIcon
                size="0.5"
                className={classes.optionsDropdownIcon}
                data-test="task-card-option-menu-button"
              />
            }
          />
        )}
        <Popover open={showOptionsMenu} anchorEl={anchorEl.current}>
          <ClickAwayListener
            onClickAway={e => {
              e.stopPropagation()
              setShowOptionsMenu(false)
            }}
          >
            <CardContent className={classes.dropdownContentWrapper}>
              {isMatterAdmin && (
                <Button
                  disabled={isViewOnly}
                  className={classes.dropdownOptionsButton}
                  startIcon={<EditIcon />}
                  data-test="rename-option"
                  onClick={() => {
                    setShowRenameDialog(true)
                    setShowOptionsMenu(false)
                  }}
                >
                  {t('common.rename')}
                </Button>
              )}

              <Button
                disabled={isViewOnly}
                className={classes.dropdownOptionsButton}
                startIcon={<JurWebLink />}
                data-test="add-resource-option"
                onClick={() => {
                  setShowResourceDialog(true)
                  setShowOptionsMenu(false)
                }}
              >
                {t('Add resource')}
              </Button>
              {(!isMatterOverview ||
                matterDetails?.matter?.projects?.length === 1) && (
                <Button
                  className={classes.dropdownOptionsButton}
                  startIcon={<DownloadIcon />}
                  data-test="download-option"
                  onClick={() => {
                    setShowOptionsMenu(false)
                    setShowDownloadDialog(true)
                  }}
                >
                  {t('common.download')}
                </Button>
              )}
            </CardContent>
          </ClickAwayListener>
        </Popover>
      </div>
    )
  }
}

export default OverviewOptionsContainer
