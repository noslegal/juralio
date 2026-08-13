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

import { Link } from '@mui/material'
import React from 'react'
import { withStyles } from 'tss-react/mui'
import logo from '../../../assets/images/juralio-lockup-horz-black@2x.png'

const logoBackgroundSize = 140

const styles = theme => ({
  logo: {
    backgroundImage: `url(${logo})`,
    backgroundSize: logoBackgroundSize,
    height: 48,
    backgroundPosition: 'left',
    backgroundRepeat: 'no-repeat',
    marginLeft: theme.spacing(2),
    width: logoBackgroundSize,
    marginTop: theme.spacing(3),
    paddingLeft: 0,
    zIndex: 0,
  },
  link: {
    flex: '0 0 auto',
  },
})

function MobileNavHeader(props) {
  return (
    <Link
      data-test={'mobile-nav-header'}
      to="/home"
      className={props.classes.link}
    >
      <div className={props.classes.logo} />
    </Link>
  )
}

export default withStyles(MobileNavHeader, styles)
