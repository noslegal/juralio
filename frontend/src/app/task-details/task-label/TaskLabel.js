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

import InfoIcon from '@mui/icons-material/Info'
import { Tooltip } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import InfoTooltip from '../../../components/data-display/info-tooltip/InfoTooltip'
import LabelChip from '../../../components/data-display/label-chip/LabelChip'
import LightButton from '../../../components/inputs/light-button/LightButton'
import colorModifiers from '../../../theme/color-modifiers'
import rawColours from '../../../theme/raw-colours'
import { TASK_STATUS } from '../../constants'
import { sortLabels } from './task-label-helpers'

const style = makeStyles()(theme => ({
  root: {
    paddingLeft: theme.spacing(0.5),
  },
  buttonWrapper: {
    display: 'flex',
    gap: theme.spacing(),
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(),
    marginLeft: theme.spacing(0.5),
  },
  labelListWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chipWrapper: {
    margin: theme.spacing(0.5),
  },
  infoIcon: {
    display: 'flex',
    alignItems: 'center',
    color: colorModifiers.activeAction(rawColours.action.dark),
  },
}))

const TaskLabel = props => {
  const { t } = useTranslation()
  const { classes } = style()

  return (
    <div className={classes.root}>
      <div className={classes.labelListWrapper}>
        {props.labels.sort(sortLabels).map((label, key) => (
          <div className={classes.chipWrapper} key={key}>
            <LabelChip
              text={label.name}
              labelType={label.type}
              showModifiers={props.canAddAndEditLabels}
              showLightBackground={true}
              modifier={label.modifier}
              handleModifierUpdate={modifier =>
                props.handleModifierUpdate(label.labelId, modifier)
              }
              viewOnly={props.viewOnly}
              isReadOnly={props.viewOnly}
              addMode={false}
            />
          </div>
        ))}
        {props.inactiveLabels.length > 0 && (
          <div className={classes.infoIcon}>
            <InfoTooltip
              text={t('labels.disabledExplanationInTask', {
                labels: props.inactiveLabels.map(l => l.name).join(', '),
                count: props.inactiveLabels?.length,
              })}
            />
          </div>
        )}
      </div>
      {props.canAddAndEditLabels && (
        <div className={classes.buttonWrapper}>
          <LightButton
            isNotStarted={props.task.status === TASK_STATUS.NOT_STARTED}
            data-test="add-label-button"
            caption={t('labels.add')}
            clickHandler={props.addLabel}
            viewOnly={props.viewOnly}
          />
          <Tooltip title={t('labels.advice.addLabelTooltip')}>
            <InfoIcon fontSize="small" className={classes.infoIcon} />
          </Tooltip>
        </div>
      )}
    </div>
  )
}

export default TaskLabel
