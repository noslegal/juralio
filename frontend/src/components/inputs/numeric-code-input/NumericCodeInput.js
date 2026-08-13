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

import { Typography } from '@mui/material'
import PropTypes from 'prop-types'
import { times } from 'ramda'
import React from 'react'
import ReactDOM from 'react-dom'
import { withTranslation } from 'react-i18next'
import { withStyles } from 'tss-react/mui'
import juralioColours from '../../../theme/juralio-colours'
import SingleNumberInput from './SingleNumberInput'

const styles = theme => ({
  root: { display: 'flex', justifyContent: 'space-between' },
  validationMessage: {
    color: juralioColours.error,
    paddingLeft: theme.spacing(),
  },
})
export class NumericCodeInput extends React.Component {
  constructor(props) {
    super(props)
    this.inputs = []
  }

  addInputRef = element => {
    if (element) {
      this.inputs = [
        ...this.inputs,
        ReactDOM.findDOMNode(element).querySelectorAll('input')[0],
      ]
    }
  }

  isLastArrayItem = items => index => index === items.length - 1

  getInputRefIndexFromEvent = event => this.inputs.indexOf(event.target)

  focusNextInput = currentIndex => {
    this.inputs[currentIndex + 1].focus()
  }

  updateValues = (index, value) => {
    let updatedValues = [...this.props.values]
    updatedValues[index] = value
    this.props.onChange(updatedValues)
    return updatedValues
  }

  onChange = event => {
    if (!event.target.value) return

    const index = this.getInputRefIndexFromEvent(event)
    const updatedValues = this.updateValues(index, event.target.value)

    this.isLastArrayItem(this.inputs)(index)
      ? this.props.onInputCompleted(updatedValues)
      : this.focusNextInput(index)
  }

  onBackspace = event => {
    const index = this.getInputRefIndexFromEvent(event)

    if (this.props.values[index] !== '') {
      this.updateValues(index, '')
    } else if (index > 0) {
      const prevInput = this.inputs[index - 1]
      prevInput.focus()
    }
  }

  componentDidUpdate() {
    if (this.props.values.join('') === '') {
      this.inputs[0].focus()
    }
  }

  render = () => {
    return (
      <>
        <div
          className={this.props.classes.root}
          data-test="numeric-code-inputs"
        >
          {times(
            index => (
              <SingleNumberInput
                validationMessage={this.props.validationMessage}
                onChange={this.onChange}
                onBackspace={this.onBackspace}
                key={index}
                index={index}
                value={this.props.values[index]}
                setRef={this.addInputRef}
                autoFocus={index === 0}
              />
            ),
            this.props.values.length
          )}
        </div>
        {this.props.validationMessage && (
          <Typography
            className={this.props.classes.validationMessage}
            data-test="validation-message"
            variant="caption"
          >
            {this.props.t(this.props.validationMessage)}
          </Typography>
        )}
      </>
    )
  }
}

NumericCodeInput.propTypes = {
  onInputCompleted: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  values: PropTypes.array.isRequired,
}

export default withTranslation()(withStyles(NumericCodeInput, styles))
