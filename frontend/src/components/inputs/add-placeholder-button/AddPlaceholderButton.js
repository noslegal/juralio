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

import React from 'react'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { Button } from '@mui/material'
import { useTranslation } from 'react-i18next'

const AddPlaceholderButton = props => {
  const { t } = useTranslation()
  return (
    <Button
      variant="outlined"
      color="primary"
      startIcon={<PersonAddIcon />}
      onClick={() => props.onClickHandler()}
      disabled={props.disabled}
      data-test="add-placeholder-button"
    >
      {t('matterAdmin.placeholders.dialog.createPlaceholder')}
    </Button>
  )
}
export default AddPlaceholderButton
