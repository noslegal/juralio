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

import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { Avatar } from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import juralioColours from '../../../theme/juralio-colours'

const useStyles = makeStyles()(theme => ({
  button: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    background: 'rgba(0,0,0,0)',
    fontSize: theme.spacing(1.5),
    border: '2px dashed rgb(140, 136, 125)',
    '&:hover': {
      backgroundColor: `${juralioColours.control.hover}`,
    },
  },
  icon: {
    color: juralioColours.named.black[200],
    margin: 'auto',
    width: theme.spacing(2),
    height: theme.spacing(2),
  },
}))

const AddPeopleButton = props => {
  const { classes } = useStyles()
  return (
    <Avatar
      className={classes.button}
      onClick={() => props.onClickHandler()}
      data-test={`${props.dataTestPrefix}-add-people-button`}
    >
      <PersonAddIcon className={classes.icon} />
    </Avatar>
  )
}

AddPeopleButton.propTypes = {
  dataTestPrefix: PropTypes.string,
}

export default AddPeopleButton
