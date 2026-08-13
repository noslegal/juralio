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

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import { Card, CardContent, List, useMediaQuery, useTheme } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import React, { useEffect, useState } from 'react'
import { withStyles } from 'tss-react/mui'
import LeftColumnList from './LeftColumnList'
import RightColumnList from './RightColumnList'

const styles = theme => ({
  root: {
    display: 'flex',
    backgroundColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
    maxHeight: '100%',
    height: '100%',
    padding: 0,
  },
  card: {
    width: '100%',
  },
  backButton: {
    marginBottom: theme.spacing(2),
  },
})

const TwoColumnList = props => {
  const { listItems } = props
  const selectItem = key => {
    setSelectedListItem(key)
    if (props.handleItemSelect) {
      props.handleItemSelect(key)
    }
  }
  const theme = useTheme()
  const isMobileView = useMediaQuery(theme.breakpoints.down('md'))
  const firstItem = Object.keys(listItems)[0]
  const itemsExist = Object.entries(listItems).length > 0
  const [selectedListItem, setSelectedListItem] = useState(
    props.selectedItem
      ? typeof props.selectedItem === 'string'
        ? props.selectedItem
        : Object.keys(listItems)[props.selectedItem]
      : firstItem
  )

  useEffect(() => {
    isMobileView || !itemsExist
      ? setSelectedListItem('')
      : setSelectedListItem(firstItem)
  }, [firstItem, isMobileView, itemsExist])

  useEffect(() => {
    if (props.selectedItem) {
      setSelectedListItem(
        typeof props.selectedItem === 'string'
          ? props.selectedItem
          : Object.keys(listItems)[props.selectedItem]
      )
    }
  }, [props.selectedItem, listItems])

  return (
    <List className={props.classes.root}>
      {selectedListItem && isMobileView ? (
        <Card
          className={props.classes.card}
          data-test={`${listItems[selectedListItem]?.dataTest}-content`}
        >
          <CardContent>
            <IconButton
              data-test="back-button"
              className={props.classes.backButton}
              onClick={() => setSelectedListItem('')}
              size="large"
            >
              <ChevronLeftIcon />
            </IconButton>
            {listItems[selectedListItem]?.component}
          </CardContent>
        </Card>
      ) : (
        <LeftColumnList
          listItems={listItems}
          selectedListItem={selectedListItem}
          selectItem={selectItem}
          isMobileView={isMobileView}
        />
      )}

      <RightColumnList
        listItems={listItems}
        selectedListItem={selectedListItem}
      />
    </List>
  )
}

export default withStyles(TwoColumnList, styles)
