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
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { MenuItem, Typography } from '@mui/material'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { withTranslation } from 'react-i18next'
import { withStyles } from 'tss-react/mui'
import juralioColours from '../../../theme/juralio-colours'

const styles = theme => ({
  action: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingLeft: theme.spacing(6),
  },
  fabIcon: {
    paddingTop: theme.spacing(0.5),
    marginLeft: 13,
    marginRight: 13,
  },
  labelTypography: {
    opacity: '0.7',
  },
  hoveredlabelTypography: {
    opacity: '0.9',
  },
  actionIcon: {
    color: juralioColours.navigation.background,
    opacity: '0.7',
    transition: 'opacity .25s ease-out',
  },
  hoveredActionIcon: {
    color: juralioColours.navigation.background,
    opacity: '0.9',
    transition: 'opacity .25s ease-in',
  },
  desktopAction: {
    flexDirection: 'row-reverse',
    '&:hover': {
      opacity: '1 !important',
    },
  },
  mobileAction: {
    flexDirection: 'row',
  },
  contextMenu: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row-reverse',
    '&:hover': {
      opacity: '1 !important',
    },
    paddingRight: theme.spacing(4),
    paddingLeft: 0,
  },
  moreOptionsIcon: {
    marginLeft: 'auto',
  },
  moreOptionsIconMobile: {
    marginRight: 'auto',
  },
})

/** Item for the Desktop and Mobile FABS plus PostList context menu */
class FabActionItem extends Component {
  state = { isHovered: false }

  mouseEnter = () => {
    this.setState({
      isHovered: true,
    })
  }

  mouseLeave = () => this.setState({ isHovered: false })

  render() {
    const { action, classes, t, contextMenu, mobile, disabled } = this.props
    return (
      <MenuItem
        className={classNames(
          classes.action,
          mobile && !contextMenu ? classes.mobileAction : classes.desktopAction,
          contextMenu ? classes.contextMenu : null
        )}
        onMouseEnter={this.mouseEnter}
        onMouseLeave={this.mouseLeave}
        onClick={action.onClick}
        data-test={action.dataTest}
        disabled={disabled}
      >
        {this.props.hasSubMenu && !mobile && (
          <ChevronRightIcon className={classes.moreOptionsIcon} />
        )}
        {this.props.hasSubMenu && mobile && (
          <ChevronLeftIcon className={classes.moreOptionsIconMobile} />
        )}
        <Typography
          variant="body2"
          data-test="action-label"
          className={
            this.state.isHovered
              ? classes.hoveredlabelTypography
              : classes.labelTypography
          }
        >
          {t(`fabItems.${action.nameTextId}`)}
        </Typography>
        <div className={classes.fabIcon}>
          <action.icon
            className={
              this.state.isHovered
                ? classes.hoveredActionIcon
                : classes.actionIcon
            }
          />
        </div>
      </MenuItem>
    )
  }
}

FabActionItem.propTypes = {
  /** Mobile display flag */
  mobile: PropTypes.bool.isRequired,
  /** Action */
  action: PropTypes.object.isRequired,
}

export default React.forwardRef((props, ref) =>
  withTranslation()(withStyles(FabActionItem, styles))(props)
)
