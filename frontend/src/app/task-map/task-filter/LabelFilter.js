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

import CloseIcon from '@mui/icons-material/Close'
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  ListItem,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import LabelChip from '../../../components/data-display/label-chip/LabelChip'
import colorModifiers from '../../../theme/color-modifiers'
import rawColours from '../../../theme/raw-colours'
import { LABEL_TYPES, MAX_FIELD_LENGTHS } from '../../constants'
import { sortByRisk } from '../../task-details/task-label/task-label-helpers'
import { useDispatch, useSelector } from 'react-redux'
import { taskFilterActions } from './task-filter-actions'

const style = makeStyles()(theme => ({
  menuTitle: {
    marginLeft: theme.spacing(2),
    marginTop: theme.spacing(),
    marginRight: theme.spacing(2),
  },
  listItem: {
    padding: theme.spacing(0),
    width: 'auto',
  },
  searchBox: {
    width: `calc(100% - ${theme.spacing(2)})`,
    margin: theme.spacing(),
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
  },
  closeIcon: {
    margin: 'auto',
    cursor: 'pointer',
    width: theme.spacing(3),
    color: colorModifiers.activeAction(rawColours.text.black),
  },
}))

const LabelTypeMenu = props => {
  const { classes } = style()
  const { t } = useTranslation()
  return (
    <>
      <Typography className={classes.menuTitle} variant="overline">
        {props.type === LABEL_TYPES.USER_DEFINED
          ? t('labels.hashtags')
          : t(`labels.${props.type}s`)}
      </Typography>
      <div
        style={{
          gridTemplateRows:
            props.labels.length < 6
              ? `repeat(${props.labels.length}, 1fr)`
              : `repeat(${Math.ceil(props.labels.length / 2)}, 1fr)`,
        }}
      >
        {props.labels.map((label, index) => (
          <ListItem
            className={classes.listItem}
            data-test="label-option"
            key={index}
          >
            <Checkbox
              style={{ padding: '4px' }}
              color="primary"
              data-test="label-option-checkbox"
              checked={props.selectedLabelIds.includes(label.labelId)}
              onClick={() => props.toggleLabel(label.labelId)}
            />
            <LabelChip
              text={label.name}
              labelId={label.id}
              labelType={label.type}
              showModifiers={false}
              showLightBackground={false}
              addMode={false}
              isReadOnly={true}
              handleModifierUpdate={() => {}}
            />
          </ListItem>
        ))}
      </div>
    </>
  )
}

const LabelSearch = props => {
  const { classes } = style()
  const { t } = useTranslation()
  return (
    <div className={classes.row}>
      <TextField
        autoFocus={true}
        data-test="label-filter-search"
        className={classes.searchBox}
        value={props.searchString}
        onChange={e =>
          props.setSearchString(
            e.target.value.slice(0, MAX_FIELD_LENGTHS.LABEL)
          )
        }
        placeholder={t('labels.search')}
        slotProps={{
          input: {
            endAdornment: (
              <CloseIcon
                data-test="label-filter-close-icon"
                className={classes.closeIcon}
                onClick={() => {
                  props.setSearchString('')
                }}
              />
            ),
          },
        }}
      />
    </div>
  )
}

const LabelFilter = props => {
  const { t } = useTranslation()
  const { classes } = style()
  const anchorEl = useRef()

  const dispatch = useDispatch()
  const detailedView = useSelector(state => state.taskMapFilter.detailedView)
  const [showRisks, SetShowRisks] = useState(detailedView.showRisk)

  const sortedLabels = props.labels.sort(sortByRisk)
  const riskLabels = sortedLabels.filter(
    label => label.type === LABEL_TYPES.RISK
  )

  const userDefinedLabels = sortedLabels.filter(
    label => label.type === LABEL_TYPES.USER_DEFINED
  )
  const workflowLabels = sortedLabels.filter(
    label => label.type === LABEL_TYPES.WORKFLOW
  )

  const noLabels = props.labels.length === 0

  return (
    <div>
      <div>
        <FormControl>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  defaultChecked
                  value={showRisks}
                  onChange={() => {
                    SetShowRisks(!showRisks)
                    dispatch(
                      taskFilterActions.setDetailedView(
                        detailedView,
                        !showRisks
                      )
                    )
                  }}
                  color="primary"
                />
              }
              label="Show risk labels"
              labelPlacement="start"
            />
          </FormGroup>
        </FormControl>
        {props.labelCount > 15 && (
          <LabelSearch
            searchString={props.searchString}
            setSearchString={props.setSearchString}
          />
        )}
        <div style={{ height: props.labels.length === 0 ? '50px' : '' }}>
          {workflowLabels.length > 0 && (
            <LabelTypeMenu
              labels={workflowLabels}
              type={LABEL_TYPES.WORKFLOW}
              toggleLabel={props.toggleLabel}
              selectedLabelIds={props.selectedLabelIds}
            />
          )}
          {riskLabels.length > 0 && showRisks && (
            <LabelTypeMenu
              labels={riskLabels}
              type={LABEL_TYPES.RISK}
              toggleLabel={props.toggleLabel}
              selectedLabelIds={props.selectedLabelIds}
            />
          )}
          {userDefinedLabels.length > 0 && (
            <LabelTypeMenu
              labels={userDefinedLabels}
              type={LABEL_TYPES.USER_DEFINED}
              toggleLabel={props.toggleLabel}
              selectedLabelIds={props.selectedLabelIds}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default LabelFilter
