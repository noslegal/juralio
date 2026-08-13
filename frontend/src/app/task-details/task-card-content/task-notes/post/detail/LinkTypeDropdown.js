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

import BookIcon from '@mui/icons-material/Book'
import {
  FormControl,
  ListItemIcon,
  MenuItem,
  Select,
  SvgIcon,
  Typography,
} from '@mui/material'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import { linkTypeList } from '../../../../../../services/helpers/post/post-link-type-list'
import juralioColours from '../../../../../../theme/juralio-colours'
import { NOTE_TYPES } from '../../../../../constants'

const linkTypes = [
  'Word document',
  'Excel sheet',
  'Powerpoint deck',
  'Email',
  'Web Link',
  'Document link',
]

const getDisplayText = type => {
  switch (type) {
    case NOTE_TYPES.WEB:
      return 'Web link'
    case NOTE_TYPES.DOCUMENT:
      return 'Document'
    case 'Powerpoint deck':
      return 'Powerpoint'
    default:
      return type
  }
}

const style = makeStyles()(theme => ({
  wrapper: {
    width: theme.spacing(20.5),
    border: `1px solid ${juralioColours.named.grey[200]}`,
    borderRadius: '5px',
    cursor: 'pointer',
  },
  itemWrapper: {
    display: 'flex',
    width: theme.spacing(17),
    height: theme.spacing(2),
    cursor: 'pointer',
  },
  text: {
    fontSize: theme.spacing(1.5),
    marginTop: 'auto',
    marginBottom: 'auto',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    fontWeight: 500,
  },
  iconWrapper: {
    minWidth: theme.spacing(4),
    cursor: 'pointer',
  },
  itemWrapperSelected: {
    display: 'flex',
    width: theme.spacing(19),
    height: theme.spacing(3),
    marginLeft: theme.spacing(),
    cursor: 'pointer',
  },
  icon: {
    height: theme.spacing(2),
    marginTop: 'auto',
    marginBottom: 'auto',
    cursor: 'pointer',
  },
  smaller: {
    height: theme.spacing(2),
  },
  selectedWrapper: {
    display: 'flex',
  },
}))

const renderIcon = (post, classes) => {
  const linkType = linkTypeList.find(item => item.label === post)
  if (linkType) {
    return (
      <SvgIcon className={classes.icon}>
        <path d={linkType.iconPath} style={{ transform: linkType.transform }} />
      </SvgIcon>
    )
  }
  return <BookIcon className={classes.smaller} />
}

const LinkTypeDropdown = props => {
  const { classes } = style()
  return (
    <FormControl className={classes.formControl}>
      <Select
        disabled={props.disabled}
        data-test="link-type-dropdown"
        value={props.value}
        onChange={e => props.onChange(e.target.value)}
        className={classes.wrapper}
        SelectDisplayProps={{ className: classes.itemWrapperSelected }}
        renderValue={() => (
          <div className={classes.selectedWrapper}>
            <ListItemIcon className={classes.iconWrapper}>
              {renderIcon(props.value, classes)}
            </ListItemIcon>
            <Typography className={classes.text}>
              {getDisplayText(props.value)}
            </Typography>
          </div>
        )}
        MenuProps={{
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left',
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'left',
          },
          getContentAnchorEl: null,
        }}
      >
        {linkTypes.map(i => (
          <MenuItem
            value={i}
            className={classes.itemWrapper}
            data-test="link-type-option"
          >
            <ListItemIcon className={classes.iconWrapper}>
              {renderIcon(i, classes)}
            </ListItemIcon>
            <Typography className={classes.text}>
              {getDisplayText(i)}
            </Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default LinkTypeDropdown
