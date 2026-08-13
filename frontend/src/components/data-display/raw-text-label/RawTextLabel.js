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

import Typography from '@mui/material/Typography'
import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'
import { renderToString } from 'react-dom/server'
import { useTranslation } from 'react-i18next'
import { withStyles } from 'tss-react/mui'
import JuralioLink from '../../navigation/juralio-link/JuralioLink'

const styles = theme => ({
  text: {
    color: theme.palette.text.secondary,
    wordWrap: 'break-word',
  },
})

const textStyleWithLink = { marginBottom: 8 }

const RawTextLabel = props => {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(true)
  const [showToggle, setShowToggle] = useState(false)
  const [contentHeight, setContentHeight] = useState(-1)
  const labelRef = useRef(null)

  useEffect(() => {
    if (labelRef.current && props.collapseProps) {
      if (contentHeight === -1) {
        setContentHeight(labelRef.current.clientHeight)
      }
      setShowToggle(contentHeight > props.collapseProps.collapsedHeight)
    }
  }, [contentHeight, labelRef, props.collapseProps, props.rawText])

  if (!props.rawText || props.rawText.length === 0) return null

  return (
    <div>
      <div
        data-test="raw-text-content"
        style={getTextStyle(props, collapsed, showToggle)}
        ref={labelRef}
        onClick={props.onClick}
      >
        {getTextAsList(props.rawText).map((lineText, index) => {
          if (props.keepHtmlMarkup) {
            return (
              <Typography
                className={props.classes.text}
                key={index}
                data-test={'raw-text-line' + index}
                variant={getVariant(props.variant)}
                dangerouslySetInnerHTML={{ __html: getLineContent(lineText) }}
              ></Typography>
            )
          }
          return (
            <Typography
              className={props.classes.text}
              key={index}
              data-test={'raw-text-line' + index}
              variant={getVariant(props.variant)}
            >
              {getLineContent(lineText)}
            </Typography>
          )
        })}
      </div>
      {showToggle &&
        (collapsed ? (
          <JuralioLink
            data-test="toggle-see-more"
            value={t('common.seeMore')}
            onClick={() => setCollapsed(false)}
            variant="caption"
          />
        ) : (
          <JuralioLink
            data-test="toggle-see-less"
            value={t('common.seeLess')}
            onClick={() => setCollapsed(true)}
            variant="caption"
          />
        ))}
    </div>
  )
}

const getTextStyle = (props, collapsed, showToggle) => {
  if (!props.collapseProps || showToggle === false) {
    return {}
  }

  if (!collapsed) {
    return textStyleWithLink
  }

  return {
    ...textStyleWithLink,
    height: props.collapseProps.collapsedHeight,
    overflow: 'hidden',
  }
}

function getLineContent(lineText) {
  if (lineText.length > 0) return lineText
  return renderToString(<span data-test="raw-text-blank-line">&nbsp;</span>)
}

function getTextAsList(rawText) {
  if (rawText == null) return []
  rawText = rawText.replace(/\r/g, '')
  return rawText.split('\n')
}

function getVariant(variant) {
  return variant ? variant : 'body2'
}

RawTextLabel.propTypes = {
  rawText: PropTypes.string,
  variant: PropTypes.string,
  collapseProps: PropTypes.object,
  keepHtmlMarkup: PropTypes.bool,
}

export default withStyles(RawTextLabel, styles)
