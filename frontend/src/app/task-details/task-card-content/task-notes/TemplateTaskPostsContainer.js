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
import { withStyles } from 'tss-react/mui'
import { JuralioNamedColours } from '../../../../theme/juralio-named-colours'
import TemplatePostDetailContainer from './post/detail/TemplatePostDetailContainer'

const styles = {
  root: {
    display: 'flex',
    height: '100%',
    width: '100%',
    maxWidth: '100%',
    flexBasis: 'auto',
    backgroundColor: JuralioNamedColours.beige[100],
  },
}
const TemplateTaskPostsContainer = props => {
  return (
    <div
      className={props.classes.root}
      data-test="template-task-post-container"
    >
      <TemplatePostDetailContainer
        task={props.task}
        templateId={props.templateId}
        isOverview={props.isOverview}
        viewOnly={props.viewOnly}
      />
    </div>
  )
}

TemplateTaskPostsContainer.propTypes = {
  /** task */
  task: PropTypes.object.isRequired,
  /** templateId */
  templateId: PropTypes.string.isRequired,
}

export default withStyles(TemplateTaskPostsContainer, styles)
