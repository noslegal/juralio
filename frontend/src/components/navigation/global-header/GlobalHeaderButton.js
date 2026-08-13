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

import { Link, Tooltip } from '@mui/material'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { NavLink } from 'react-router-dom'
import { withStyles } from 'tss-react/mui'
import juralioColours from '../../../theme/juralio-colours'
import rawColours from '../../../theme/raw-colours'
import colorModifiers from '../../../theme/color-modifiers'
const styles = theme => ({
  navButton: {
    display: 'flex',
    height: '60%',
    color: juralioColours.darkText.secondary,
    alignItems: 'center',
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    padding: theme.spacing(0.5),
    cursor: 'pointer',
    flexBasis: 'content',
    flexGrow: '0',
    borderRadius: theme.spacing(0.5),
  },
  hover: {
    // '&:hover': {
    //   background: `${juralioColours.hover.hover} !important`,
    // },
  },
  selected: {
    backgroundColor: juralioColours.navigation.selected,
    fill: 'white',
  },
})

const GlobalHeaderButton = props => {
  if (!props.location) return null
  const { href, location } = props
  const targetHref = href?.includes('?')
    ? href.substring(0, href?.indexOf('?'))
    : href
  const selected = location === targetHref

  return (
    <Tooltip title={props.tool}>
      <Link
        data-test={`${props.meta}-navigation`}
        className={classNames(props.classes.navButton, {
          [props.classes.selected]: selected,
          [props.classes.hover]: !selected,
        })}
        component={href ? NavLink : null}
        to={href ? href : null}
      >
        <props.icon
          style={
            props.showHover === 5
              ? { fill: rawColours.status.notRequired.dark }
              : {
                  fill: colorModifiers.primaryBackground(
                    rawColours.status.notRequired.dark
                  ),
                }
          }
          data-test={`${props.meta}-icon`}
          className={classNames(props.iconClass, {
            [props.classes.selected]: selected,
          })}
        />
      </Link>
    </Tooltip>
  )
}

GlobalHeaderButton.propTypes = {
  meta: PropTypes.string,
  tool: PropTypes.string,
  href: PropTypes.string,
  location: PropTypes.string,
  iconClass: PropTypes.string,
}

export default withStyles(GlobalHeaderButton, styles)
