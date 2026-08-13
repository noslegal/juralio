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

import AddIcon from '@mui/icons-material/Add'
import {
  Button,
  ClickAwayListener,
  Paper,
  Popover,
  TextField,
  Typography,
} from '@mui/material'
import Autocomplete from '@mui/material/Autocomplete'
import Skeleton from '@mui/material/Skeleton'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import LabelChip from '../../../components/data-display/label-chip/LabelChip'
import colorModifiers from '../../../theme/color-modifiers'
import juralioColours from '../../../theme/juralio-colours'
import { EditIcon } from '../../../theme/navigation/CommonIcons'
import rawColours from '../../../theme/raw-colours'
import { LABELS, LABEL_TYPES, MAX_FIELD_LENGTHS } from '../../constants'
import { sortLabels } from './task-label-helpers'

const autoCompleteStyle = makeStyles()(theme => ({
  popperDisablePortal: {
    position: 'initial',
    width: `${theme.spacing(37.5)} !important`,
  },
  noOptions: {
    overflow: 'hidden',
    wordWrap: 'break-word',
  },
  paper: {
    width: theme.spacing(37.5),
    margin: 0,
  },
}))

const style = makeStyles()(theme => ({
  wrapper: {
    width: theme.spacing(45),
  },
  searchWrapper: {
    height: theme.spacing(7),
    width: '100%',
    backgroundColor: rawColours.primary.grey[100],
  },
  resultWrapper: {
    maxHeight: theme.spacing(29),
    overflow: 'auto',
  },
  searchField: {
    margin: theme.spacing(2),
    width: `calc(100% - ${theme.spacing(4)})`,
  },
  searchBar: {
    marginLeft: theme.spacing(),
    marginTop: theme.spacing(),
    width: theme.spacing(35.5),
  },
  labelSearchItem: {
    padding: theme.spacing(),
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: colorModifiers.primaryBackground(
        rawColours.primary.grey[200]
      ),
    },
  },
  addLabelWrapper: {
    width: '100%',
    display: 'flex',
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(),
  },
  addButton: {
    textTransform: 'none',
    textAlign: 'left',
    marginLeft: 'auto',
    marginRight: 'auto',
    width: theme.spacing(35.5),
    color: rawColours.primary.primary.main,
    justifyContent: 'flex-start',
  },
  addButtonText: {
    color: rawColours.primary.primary.main,
    wordBreak: 'break-word',
  },
  adviceHashtag: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    minHeight: theme.spacing(5),
    marginLeft: theme.spacing(),
    color: juralioColours.darkControl.backgroundPrimary,
  },
  editIcon: {
    color: juralioColours.named.black.main[200],
    paddingRight: theme.spacing(),
  },
  skeletonWrapper: {
    width: theme.spacing(37.5),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  skeleton: {
    margin: theme.spacing(0.5),
  },
  zeroState: {
    color: rawColours.primary.black.black,
  },
  errorState: {
    color: rawColours.primary.red.primary,
    margin: theme.spacing(),
    width: theme.spacing(37.5) - theme.spacing(2),
  },
  adviceNoMoreLabels: {
    width: theme.spacing(37.5),
    padding: theme.spacing(),
    color: juralioColours.darkControl.backgroundPrimary,
  },
}))

const LoadingSkeleton = () => {
  const { classes } = style()
  return (
    <div className={classes.skeletonWrapper}>
      <Skeleton
        variant="rectangular"
        width={250}
        className={classes.skeleton}
      />
      <Skeleton
        variant="rectangular"
        width={250}
        className={classes.skeleton}
      />
      <Skeleton
        variant="rectangular"
        width={250}
        className={classes.skeleton}
      />
    </div>
  )
}

const LabelSearchItem = props => {
  const classes = props.classes
  return (
    <div
      className={classes.labelSearchItem}
      onClick={e => {
        e.stopPropagation()
        if (props.label.type !== LABEL_TYPES.RISK) {
          props.completeAddLabelFlow(props.label.id)
        } else {
          document
            .getElementById(`modifiers-option-button-${props.label.id}`)
            .click()
        }
      }}
    >
      <LabelChip
        text={props.label.name}
        labelId={props.label.id.toString()}
        labelType={props.label.type}
        showModifiers={true}
        addMode={true}
        showLightBackground={false}
        handleModifierUpdate={modifier =>
          props.completeAddLabelFlow(props.label.id, modifier)
        }
      />
    </div>
  )
}

