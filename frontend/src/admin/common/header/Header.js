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

import { Link, Typography } from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'
import { useSelector } from 'react-redux'
import { Link as RouterLink } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import { MAX_FIELD_LENGTHS } from '../../../app/constants'
import TextFieldWithEditIcon from '../../../components/inputs/read-edit-field/TextFieldWithEditIcon'
import { useUserAuthData } from '../../../hooks/user-hooks'
import { isSysAdmin } from '../../../services/user/helper/user-role-service'
import OrganisationAvatar from '../../organisations/common/OrganisationAvatar'

const useStyles = makeStyles()(theme => ({
  root: {
    maxWidth: theme.spacing(95),
  },
  sysAdminRoot: {
    maxWidth: theme.spacing(95),
    display: 'flex',
  },
  breadcrumbContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  breadcrumb: {
    marginRight: theme.spacing(),
  },
  breadcrumbSeparator: {
    marginRight: theme.spacing(),
  },
}))

const Header = props => {
  const { shouldRenderBreadCrumb } = props
  const userAuthData = useUserAuthData()
  const isSystemAdministrator = isSysAdmin(userAuthData)
  const { classes } = useStyles()

  const uniqueOrgErrorMessage = useSelector(
    state => state.organisation.validationMessages.uniqueOrgErrorMessage
  )
  const rejectedOrgName = useSelector(
    state => state.organisation.validationMessages.rejectedOrgName
  )

  const renderBreadcrumb = (breadcrumb, dataTestTag) => (
    <Link
      variant="body2"
      underline="hover"
      color="inherit"
      className={classes.breadcrumb}
      data-test={dataTestTag}
      component={RouterLink}
      to={breadcrumb.link}
    >
      {breadcrumb.label}
    </Link>
  )

  return (
    <div
      className={isSystemAdministrator ? classes.sysAdminRoot : classes.root}
    >
      {shouldRenderBreadCrumb && (
        <div className={classes.breadcrumbContainer}>
          <div>
            {renderBreadcrumb(
              props.firstLevelBreadcrumb,
              'header-first-breadcrumb'
            )}
          </div>
          {props.secondLevelBreadcrumb && (
            <>
              <Typography className={classes.breadcrumbSeparator}>
                &gt;
              </Typography>
              <div>
                {renderBreadcrumb(
                  props.secondLevelBreadcrumb,
                  'header-second-breadcrumb'
                )}
              </div>
            </>
          )}
        </div>
      )}
      {isSystemAdministrator && props.isOrg && (
        <OrganisationAvatar organisation={props.organisation} editable={true} />
      )}

      {props.handleTitleChange ? (
        <TextFieldWithEditIcon
          maxLength={MAX_FIELD_LENGTHS.ORGANISATION_NAME}
          value={props.title}
          updateValue={props.handleTitleChange}
          errorMessage={uniqueOrgErrorMessage}
          clearErrorMessages={props.clearErrorMessages}
          rejectedValue={rejectedOrgName}
          canEdit={true}
          autoWidth
          required
          usageContext="OrganisationName"
          variant="h5"
          onClick={() => {}}
        />
      ) : (
        <Typography data-test="header-title" variant="h5">
          {props.title}
        </Typography>
      )}
    </div>
  )
}

const breadcrumbPropTypes = {
  label: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
}

Header.propTypes = {
  title: PropTypes.string.isRequired,
  handleTitleChange: PropTypes.func,
  firstLevelBreadcrumb: PropTypes.shape(breadcrumbPropTypes),
  secondLevelBreadcrumb: PropTypes.shape(breadcrumbPropTypes),
  hideSearch: PropTypes.bool,
  isOrg: PropTypes.bool,
  orgId: PropTypes.number,
}

export default Header
