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

//import { Tooltip } from '@mui/material'
import React from 'react'
import { Link } from 'react-router-dom'
import { withStyles } from 'tss-react/mui'
import logo from '../../assets/images/juralio-logo.svg'

const styles = theme => ({
  logo: {
    width: 48,
    height: 48,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },

  root: {
    display: 'flex',
    height: '100%',
    alignItems: 'center',
  },
})

function NavHeaderIcon(props) {
  return (
    // <Tooltip title={'Home'}>
    // </Tooltip>
    <div data-test="home-navigation" className={props.classes.root}>
      <Link to="/home">
        <img
          data-test="juralio-logo"
          src={logo}
          alt="Juralio"
          className={props.classes.logo}
        />
      </Link>
    </div>
  )
}

export default withStyles(NavHeaderIcon, styles)
