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

import VpnKeyIcon from '@mui/icons-material/VpnKey'
import { DialogContent, Typography } from '@mui/material'
import React, { useState } from 'react'
import JuralioDialog from '../../../components/dialog/juralio-dialog/JuralioDialog'
import PasswordField from '../../../components/inputs/password-field/PasswordField'

const ConfirmPasswordDialog = props => {
  const [password, setPassword] = useState()

  return (
    <JuralioDialog
      open={true}
      titleText={
        <div>
          <Typography variant="h6">{props.text.header}</Typography>
        </div>
      }
      titleIcon={VpnKeyIcon}
      handleCancel={() => props.handleCancel(false)}
      onClose={() => props.handleCancel(false)}
      handleAction={() => props.handleAction(password)}
      actionLabel={props.text.actionLabel}
      dialogHeightShort={true}
    >
      <DialogContent>
        <PasswordField
          data-test="confirm-password-field"
          placeholder={props.text.placeholder}
          onChange={e => setPassword(e.target.value)}
          fullWidth
        />
      </DialogContent>
    </JuralioDialog>
  )
}
export default ConfirmPasswordDialog
