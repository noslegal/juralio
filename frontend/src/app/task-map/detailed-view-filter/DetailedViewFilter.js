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

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import {
  Checkbox,
  ClickAwayListener,
  FormControlLabel,
  FormGroup,
  Popover,
  Radio,
  Typography,
} from '@mui/material'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import colorModifiers from '../../../theme/color-modifiers'
import { DetailedViewIcon } from '../../../theme/navigation/CommonIcons'
import rawColours from '../../../theme/raw-colours'
import { TASK_MAP_VIEW_MODE_ENUM } from '../../constants'

const style = makeStyles()(theme => ({
  wrapper: {
    display: 'flex',
    cursor: 'pointer',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing(2),
  },
  icon: {
    fill: rawColours.primary.black[200],
    transform: 'scale(1.5)',
    marginTop: theme.spacing(2),
  },
  dropDownArrow: {
    fill: rawColours.primary.black[200],
  },
  titleText: {
    color: rawColours.primary.black[200],
    width: theme.spacing(8),
  },
  option: {
    marginLeft: theme.spacing(2),
  },
  riskOption: {
    marginLeft: theme.spacing(2),
  },
  formLabel: {
    marginTop: theme.spacing(2),
  },
  optionDescription: {
    width: '60%',
    marginLeft: theme.spacing(6),
    color: colorModifiers.secondaryText(rawColours.primary.black.black),
  },
}))

const DetailedViewFilter = props => {
  const { t } = useTranslation()
  const { classes } = style()
  const anchorEl = useRef()

  const getTitle = () => {
    switch (props.detailedView.viewMode) {
      case TASK_MAP_VIEW_MODE_ENUM.STANDARD:
        return t('detailedView.standardTitle')
      case TASK_MAP_VIEW_MODE_ENUM.DETAILED:
        return t('detailedView.detailedTitle')
      case TASK_MAP_VIEW_MODE_ENUM.COMPACT:
        return t('detailedView.compactTitle')
      default:
        return t('detailedView.standardTitle')
    }
  }
  return (
    <>
      <div
        className={classes.wrapper}
        onClick={props.handleWrapperClick}
        ref={anchorEl}
      >
        <DetailedViewIcon className={classes.icon} />
        <Typography
          className={classes.titleText}
          data-test="detailed-view-filter"
        >
          {getTitle()}
        </Typography>
        <ArrowDropDownIcon className={classes.dropDownArrow} />
      </div>
      <Popover
        anchorEl={anchorEl.current}
        open={props.showDropdown}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        onKeyDown={e => {
          if (e.keyCode === 27) {
            props.handleWrapperClick()
          }
        }}
      >
        <ClickAwayListener
          onClickAway={e => {
            e.stopPropagation()
            props.handleWrapperClick()
          }}
        >
          <FormGroup>
            <FormControlLabel
              className={classes.formLabel}
              value={false}
              control={
                <Radio
                  color="primary"
                  data-test="detailed-view-filter-compact-view"
                  className={classes.option}
                  checked={
                    props.detailedView.viewMode ===
                    TASK_MAP_VIEW_MODE_ENUM.COMPACT
                  }
                  onClick={() =>
                    props.changeView(
                      TASK_MAP_VIEW_MODE_ENUM.COMPACT,
                      props.detailedView.showRisk
                    )
                  }
                />
              }
              label={t('detailedView.compactTitle')}
            />
            <Typography className={classes.optionDescription} variant="caption">
              {t('detailedView.compactDescription')}
            </Typography>
            <FormControlLabel
              className={classes.formLabel}
              value={false}
              control={
                <Radio
                  color="primary"
                  data-test="detailed-view-filter-standard-view"
                  className={classes.option}
                  checked={
                    props.detailedView.viewMode ===
                    TASK_MAP_VIEW_MODE_ENUM.STANDARD
                  }
                  onClick={() =>
                    props.changeView(
                      TASK_MAP_VIEW_MODE_ENUM.STANDARD,
                      props.detailedView.showRisk
                    )
                  }
                />
              }
              label={t('detailedView.standardTitle')}
            />
            <Typography
              className={classes.optionDescription}
              style={!props.isTemplate ? {} : { marginBottom: '10px' }}
              variant="caption"
            >
              {t('detailedView.standardDescription')}
            </Typography>
            {!props.isTemplate && (
              <>
                <FormControlLabel
                  className={classes.formLabel}
                  value={true}
                  control={
                    <Radio
                      data-test="detailed-view-filter-detailed-view"
                      color="primary"
                      disabled={props.noLabels}
                      className={classes.option}
                      checked={
                        props.detailedView.viewMode ===
                        TASK_MAP_VIEW_MODE_ENUM.DETAILED
                      }
                      onClick={() =>
                        props.changeView(
                          TASK_MAP_VIEW_MODE_ENUM.DETAILED,
                          props.detailedView.showRisk
                        )
                      }
                    />
                  }
                  label={t('detailedView.detailedTitle')}
                />
                <Typography
                  className={classes.optionDescription}
                  variant="caption"
                >
                  {props.noLabels
                    ? t('labels.zeroStates.noLabelsToShow')
                    : t('detailedView.detailedDescription')}
                </Typography>
                <FormControlLabel
                  className={classes.formLabel}
                  value={true}
                  control={
                    <Checkbox
                      disabled={props.noRisks}
                      color="primary"
                      data-test="detailed-view-filter-risk-view"
                      className={classes.riskOption}
                      checked={props.detailedView.showRisk}
                      onClick={() =>
                        props.changeView(
                          TASK_MAP_VIEW_MODE_ENUM.DETAILED,
                          !props.detailedView.showRisk
                        )
                      }
                    />
                  }
                  label={t('detailedView.showRisk')}
                />
              </>
            )}
          </FormGroup>
        </ClickAwayListener>
      </Popover>
    </>
  )
}

export default DetailedViewFilter
