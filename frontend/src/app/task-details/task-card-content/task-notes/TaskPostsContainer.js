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

import PropTypes from 'prop-types'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import juralioColours from '../../../../theme/juralio-colours'
import { JuralioNamedColours } from '../../../../theme/juralio-named-colours'
import PostDetailContainer from './post/detail/PostDetailContainer'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    height: '100%',
    width: '100%',
    maxWidth: '100%',
    flexBasis: 'auto',
  },
  authorsPanel: {
    borderLeft: `1px solid ${JuralioNamedColours.beige.main}`,
    paddingLeft: theme.spacing(),
    paddingRight: theme.spacing(),
  },
  authorsTitleBar: {
    display: 'flex',
    width: '100%',
    minWidth: theme.spacing(40),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorsTitle: {
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(),
  },
  authorsTitleVertical: {
    transform: 'translateX(50%) rotate(90deg)',
    transformOrigin: 'left',
  },
  hideText: {
    paddingTop: theme.spacing(),
    color: juralioColours.darkText.secondary,
    textTransform: 'uppercase',
  },
  arrowRight: {
    paddingTop: theme.spacing(),
    color: juralioColours.control.borderLight,
  },
  collapsedContent: {
    maxWidth: theme.spacing(6),
    marginTop: theme.spacing(1.5),
  },
}))

const TaskPostsContainer = props => {
  const { classes } = useStyles()

  return (
    <div className={classes.root} data-test="task-post-container">
      <PostDetailContainer
        task={props.task}
        matterId={props.matterId}
        isOverview={props.isOverview}
        viewOnly={props.viewOnly}
        openInEditMode={props.openInEditMode}
      />
    </div>
  )
}

TaskPostsContainer.propTypes = {
  task: PropTypes.object.isRequired,
  matterId: PropTypes.string.isRequired,
  /** Flag for Overview display */
  isOverview: PropTypes.bool,
}

export default TaskPostsContainer
