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

import { makeStyles } from 'tss-react/mui'
import { Typography, Tooltip } from '@mui/material'
import { findMatchingSubsection } from './result-helpers'
import rawColours from '../../../../theme/raw-colours'
const styles = makeStyles()(theme => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
  },
  lhColumn: {
    display: 'flex',
    flexDirection: 'column',
    width: theme.spacing(6),
  },
  iconWrapper: {},
  rhColumn: {
    width: 'inherit',
    overflow: 'hidden',
  },
  bodyWrapper: {},
  locationWrapper: {
    display: 'flex',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  location: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  title: { fontWeight: 200, overflow: 'hidden', textOverflow: 'ellipsis' },
  subTitle: {
    minHeight: '18px',
    maxWidth: '70%',
    overflow: 'hidden',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 1,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    marginBottom: '8px',
  },
  titleWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  locationChip: {
    maxWidth: '150px',
    backgroundColor: 'red',
    height: '20px',
    borderRadius: '20px',
    marginLeft: '4px',
    paddingLeft: '8px',
    paddingRight: '8px',
    fontSize: '10px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
}))

const LocationChip = props => {
  const { classes } = styles()

  const getColor = () => {
    switch (props.type) {
      case 'client':
        return rawColours.searchChip.client
      case 'matter':
        return rawColours.searchChip.matter
      case 'workstream':
        return rawColours.searchChip.workstream
      case 'template':
        return rawColours.searchChip.template
      default:
        return ''
    }
  }
  return (
    <Tooltip title={props.text}>
      <Typography
        className={classes.locationChip}
        style={{
          backgroundColor: getColor(),
        }}
      >
        {props.text}
      </Typography>
    </Tooltip>
  )
}

const ResultTemplate = props => {
  const { classes } = styles()
  return (
    <div className={classes.wrapper} onClick={props.goTo}>
      <div className={classes.lhColumn}>
        <div className={classes.iconWrapper}>{props.icon}</div>
      </div>
      <div className={classes.rhColumn}>
        <div className={classes.titleWrapper}>
          <Typography
            className={classes.title}
            variant={'h6'}
            data-test="search-result-title"
            dangerouslySetInnerHTML={{
              __html: props.title
                ? findMatchingSubsection(
                    props.title,
                    props.query,
                    "'font-weight;500;font-size:1.25rem;line-height:24px;'",
                    true
                  )
                : props.title,
            }}
          />
          {props.subtitle && (
            <Typography
              className={classes.subTitle}
              style={props.subtitleStyleOverride}
              data-test="search-result-subtitle"
            >
              {props.subtitle.replace(/-/g, '‑')}
            </Typography>
          )}
        </div>
        {props.location && (
          <div className={classes.locationWrapper}>
            <Typography
              className={classes.location}
              data-test="search-result-location"
            >
              {props.location}
            </Typography>
            {props.locationChips &&
              Object.keys(props.locationChips).map(l => (
                <LocationChip text={props.locationChips[l]} type={l} />
              ))}
          </div>
        )}
        <div
          className={classes.bodyWrapper}
          data-test="search-result-description"
        >
          {props.body}
        </div>
      </div>
    </div>
  )
}

export default ResultTemplate
