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

const styles = () => ({
  root: {
    cursor: 'pointer',
  },
})

const JuralioLink = props => {
  return (
    <Link underline="always" className={props.classes.root} {...props}>
      {props.value}
    </Link>
  )
}

export default withStyles(JuralioLink, styles)
