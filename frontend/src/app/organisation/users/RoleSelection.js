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
  Tooltip,
  Typography,
} from '@mui/material'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { withStyles } from 'tss-react/mui'
import { hasRole } from '../../../services/user/helper/user-role-service'
import colorModifiers from '../../../theme/color-modifiers'
import rawColours from '../../../theme/raw-colours'
import { USER_ROLES } from '../../constants'

const styles = theme => ({
  accountOptionsTitle: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(1),
  },
  ftueTitle: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(1),
  },
  optionsContainer: {
    width: '100%',
    paddingTop: theme.spacing(1),
    backgroundColor: colorModifiers.secondaryBackground(
      rawColours.primary.black[100]
    ),
  },
  containerPadding: { paddingLeft: theme.spacing(2) },
  transparentBackground: {
    backgroundColor: 'transparent',
  },
  rolesHeader: {
    marginBottom: theme.spacing(),
  },
  checkboxRow: {
    display: 'flex',
  },
  checkbox: {
    flexGrow: 1,
  },
})

const RoleSelection = props => {
  const { t } = useTranslation()

  const isOrgAdmin = () => hasRole(USER_ROLES.ROLE_ORG_ADMIN, props.user)
  const isOrgOwner = () => hasRole(USER_ROLES.ROLE_ORG_OWNER, props.user)
  const isSystemAdministrator = props.isSystemAdministrator
  const isSelfOrgOwner = props.isOrgOwner
  const isMatterCreator = () =>
    hasRole(USER_ROLES.ROLE_MATTER_CREATOR, props.user)
  const isKnowledgeManager = () =>
    hasRole(USER_ROLES.ROLE_KNOWLEDGE_MANAGER, props.user)
  const isTemplateProvider = () =>
    hasRole(USER_ROLES.ROLE_TEMPLATE_PROVIDER, props.user)

  const ownerLimitReached = props.hasOrgOwnerLimitBeenReached(props.user)
  return (
    <div
      className={classNames(props.classes.optionsContainer, {
        [props.classes.transparentBackground]: props.transparentBackground,
        [props.classes.containerPadding]: props.applyContainerPadding,
      })}
    >
      <Typography
        className={props.classes.rolesHeader}
        variant="overline"
        data-test="role-option-title"
        noWrap
      >
        {t('userCreation.rolesTitle')}
      </Typography>
      <FormGroup className={props.classes.formGroup}>
        <div className={props.classes.checkboxRow}>
          <Tooltip
            disableFocusListener={!props.userIsOwner}
            disableHoverListener={!props.userIsOwner}
            disableTouchListener={!props.userIsOwner}
            title={t('userCreation.isOwner')}
          >
            <FormControlLabel
              control={
                <Checkbox
                  data-test="org-admin-checkbox"
                  name="orgAdminCheckbox"
                  value={USER_ROLES.ROLE_ORG_ADMIN}
                  checked={isOrgAdmin() || props.userIsOwner}
                  disabled={props.isOrgAdminDisabled || props.userIsOwner}
                  onChange={props.handleRoleChange}
                />
              }
              label={t('userCreation.rolesOrgAdminName')}
              className={props.classes.checkbox}
            />
          </Tooltip>

          <FormControlLabel
            control={
              <Checkbox
                data-test="matter-creator-checkbox"
                name="matterCreatorCheckbox"
                value={USER_ROLES.ROLE_MATTER_CREATOR}
                checked={isMatterCreator()}
                disabled={props.isMatterCreatorDisabled}
                onChange={props.handleRoleChange}
              />
            }
            label={t('userCreation.rolesMatterCreatorName')}
            className={props.classes.checkbox}
          />
        </div>
        <div className={props.classes.checkboxRow}>
          <FormControlLabel
            control={
              <Checkbox
                data-test="knowledge-manager-checkbox"
                name="knowledgeManagerCheckbox"
                value={USER_ROLES.ROLE_KNOWLEDGE_MANAGER}
                checked={isKnowledgeManager()}
                disabled={props.isKnowledgeManagerDisabled}
                onChange={props.handleRoleChange}
              />
            }
            label={t('userCreation.rolesKnowledgeManager')}
            className={props.classes.checkbox}
          />
          {(isSystemAdministrator || isSelfOrgOwner) &&
            props.user.enabled &&
            !props.user.isExternal && (
              <Tooltip
                disableFocusListener={!ownerLimitReached}
                disableHoverListener={!ownerLimitReached}
                disableTouchListener={!ownerLimitReached}
                title={t('userCreation.maxOrgOwnersReached')}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      data-test="org-owner-checkbox"
                      name="orgOwnerCheckbox"
                      value={USER_ROLES.ROLE_ORG_OWNER}
                      checked={isOrgOwner()}
                      onChange={props.handleRoleChange}
                      disabled={ownerLimitReached}
                    />
                  }
                  label={t('userCreation.rolesOrgOwner')}
                  className={props.classes.checkbox}
                />
              </Tooltip>
            )}
        </div>
        {isSystemAdministrator && (
          <div className={props.classes.checkboxRow}>
            <FormControlLabel
              control={
                <Checkbox
                  data-test="template-provider-checkbox"
                  name="templateProviderCheckbox"
                  value={USER_ROLES.ROLE_TEMPLATE_PROVIDER}
                  checked={isTemplateProvider()}
                  onChange={props.handleRoleChange}
                />
              }
              label={t('userCreation.rolesTemplateProvider')}
              className={props.classes.checkbox}
            />
          </div>
        )}
      </FormGroup>
    </div>
  )
}

RoleSelection.propTypes = {
  /** user */
  user: PropTypes.object.isRequired,
  /** isOrgAdminDisabled */
  isOrgAdminDisabled: PropTypes.bool,
  /** isMatterCreatorDisabled */
  isMatterCreatorDisabled: PropTypes.bool,
  /** handleRoleChange */
  handleRoleChange: PropTypes.func.isRequired,
  /** applyContainerPadding */
  applyContainerPadding: PropTypes.bool,
}

export default withStyles(RoleSelection, styles)
