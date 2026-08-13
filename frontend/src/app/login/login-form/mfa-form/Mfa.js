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
import Typography from '@mui/material/Typography'
import { QRCodeCanvas } from 'qrcode.react'
import React from 'react'
import { withTranslation } from 'react-i18next'
import { withStyles } from 'tss-react/mui'
import NumericCodeInput from '../../../../components/inputs/numeric-code-input/NumericCodeInput'
import { JuralioCoreColors } from '../../../../theme/juralio-core-colors'
const styles = theme => ({
  form: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  message: {
    textAlign: 'center',
  },
  showSecret: {
    paddingTop: theme.spacing(),
    textAlign: 'center',
    color: JuralioCoreColors.primary.main,
    cursor: 'pointer',
  },
  secretKey: {
    paddingTop: theme.spacing(),
    justifyContent: 'center',
    color: JuralioCoreColors.primary.main,
    display: 'flex',
    alignItems: 'center',
  },
  qrCode: {
    marginTop: theme.spacing(2),
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
})

class Mfa extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      mfaToken: new Array(6).fill(''),
      showSecret: false,
    }
  }

  getSecretKey = () => {
    let str = this.props.qrUrl
    let qrSecretKey = str.substring(str.indexOf('=') + 1, str.lastIndexOf('&'))
    qrSecretKey = qrSecretKey
      .replace(/(\w{4})/g, '$1 ')
      .replace(/(^\s+|\s+$)/, '')
    return qrSecretKey.substring(0, 39)
  }

  submit = mfaToken => {
    this.props.actions.login({
      username: this.props.username,
      password: this.props.password,
      mfaToken,
    })
  }

  onMfaTokenChanged = tokenValues => {
    this.props.actions.clearValidation()
    this.setState({
      ...this.state,
      mfaToken: tokenValues,
    })
  }

  onMfaTokenInputCompleted = completedTokenValues => {
    this.submit(completedTokenValues.join(''))
  }

  componentDidUpdate(previousProps) {
    if (!previousProps.validationMessage && this.props.validationMessage) {
      this.setState({
        ...this.state,
        mfaToken: [...this.state.mfaToken].fill(''),
      })
    }
    return (
      <Typography
        className={this.props.classes.message}
        data-test="mfa-validate-message"
        variant="body2"
      >
        {this.props.t('mfa.enterCode')}
      </Typography>
    )
  }

  renderMfaContent() {
    return this.props.showQR ? (
      <div data-test="mfa-register-form">
        <Typography
          className={this.props.classes.message}
          data-test="mfa-register-first-message"
          variant="body2"
        >
          {this.props.t('mfa.mfaDescription')}
        </Typography>
        <Typography
          className={this.props.classes.message}
          data-test="mfa-register-second-message"
          variant="body2"
        >
          {this.props.t('mfa.scanCode')}
        </Typography>
        <div className={this.props.classes.qrCode} data-test="mfa-register-qr">
          <QRCodeCanvas value={this.props.qrUrl} />
          {this.state.showSecret ? (
            <>
              <Typography
                className={this.props.classes.secretKey}
                data-test="mfa-secret"
                variant="caption"
              >
                {this.props.t('mfa.secretKey')}

                <Tooltip title={this.props.t('mfa.message')} placement="right">
                  <InfoIcon fontSize="small" />
                </Tooltip>
              </Typography>
              <Typography data-test="mfa-secret" variant="subtitle1">
                {this.getSecretKey()}
              </Typography>
            </>
          ) : (
            <Typography
              className={this.props.classes.showSecret}
              data-test="mfa-noScan"
              variant="caption"
              onClick={() => this.setState({ showSecret: true })}
            >
              {this.props.t('mfa.noScan')}
            </Typography>
          )}
        </div>
      </div>
    ) : (
      <Typography
        className={this.props.classes.message}
        data-test="mfa-validate-message"
        variant="body2"
      >
        {this.props.t('mfa.enterCode')}
      </Typography>
    )
  }

  render() {
    return (
      <form className={this.props.classes.form}>
        {this.renderMfaContent()}
        <NumericCodeInput
          onInputCompleted={this.onMfaTokenInputCompleted}
          onChange={this.onMfaTokenChanged}
          values={this.state.mfaToken}
          validationMessage={this.props.validationMessage}
        />
      </form>
    )
  }
}

export default withTranslation()(withStyles(Mfa, styles))
