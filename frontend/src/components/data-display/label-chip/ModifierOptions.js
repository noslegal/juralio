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

import ClearIcon from '@mui/icons-material/Clear'
import { MenuItem, MenuList, Popover, Tooltip, Typography } from '@mui/material'
import classNames from 'classnames'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import { LABEL_MODIFIERS } from '../../../app/constants'
import UseOutsideAlerter from '../../../hooks/UseOutsiderAlerter'
import colorModifiers from '../../../theme/color-modifiers'
import rawColours from '../../../theme/raw-colours'
const style = makeStyles()(theme => ({
  wrapper: {
    width: theme.spacing(16),
  },
  circle: {
    width: theme.spacing(2),
    height: theme.spacing(2),
    borderRadius: theme.spacing(),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(),
  },
  removeIcon: {
    width: theme.spacing(2),
    height: theme.spacing(2),
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(),
    color: colorModifiers.secondaryText(rawColours.text.black),
  },
  modifierOption: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: colorModifiers.primaryBackground(
        rawColours.primary.grey[200]
      ),
    },
  },
  disabled: {
    '&:hover': {
      backgroundColor: colorModifiers.primaryBackground(
        colorModifiers.disableAction(rawColours.primary.grey[200])
      ),
    },
    cursor: 'default',
  },
}))

const ModifierOptions = props => {
  const { classes } = style()
  const { handleModifierUpdate, existingModifier } = props
  const { t } = useTranslation()

  const getModifierOption = colour => {
    return (
      <Tooltip
        title={t('matter.viewOnly')}
        disableHoverListener={!props.viewOnly}
      >
        <span>
          <MenuItem
            data-test={`modifier-option-${colour}`}
            id={`modifier-option-${colour}`}
            className={classNames(
              classes.modifierOption,
              props.viewOnly ? classes.disabled : ''
            )}
            onClick={
              !props.viewOnly
                ? e => {
                    e.stopPropagation()
                    handleModifierUpdate(colour)
                  }
                : null
            }
            disabled={props.viewOnly}
          >
            <div
              className={classes.circle}
              style={{ backgroundColor: rawColours.riskLabels[colour].primary }}
            />
            <Typography>{t(`labels.modifiers.${colour}`)}</Typography>
          </MenuItem>
        </span>
      </Tooltip>
    )
  }

  const getRemoveOption = () => {
    return (
      <Tooltip
        title={t('matter.viewOnly')}
        disableHoverListener={!props.viewOnly}
      >
        <span>
          <MenuItem
            className={classNames(
              classes.modifierOption,
              props.viewOnly ? classes.disabled : ''
            )}
            data-test="modifier-option-remove"
            onClick={
              !props.viewOnly
                ? e => {
                    e.stopPropagation()
                    handleModifierUpdate(null)
                  }
                : () => {}
            }
            disabled={props.viewOnly}
          >
            <ClearIcon className={classes.removeIcon} />
            <Typography>{t('common.remove')}</Typography>
          </MenuItem>
        </span>
      </Tooltip>
    )
  }

  return (
    <Popover open={true} anchorEl={props.anchorEl}>
      <UseOutsideAlerter onClickAway={props.closeModifierOptions}>
        <MenuList
          className={classes.wrapper}
          autoFocus
          data-test="modifier-options"
          id="modifier-options"
          onKeyDown={e => {
            if (e.keyCode === 27) {
              props.closeModifierOptions()
            }
          }}
        >
          {existingModifier !== LABEL_MODIFIERS.RED &&
            getModifierOption(LABEL_MODIFIERS.RED)}
          {existingModifier !== LABEL_MODIFIERS.AMBER &&
            getModifierOption(LABEL_MODIFIERS.AMBER)}
          {existingModifier !== LABEL_MODIFIERS.GREEN &&
            getModifierOption(LABEL_MODIFIERS.GREEN)}
          {existingModifier && getRemoveOption()}
        </MenuList>
      </UseOutsideAlerter>
    </Popover>
  )
}

export default ModifierOptions