const AddLabelOption = props => {
  const { t } = useTranslation()
  const classes = props.classes
  return (
    <div className={classes.addLabelWrapper}>
      <Button
        variant="text"
        startIcon={<AddIcon />}
        disabled={props.disabled}
        className={classes.addButton}
        data-test="add-user-defined-label-button"
        onClick={props.createAndAddLabel}
      >
        <Typography className={classes.addButtonText}>
          {t('labels.addHashtask', { name: props.name.replace(/^#/, '') })}
        </Typography>
      </Button>
    </div>
  )
}

const ZeroState = () => {
  const { t } = useTranslation()
  const { classes } = style()
  return (
    <Typography className={classes.zeroState} variant="caption">
      {t('labels.addZeroState')}
    </Typography>
  )
}

const AddLabelFlow = props => {
  const { classes } = style()
  const autoCompleteClasses = autoCompleteStyle()
  const { allLabels, labels } = props
  const { t } = useTranslation()
  const [searchFilter, setSearchFilter] = useState('')
  const [invalidUserDefinedLabel, setInvalidUserDefinedLabel] = useState(false)

  let listSelection = null

  const matterHashTagCount = allLabels.filter(label => {
    return label.type === 'user_defined'
  }).length
  const hashTagLimitReached =
    matterHashTagCount + 1 > LABELS.COUNT_LIMIT.MATTER_HASHTAGS

  const filteredLabels = labels.filter(
    label =>
      label.name
        .toLowerCase()
        .includes(searchFilter.toLowerCase().replace(/^#/, '')) &&
      !label.inactive
  )

  const searchStringMatchesExistingTaskLabel =
    props.currentTaskLabels.filter(
      label =>
        label.name.toLowerCase() ===
        searchFilter.toLowerCase().replace(/^#/, '')
    ).length > 0

  const validateUserDefinedLabel = value => {
    if (!value.replace(/^#/, '').match('^[A-Za-z_]+[A-Za-z0-9_]*$')) {
      setInvalidUserDefinedLabel(true)
    } else {
      setInvalidUserDefinedLabel(false)
    }
  }

  const handleSearchChange = e => {
    if (!e) {
      return
    }
    if (typeof e.target.value === 'string') {
      setSearchFilter(e.target.value.slice(0, MAX_FIELD_LENGTHS.LABEL))
      validateUserDefinedLabel(e.target.value.slice(0, MAX_FIELD_LENGTHS.LABEL))
    }
  }
  const showAddOption =
    props.isLoaded &&
    searchFilter.length > 0 &&
    !invalidUserDefinedLabel &&
    !searchStringMatchesExistingTaskLabel &&
    !hashTagLimitReached

  const isOpen = props.isLoaded && (filteredLabels.length > 0 || !showAddOption)

  const isInZeroState = showAddOption && labels.length === 0

  return (
    <Popover open={true} anchorEl={props.anchorEl}>
      <ClickAwayListener
        onClickAway={() => {
          props.closeAddFlow()
        }}
      >
        <div
          style={{
            maxHeight: '300px',
          }}
        >
          <Autocomplete
            options={filteredLabels.sort(sortLabels)}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                props.closeAddFlow()
              }
              if (e.key === 'Enter') {
                if (listSelection && listSelection.type === 'risk') {
                  document
                    .getElementById(
                      `modifiers-option-button-${listSelection.id}`
                    )
                    .click()
                  return
                }
                const textEntry = searchFilter.replace(/^#/, '')
                if (textEntry.length > 0 && !invalidUserDefinedLabel) {
                  props.createAndAddLabel(textEntry)
                }
              }
            }}
            onHighlightChange={(event, option) => {
              listSelection = option
            }}
            classes={autoCompleteClasses}
            clearOnBlur={false}
            popupIcon={null}
            open={isOpen}
            onInputChange={handleSearchChange}
            inputValue={searchFilter}
            onChange={(e, v) => {
              e.stopPropagation()
              if (v == null) {
                return
              }
              if (v.type !== LABEL_TYPES.RISK) {
                props.completeAddLabelFlow(v.id)
              } else {
                document
                  .getElementById(`modifiers-option-button-${v.id}`)
                  .click()
              }
            }}
            renderInput={params => (
              <TextField
                {...params}
                className={classes.searchBar}
                placeholder={t('labels.search')}
                autoFocus
                data-test="label-search-field"
                variant="standard"
              />
            )}
            renderOption={(p, option) => (
              <LabelSearchItem
                classes={classes}
                label={option}
                completeAddLabelFlow={props.completeAddLabelFlow}
                {...props}
              />
            )}
            getOptionLabel={option => {
              return option.name
            }}
            noOptionsText={
              !showAddOption && searchStringMatchesExistingTaskLabel
                ? t('labels.errors.labelAlreadyAssigned', {
                    name: searchFilter,
                  })
                : ''
            }
            slots={{
              popper: Paper,
            }}
            slotProps={{
              listbox: {
                style: { paddingBottom: 0, height: '215px' },
              },
            }}
          />
          {!props.isLoaded && <LoadingSkeleton />}
          <div>
            {showAddOption && (
              <AddLabelOption
                name={searchFilter}
                classes={classes}
                disabled={invalidUserDefinedLabel}
                createAndAddLabel={() => {
                  props.createAndAddLabel(searchFilter.replace(/^#/, ''))
                }}
              />
            )}
            {!showAddOption &&
              searchFilter.length > 0 &&
              invalidUserDefinedLabel &&
              !searchStringMatchesExistingTaskLabel &&
              !hashTagLimitReached && (
                <Typography
                  className={classes.errorState}
                  variant="caption"
                  data-test="add-label-error-text"
                >
                  {t('labels.errors.invalidUserDefinedLabel')}
                </Typography>
              )}
            {isInZeroState && <ZeroState />}
          </div>
          {!showAddOption &&
            !searchStringMatchesExistingTaskLabel &&
            !invalidUserDefinedLabel &&
            !hashTagLimitReached && (
              <div className={classes.adviceHashtag}>
                <EditIcon className={classes.editIcon} />
                <Typography variant="body1">
                  {t('labels.advice.startTypingToAddHashTagLabel')}
                </Typography>
              </div>
            )}
          {hashTagLimitReached && (
            <div
              className={classes.adviceNoMoreLabels}
              data-test="no-more-labels-in-matter"
            >
              <Typography variant="body1">
                {t('labels.advice.noMoreMatterLabel')}
              </Typography>
            </div>
          )}
        </div>
      </ClickAwayListener>
    </Popover>
  )
}

export default AddLabelFlow
