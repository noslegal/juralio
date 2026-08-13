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
import classNames from 'classnames'
import React from 'react'
import { withStyles } from 'tss-react/mui'
import juralioColours from '../../../../../theme/juralio-colours'

const HOVER_BUTTON_SIZE = 28

const styles = () => ({
  createTaskHoverButton: {
    position: 'absolute',
    boxSizing: 'border-box',
    width: HOVER_BUTTON_SIZE,
    height: HOVER_BUTTON_SIZE,
    background: 'white',
    borderRadius: 4,
    border: `${juralioColours.darkText.secondary} solid 2px`,
    color: juralioColours.darkText.secondary,
    zIndex: 16, // Fails if theme is used.
    opacity: 0,
    cursor: 'pointer',
    pointerEvents: 'auto',
  },
  icon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  createChildToRight: {
    right: -HOVER_BUTTON_SIZE / 2,
    top: '50%',
    transform: 'translateY(-50%)',
  },
  createSiblingAbove: {
    top: -HOVER_BUTTON_SIZE / 2,
    left: '50%',
    transform: 'translateX(-50%)',
  },
  createSiblingBelow: {
    bottom: -HOVER_BUTTON_SIZE / 2,
    left: '50%',
    transform: 'translateX(-50%)',
  },
  disabledDiv: {
    border: `${juralioColours.iconDisabled} solid 2px`,
  },
  disabled: {
    color: juralioColours.iconDisabled,
  },
  tooltip: {
    zIndex: 1,
    borderRadius: '4px',
    maxHeight: '72px',
    fontSize: '24px',
    padding: 0,
    backgroundColor: 'blue',
  },
})

const CreateTaskHoverButton = props => {
  const placementClasses = {
    right: props.classes.createChildToRight,
    above: props.classes.createSiblingAbove,
    below: props.classes.createSiblingBelow,
  }
  const placementClass = placementClasses[props.placement]

  const renderHoverButton = disabled => (
    <div
      className={classNames(
        props.classes.createTaskHoverButton,
        placementClass,
        disabled ? props.classes.disabledDiv : ''
      )}
      data-test={`hover-button-${props.placement}`}
      data-create-task-hover-button={props.placement}
      is-disabled={disabled ? 'true' : null}
      id={disabled ? 'disabled-hover-button' : ''}
    >
      <AddIcon
        className={classNames(
          props.classes.icon,
          disabled ? props.classes.disabled : ''
        )}
      />
    </div>
  )

  return props.placement === 'right' && props.options?.data?.isMilestone ? (
    <>{renderHoverButton(true)}</>
  ) : (
    <>{renderHoverButton()}</>
  )
}

export default withStyles(CreateTaskHoverButton, styles)
