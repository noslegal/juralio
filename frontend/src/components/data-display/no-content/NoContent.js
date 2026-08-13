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

import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import React from 'react'
import { withStyles } from 'tss-react/mui'

const styles = {
  root: {
    height: '100%',
  },
  noContentItem: {
    flexShrink: 1,
  },
}

function NoContent(props) {
  return (
    <Grid
      container
      spacing={0}
      className={props.classes.root}
      direction="row"
      alignItems="center"
      justifyContent="center"
    >
      <Grid className={props.classes.noContentItem} item>
        <Typography
          align="center"
          className="NoContentMessage"
          variant={props.variant || 'h4'}
          data-test={props['data-test']}
        >
          {props.children}
        </Typography>
      </Grid>
    </Grid>
  )
}

export default withStyles(NoContent, styles)
