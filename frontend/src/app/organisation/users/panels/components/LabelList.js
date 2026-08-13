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
import { Button, Tooltip, Typography } from '@mui/material'
import Skeleton from '@mui/material/Skeleton'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import { useIsViewOnly } from '../../../../../hooks/matter/viewer/matter-viewer-hooks'
import LabelAddEdit from './LabelAddEdit'
import LabelListItem from './LabelListItem'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginTop: theme.spacing(3),
  },
  header: {
    display: 'flex',

    marginBottom: theme.spacing(),
  },

  skeleton: {
    marginTop: 8,
  },
}))

const LabelList = props => {
  const { classes } = useStyles()
  const [isInAddMode, setIsInAddMode] = useState(false)
  const isViewOnly = useIsViewOnly({ activities: [] })
  const {
    editHandlers,
    editLabelId,
    isLabelLimitReached,
    isCustomLabel,
    isLoaded,
    labelType,
    labels,
    listId,
    listText,
    setEditLabelId,
    showUsageCount,
    tabChangeResetTasks,
  } = props

  if (!isLoaded) {
    return (
      <div className={classes.root}>
        <Typography className={classes.header} variant="overline">
          {listText.title}
        </Typography>
        {[1, 2, 3, 4, 5, 6].map(id => (
          <div className={classes.skeleton} key={listId + id}>
            <Skeleton
              variant="rectangular"
              animation="wave"
              width="100%"
              height="24"
            />
          </div>
        ))}
      </div>
    )
  }
  const addNewLabel = () => {
    setIsInAddMode(true)
    setEditLabelId(null)
  }
  const editLabel = id => {
    setIsInAddMode(false)
    setEditLabelId(id)
  }
  const cancelHandler = () => {
    setIsInAddMode(false)
  }
  if (tabChangeResetTasks) {
    tabChangeResetTasks.resetHandlers.push(cancelHandler)
    tabChangeResetTasks.resetHandlers.push(() => editLabel())
  }
  const isAddButtonDisabled =
    isInAddMode ||
    (editLabelId && editLabelId > 0) ||
    isLabelLimitReached ||
    isViewOnly
  const isZeroStateVisible = !isInAddMode && labels.length === 0

  return (
    <div className={classes.root} data-test={'list-' + listId}>
      <div className={classes.header}>
        <Typography
          className={classes.header}
          variant="overline"
          data-test="label-list-title"
        >
          {listText.title}
        </Typography>
        {props.additionalButton}
        {isCustomLabel && (
          <Tooltip title={isLabelLimitReached ? listText.disabledAddText : ''}>
            <div
              style={{
                float: props.additionalButton ? 'right' : '',
                marginLeft: !props.additionalButton ? 'auto' : '',
              }}
            >
              <Button
                data-test="add-label-button"
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<AddIcon />}
                disabled={isAddButtonDisabled}
                onClick={addNewLabel}
              >
                {listText.add}
              </Button>
            </div>
          </Tooltip>
        )}
      </div>

      {isInAddMode && (
        <LabelAddEdit
          labelName=""
          labelId="-1"
          labelType={labelType}
          editLabel={editLabel}
          saveHandler={editHandlers.add}
          cancelHandler={cancelHandler}
          placeHolderText={listText.addPlaceholder}
          saveText={listText.addNew}
          cancelText={listText.cancel}
        />
      )}
      {isZeroStateVisible ? (
        <Typography variant="caption" data-test="label-list-title-zero-state">
          {listText.zeroState}
        </Typography>
      ) : (
        labels.map(label =>
          label.id.toString() === editLabelId ? (
            <LabelAddEdit
              cancelHandler={cancelHandler}
              cancelText={listText.cancel}
              disabledAddText={listText.disabledAddText}
              editLabel={editLabel}
              labelId={label.id.toString()}
              labelName={label.name}
              saveHandler={editHandlers.updateLabelName}
              saveText={listText.save}
            />
          ) : (
            <LabelListItem
              key={label.id.toString()}
              label={label}
              isCustomLabel={isCustomLabel}
              deleteText={listText.delete}
              updateHandler={editHandlers.update}
              deleteHandler={editHandlers.delete}
              editLabel={editLabel}
              showUsageCount={showUsageCount}
              showLabelUsageDialog={editHandlers.showLabelUsageDialog}
              disabledTooltipText={listText.disabledEnableText}
              isLabelLimitReached={isLabelLimitReached}
            />
          )
        )
      )}
    </div>
  )
}

LabelList.propTypes = {
  listId: PropTypes.string,
  labelType: PropTypes.string,
  listText: PropTypes.object,
  editHandlers: PropTypes.object,
  editLabelId: PropTypes.func,
  isLabelLimitReached: PropTypes.bool.isRequired,
  isCustomLabel: PropTypes.bool,
  isLoaded: PropTypes.bool,
  labels: PropTypes.array.isRequired,
  setEditLabelId: PropTypes.func,
  showUsageCount: PropTypes.bool,
}

export default LabelList
