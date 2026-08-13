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

import AddIcon from '@mui/icons-material/Add'
import { Button, Typography } from '@mui/material'
import React from 'react'
import { withStyles } from 'tss-react/mui'
import { JuralioNamedColours } from '../../../theme/juralio-named-colours'
import rawColours from '../../../theme/raw-colours'

const styles = () => ({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  addIcon: {
    backgroundColor: JuralioNamedColours.black[200],
    borderRadius: 3,
    color: JuralioNamedColours.beige[100],
    fontSize: 'large',
  },
  text: {
    fontSize: '12px',
  },
  button: {
    textTransform: 'none',
    '&:hover': {
      backgroundColor: rawColours.primary.primary.light,
    },
  },
})

const AddButton = props => {
  const { classes } = props
  return (
    <div className={classes.root}>
      <Button
        disabled={props.viewOnly}
        className={classes.button}
        size="small"
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={props.onClick}
        data-test={props['data-test']}
      >
        <Typography className={classes.text}>{props.text}</Typography>
      </Button>
    </div>
  )
}

export default withStyles(AddButton, styles)
