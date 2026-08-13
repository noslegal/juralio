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
import { withStyles } from 'tss-react/mui'
import RightColumnListItem from './RightColumnListItem'

const styles = theme => ({
  rightColumn: {
    flex: 8,
    overflow: 'auto',
    paddingTop: theme.spacing(3),
    marginRight: theme.spacing(3),
    height: `calc(100% - ${theme.spacing(3)})`,
  },
})

const TwoColumnList = props => {
  const { listItems, selectedListItem } = props

  return (
    <div className={props.classes.rightColumn}>
      <RightColumnListItem
        dataTest={`${listItems[selectedListItem]?.dataTest}-content`}
      >
        {listItems[selectedListItem]?.component}
      </RightColumnListItem>
    </div>
  )
}

export default withStyles(TwoColumnList, styles)
