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

import { Button, Typography } from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import InfoTooltip from '../../../../../components/data-display/info-tooltip/InfoTooltip'
import LabelChip from '../../../../../components/data-display/label-chip/LabelChip'
import ToggleWithLabel from '../../../../../components/data-display/toggle-with-label/ToggleWithLabel'
import { isInOrganisationContext } from '../../../../../components/navigation/common/location-context-helper'
import JuralioLink from '../../../../../components/navigation/juralio-link/JuralioLink'
import { getDateDisplayString } from '../../../../../services/helpers/date-helper'
import { DeleteIcon } from '../../../../../theme/navigation/CommonIcons'
import { DATE_FORMAT_DAY_MONTH_YEAR } from '../../../../constants'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(),
  },
  chipLink: {
    display: 'flex',
    gap: theme.spacing(),
    alignItems: 'baseline',
    fontSize: 12,
    minWidth: theme.spacing(40),
  },
  createdDate: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: theme.spacing(0.5),
  },
  disabledLabelContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  infoIcon: {
    paddingLeft: theme.spacing(1),
  },
  deleteButtonWrapper: {
    display: 'flex',
  },
  deletedText: {
    paddingLeft: theme.spacing() - 3,
    fontStyle: 'italic',
  },
}))

const LabelListItem = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()

  const location = useLocation()
  const isInOrganisation = isInOrganisationContext(location)
  const userDetails = useSelector(state => state.auth.data.details)

  const isViewOnly = userDetails.roles.includes('FROZEN_ORG_USER')

  const {
    deleteHandler,
    deleteText,
    disabledTooltipText,
    editLabel,
    isLabelLimitReached,
    isCustomLabel,
    label,
    showLabelUsageDialog,
    showUsageCount,
    updateHandler,
  } = props

  const isAddEnabled = !isLabelLimitReached && !isViewOnly
  const countText = (
    <div>
      {t('labels.taskCount.usedIn')} <strong>{label.usageCount}</strong>{' '}
      {label.usageCount > 1
        ? t('labels.taskCount.taskPlural')
        : t('labels.taskCount.taskSingular')}
    </div>
  )

  if (
    label.inactive &&
    label.matterId &&
    !label.system &&
    !label.organisation
  ) {
    return (
      <div className={classes.root} data-test="deleted-label-list-item">
        <div className={classes.chipLink}>
          <LabelChip
            text={label.name}
            labelType={label.type}
            labelId={label.id.toString()}
            showStrikethroughText={true}
            isReadOnly={isViewOnly}
            handleModifierUpdate={() => {}}
            addMode={false}
          />
          {showUsageCount && label.usageCount > 0 && (
            <JuralioLink
              data-test="label-usage-count-link"
              value={countText}
              onClick={() => showLabelUsageDialog(label)}
            />
          )}
        </div>
        <div
          className={classes.deletedText}
          data-test="deleted-label-list-item-right-text"
        >
          <Typography variant="caption">
            {t('matterAdmin.labels.deleted')}
          </Typography>
        </div>
      </div>
    )
  }

  return (
    <div className={classes.root}>
      <div className={classes.chipLink}>
        <LabelChip
          text={label.name}
          labelType={label.type}
          labelId={label.id.toString()}
          showEditIcon={isCustomLabel}
          editLabel={editLabel}
          isReadOnly={isViewOnly}
          handleModifierUpdate={() => {}}
          addMode={false}
        />
        {showUsageCount && label.usageCount > 0 && (
          <JuralioLink
            data-test="label-usage-count-link"
            value={countText}
            onClick={() => showLabelUsageDialog(label)}
          />
        )}
      </div>
      {isCustomLabel ? (
        <div className={classes.deleteButtonWrapper}>
          <Button
            data-test="delete-label-button"
            variant="text"
            color="primary"
            size="small"
            disabled={isViewOnly}
            startIcon={<DeleteIcon />}
            onClick={() => deleteHandler(label.id.toString(), label.name)}
          >
            {deleteText}
          </Button>
          {isCustomLabel && label.organisation && (
            <div
              className={classes.createdDate}
              data-test="label-creation-date"
            >
              <InfoTooltip
                text={`${t('common.created')} ${getDateDisplayString(
                  label.dateCreated
                )}`}
              />
            </div>
          )}
        </div>
      ) : (
        <ToggleWithLabel
          item={label}
          checked={!label.inactive}
          disabledTooltipText={disabledTooltipText}
          updateHandler={updateHandler}
          enabled={
            isAddEnabled || (!isAddEnabled && !label.inactive && !isViewOnly)
          }
          isAddEnabled={isAddEnabled}
          labelText={{
            on: t('labels.enabled'),
            off: (
              <div className={classes.disabledLabelContainer}>
                {t('labels.disabled')}
                <div className={classes.infoIcon}>
                  <InfoTooltip
                    text={
                      <>
                        <Typography>
                          {t('labels.disabledSince', {
                            date: getDateDisplayString(
                              label.inactiveSince,
                              DATE_FORMAT_DAY_MONTH_YEAR,
                              true
                            ),
                          })}
                        </Typography>
                        <Typography>
                          {isInOrganisation
                            ? t('labels.disabledExplanation_orgContext')
                            : t('labels.disabledExplanation')}
                        </Typography>
                      </>
                    }
                  />
                </div>
              </div>
            ),
          }}
        />
      )}
    </div>
  )
}

LabelListItem.propTypes = {
  deleteText: PropTypes.string,
  deleteHandler: PropTypes.func,
  isCustomLabel: PropTypes.bool,
  label: PropTypes.object.isRequired,
  editLabel: PropTypes.func,
  updateHandler: PropTypes.func,
  showUsageCount: PropTypes.bool,
}

export default LabelListItem
