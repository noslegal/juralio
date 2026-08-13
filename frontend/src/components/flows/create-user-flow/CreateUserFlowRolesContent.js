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

import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
} from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import { USER_ROLES } from '../../../app/constants'
import colorModifiers from '../../../theme/color-modifiers'
import rawColours from '../../../theme/raw-colours'

const style = makeStyles()(theme => ({
  description: {
    marginLeft: theme.spacing(4),
    color: colorModifiers.secondaryText(rawColours.primary.black.black),
    fontSize: theme.spacing(1.5),
    marginBottom: theme.spacing(2),
  },
  title: {
    fontSize: theme.spacing(2),
  },
  link: {
    color: rawColours.primary.primary.main,
    marginTop: theme.spacing(2),
    cursor: 'pointer',
  },
}))

const CreateUserFlowRolesContent = props => {
  const { classes } = style()
  const [roles, setRoles] = useState(props.values.roles)
  const { t } = useTranslation()
  const { values, setValues } = props

  const setRole = role => {
    let _roles = [...roles]
    if (_roles.includes(role)) {
      _roles = _roles.filter(r => r !== role)
    } else {
      _roles.push(role)
    }
    setRoles(_roles)
    values.roles = _roles
    setValues(values)
  }

  return (
    <div>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              onClick={() => setRole(USER_ROLES.ROLE_MATTER_CREATOR)}
              checked={roles.includes(USER_ROLES.ROLE_MATTER_CREATOR)}
            />
          }
          label={
            <Typography className={classes.title}>
              {t('userCreation.rolesMatterCreatorName')}
            </Typography>
          }
        />
        <Typography className={classes.description}>
          {t('userCreation.roles.matterCreatorDescription')}
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              onClick={() => setRole(USER_ROLES.ROLE_KNOWLEDGE_MANAGER)}
              checked={roles.includes(USER_ROLES.ROLE_KNOWLEDGE_MANAGER)}
            />
          }
          label={
            <Typography className={classes.title}>
              {t('userCreation.rolesKnowledgeManager')}
            </Typography>
          }
        />
        <Typography className={classes.description}>
          {t('userCreation.roles.knowledgeManagerDescription')}
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              defaultChecked
              onClick={() => setRole(USER_ROLES.ROLE_ORG_ADMIN)}
              checked={roles.includes(USER_ROLES.ROLE_ORG_ADMIN)}
            />
          }
          label={
            <Typography className={classes.title}>
              {t('userCreation.rolesOrgAdminName')}
            </Typography>
          }
        />
        <Typography className={classes.description}>
          {t('userCreation.roles.orgAdminDescription')}
        </Typography>
      </FormGroup>
    </div>
  )
}

export default CreateUserFlowRolesContent
