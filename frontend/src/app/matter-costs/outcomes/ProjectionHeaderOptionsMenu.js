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

import MoreVertIcon from '@mui/icons-material/MoreVert'
import {
  Button,
  CardContent,
  ClickAwayListener,
  Popover,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { withStyles } from 'tss-react/mui'
import juralioColours from '../../../theme/juralio-colours'
import matterCostsService from '../../../services/costs/matter-costs-service'
import { displayConfirmationDialog } from '../../global-confirmation-dialog/global-confirmation-dialog-actions'
import { displaySnackbar } from '../../global-snackbar/global-snackbar-actions'

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
    paddingLeft: '4px',
    paddingRight: '0px',
    width: '88px',
    paddingBottom: '8px !important',
    paddingTop: '8px',
  },
  dropdownOptionsButton: {
    textTransform: 'unset',
    color: juralioColours.darkText.secondary,
    marginTop: 'auto',
    marginBottom: 'auto',
    justifyContent: 'flex-start',
    textAlign: 'left',
  },
  wrapper: {
    display: 'flex',
    marginRight: theme.spacing(2),
  },
  divider: {
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(),
  },
  retireProjectionText: {
    color: 'rgba(0, 0, 0, 0.54)',
  },
})

const OptionsDropdown = props => {
  const { classes, canBeRetired, isViewOnly, isSnapshot = true } = props
  const dispatch = useDispatch()
  const { t } = useTranslation()

  const retireDisabled = !canBeRetired || isViewOnly
  const retireDisabledReason = isViewOnly
    ? t('matterProjection.retireViewOnlyTooltip')
    : t('matterProjection.retireDisabledTooltip')

  return (
    <>
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
            <Tooltip title={retireDisabled ? retireDisabledReason : ''}>
              <span>
                <Button
                  data-test="retire-option"
                  disabled={retireDisabled}
                  className={classes.dropdownOptionsButton}
                  onClick={e => {
                    e.stopPropagation()
                    props.setShowDropdown(false)
                    dispatch(
                      displayConfirmationDialog(
                        {
                          actionText: 'retire',
                          titleText: t(
                            'matterProjection.retireProjectionTitle'
                          ),
                          promptText: t(
                            'matterProjection.retireProjectionBody'
                          ),
                          extraComponent: (
                            <Typography
                              className={classes.retireProjectionText}
                            >
                              {t('matterProjection.retireProjectionBody2')}
                            </Typography>
                          ),
                          usageContext: 'retireProjection',
                          dontTranslatePromptText: true,
                          cancel: () => {},
                        },
                        () => {
                          const retireError = () =>
                            dispatch(
                              displaySnackbar(
                                t(
                                  'matterProjection.retireError',
                                  'Failed to retire projection, please try again'
                                )
                              )
                            )
                          matterCostsService
                            .updateCostSnapshot(
                              props.snapshotId,
                              props.matterId,
                              {
                                is_retired: true,
                              }
                            )
                            .then(res => {
                              if (res?.status !== 200) {
                                retireError()
                                return
                              }
                              if (props.onRetired) {
                                props.onRetired()
                                return
                              }
                              matterCostsService
                                .getCostStageData(props.matterId)
                                .then(stageRes => {
                                  if (stageRes?.status === 200) {
                                    props.setPageInfo(stageRes.body)
                                  }
                                })
                            })
                            .catch(retireError)
                        }
                      )
                    )
                  }}
                >
                  {t('matterProjection.retireAction', 'Retire')}
                </Button>
              </span>
            </Tooltip>

            <Button
              disabled={!isSnapshot}
              className={classes.dropdownOptionsButton}
              data-test="download-option"
              onClick={e => {
                e.stopPropagation()
                props.setShowDropdown(false)
                props.setShowDownloadDialog(true)
              }}
            >
              {t('matterProjection.downloadAction', 'Download')}
            </Button>
          </CardContent>
        </ClickAwayListener>
      </Popover>
    </>
  )
}

const ProjectionHeaderOptionsDropdown = props => {
  const anchorEl = useRef()
  const { classes, setShowDownloadDialog, isViewOnly } = props
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <div ref={anchorEl} className={classes.wrapper}>
      <MoreVertIcon
        onClick={e => {
          e.stopPropagation()
          setShowDropdown(true)
        }}
        data-test="options-button"
        className={classes.optionsButton}
      />

      {showDropdown && (
        <OptionsDropdown
          classes={classes}
          templateEditingActions={props.templateEditingActions}
          close={() => setShowDropdown(false)}
          anchorEl={anchorEl}
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
          setShowDownloadDialog={setShowDownloadDialog}
          matterId={props.matterId}
          snapshotId={props.snapshotId}
          setPageInfo={props.setPageInfo}
          canBeRetired={props.canBeRetired}
          data={props.data}
          isViewOnly={isViewOnly}
          isSnapshot={props.isSnapshot}
          onRetired={props.onRetired}
        />
      )}
    </div>
  )
}

export default withStyles(ProjectionHeaderOptionsDropdown, styles)
