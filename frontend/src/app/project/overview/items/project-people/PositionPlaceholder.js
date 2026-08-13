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

import PeopleIcon from '@mui/icons-material/People'
import { Tooltip, Typography } from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import { JuralioNamedColours } from '../../../../../theme/juralio-named-colours'

const useStyles = makeStyles()((theme, { iconSize }) => ({
  placeholderIcon: {
    width: iconSize,
    height: iconSize,
    padding: theme.spacing(0.25),
    borderWidth: theme.spacing(0.25),
    borderStyle: 'solid',
    borderColor: JuralioNamedColours.black[200],
    borderRadius: theme.spacing(0.5),
    boxSizing: 'border-box',
    backgroundColor: JuralioNamedColours.grey[200],
    color: JuralioNamedColours.black[200],
  },
}))

const PositionPlaceholder = ({
  text,
  tooltipKey,
  className,
  iconSize = 20,
  typographyVariant = 'subtitle2',
  dataTest,
}) => {
  const { t } = useTranslation()
  const { classes } = useStyles({ iconSize })

  return (
    <Tooltip title={t(tooltipKey)}>
      <div className={className} data-test={dataTest}>
        <PeopleIcon className={classes.placeholderIcon} />
        <Typography variant={typographyVariant}>{text}</Typography>
      </div>
    </Tooltip>
  )
}

PositionPlaceholder.propTypes = {
  /** Label shown next to the icon */
  text: PropTypes.string,
  /** i18n key for the tooltip title */
  tooltipKey: PropTypes.string.isRequired,
  /** Wrapper layout class supplied by the caller */
  className: PropTypes.string,
  /** Icon size in px — match the group logo size at the call site */
  iconSize: PropTypes.number,
  /** MUI Typography variant for the label */
  typographyVariant: PropTypes.string,
  dataTest: PropTypes.string,
}

export default PositionPlaceholder
