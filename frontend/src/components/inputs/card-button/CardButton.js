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

import { Card, Typography } from '@mui/material'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import juralioColours from '../../../theme/juralio-colours'
import { JuralioNamedColours } from '../../../theme/juralio-named-colours'

const useStyles = makeStyles()(theme => ({
  text: {
    fontSize: theme.spacing(1.5),
  },
  icon: {
    display: 'block',
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    marginBottom: theme.spacing(1),
    marginRight: 'auto',
    marginLeft: 'auto',
    marginTop: theme.spacing(1),
    backgroundColor: JuralioNamedColours.beige[100],
    border: theme.spacing(0.25),
    borderColor: juralioColours.matterDialog.border,
    borderStyle: 'solid',
    borderRadius: theme.spacing(1),
  },
  card: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: theme.spacing(12),
    minHeight: theme.spacing(13.5),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingBottom: theme.spacing(1),
    paddingTop: theme.spacing(0.5),
    '&:hover': {
      backgroundColor: JuralioNamedColours.beige[100],
    },
    textAlign: 'center',
    cursor: 'pointer',
    borderRadius: '4px',
  },
  cardSelected: {
    width: theme.spacing(12),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    backgroundColor: JuralioNamedColours.beige[100],
    textAlign: 'center',
    cursor: 'pointer',
  },
  disabled: {
    backgroundColor: juralioColours.named.grey[100],
  },
}))

const CardButton = props => {
  const {
    CardIcon,
    size,
    text,
    selected,
    onClickHandler,
    dataTest,
    iconCustomCss,
    border,
    disabled,
  } = props
  const { classes } = useStyles()

  const renderContent = () => (
    <>
      <CardIcon
        className={classNames(classes.icon, iconCustomCss)}
        fontSize={size}
      />
      <Typography className={size === 'small' ? classes.text : ''}>
        {text}
      </Typography>
    </>
  )

  const handleClick = () => {
    if (!disabled) {
      onClickHandler()
    }
  }

  return border ? (
    <Card
      variant={border && 'outlined'}
      raised={border}
      className={classNames(
        classes.card,
        selected && !disabled && classes.cardSelected,
        disabled && classes.disabled
      )}
      data-test={`${dataTest}`}
      onClick={() => handleClick()}
    >
      {renderContent()}
    </Card>
  ) : (
    <div
      onClick={() => handleClick()}
      data-test={`${dataTest}`}
      className={classNames(classes.card, selected && classes.cardSelected)}
    >
      {renderContent()}
    </div>
  )
}

CardButton.propTypes = {
  size: PropTypes.oneOf(['large', 'small']),
  text: PropTypes.string,
  dataTest: PropTypes.string,
  selected: PropTypes.bool,
  onClickHandler: PropTypes.func,
  CardIcon: PropTypes.object,
  iconCustomCss: PropTypes.string,
  border: PropTypes.bool,
  disabled: PropTypes.bool,
}

export default CardButton
