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
import React from 'react'
import { Button, List, ListItem, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import rawColours from '../../../theme/raw-colours'

const useStyles = makeStyles()(() => ({
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  item: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    marginTop: 13,
    borderRadius: 9999,
    background: rawColours.primary.black[100],
    flex: 'none',
  },
  readonly: {
    flex: 1,
    padding: '6px 8px',
    fontSize: 13.5,
    lineHeight: '19px',
    color: rawColours.primary.black.black,
    borderRadius: 8,
  },
  readonlyClickable: {
    cursor: 'pointer',
    '&:hover': { background: rawColours.primary.grey[200] },
  },
  addButton: {
    background: 'transparent',
    border: 'none',
    color: rawColours.primary.primary.main,
    cursor: 'pointer',
    font: '500 12.5px Montserrat',
    textTransform: 'none',
    minWidth: 0,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 6px',
    borderRadius: 6,
    marginTop: 8,
    '&:hover': { background: 'transparent' },
  },
  addButtonFirst: { marginTop: 0 },
  addIcon: { fontSize: 16 },
}))

const PhaseItemList = ({
  items,
  placeholder,
  canAdd = true,
  onAdd,
  onItemClick,
}) => {
  const { classes, cx } = useStyles()
  const { t } = useTranslation()

  return (
    <div>
      {items.length > 0 && (
        <List disablePadding className={classes.list}>
          {items.map((it, idx) => (
            <ListItem key={idx} disablePadding className={classes.item}>
              <span className={classes.bullet} />
              <Typography
                component="span"
                className={cx(
                  classes.readonly,
                  onItemClick && classes.readonlyClickable
                )}
                onClick={onItemClick ? () => onItemClick(idx) : undefined}
              >
                {it}
              </Typography>
            </ListItem>
          ))}
        </List>
      )}
      {canAdd && (
        <Button
          type="button"
          variant="text"
          disableElevation
          disableRipple
          className={cx(
            classes.addButton,
            items.length === 0 && classes.addButtonFirst
          )}
          onClick={onAdd}
        >
          <AddIcon className={classes.addIcon} />{' '}
          <Typography component="span" variant="inherit">
            {t('fixedFeeSetup.phaseItemList.add', {
              placeholder: placeholder.toLowerCase(),
            })}
          </Typography>
        </Button>
      )}
    </div>
  )
}

export default PhaseItemList
