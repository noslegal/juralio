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
import { Typography } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import rawColours from '../../../theme/raw-colours'

const useStyles = makeStyles()(() => ({
  root: {
    border: '1px solid rgba(0, 0, 0, 0.12)',
    background: rawColours.primary.white.primary,
    borderRadius: 8,
    padding: '10px 12px',
    cursor: 'pointer',
    font: '500 12.5px Montserrat',
    color: rawColours.primary.black.black,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  rootSelected: {
    borderColor: rawColours.primary.primary.main,
    background: rawColours.primary.primary.light,
  },
  radio: {
    width: 14,
    height: 14,
    borderRadius: 9999,
    border: `2px solid ${rawColours.primary.black[100]}`,
    display: 'grid',
    placeItems: 'center',
    flex: 'none',
  },
  radioSelected: {
    borderColor: rawColours.primary.primary.main,
  },
  radioDot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
    background: rawColours.primary.primary.main,
  },
  icon: {
    fontSize: 16,
    color: rawColours.primary.black[100],
  },
  label: {
    flex: 1,
  },
}))

const OosOptionCard = ({ selected, onClick, Icon, label, dataTest }) => {
  const { classes, cx } = useStyles()

  return (
    <div
      className={cx(classes.root, selected && classes.rootSelected)}
      onClick={onClick}
      data-test={dataTest}
    >
      <div className={cx(classes.radio, selected && classes.radioSelected)}>
        {selected && <div className={classes.radioDot} />}
      </div>
      {Icon && <Icon className={classes.icon} />}
      <Typography component="span" className={classes.label}>
        {label}
      </Typography>
    </div>
  )
}

export default OosOptionCard
