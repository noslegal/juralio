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

import React, { useEffect, useRef, useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import BigDataSpinner from '../../../../../../components/feedback/big-data-spinner/BigDataSpinner'
import { formatMicrosoftEmbedUrl } from '../../../../../../helpers/post-helpers'
import { NOTE_TYPES } from '../../../../../constants'

const style = makeStyles()(() => ({
  spinnerWrapper: {
    margin: 'auto',
  },
  wrapper: {
    display: 'flex',
    height: '100%',
    width: '100%',
  },
}))

const EmbeddedPost = props => {
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [showIframe, setShowIframe] = useState(false)
  const iframeRef = useRef()
  const { classes } = style()

  useEffect(() => {
    setShowIframe(false)
    setIframeLoaded(false)
    setTimeout(() => {
      setShowIframe(true)
    }, 1000)
  }, [props.url])

  const onLoad = () => {
    setIframeLoaded(true)
  }

  const getIframeUrl = () => {
    if (props.type === NOTE_TYPES.MIRO) {
      return props.url.replace('board', 'live-embed')
    } else if (
      props.type === NOTE_TYPES.MS_WORD ||
      props.type === NOTE_TYPES.MS_EXCEL ||
      props.type === NOTE_TYPES.MS_POWERPOINT ||
      props.type === NOTE_TYPES.MS_VISIO
    ) {
      return formatMicrosoftEmbedUrl(props.url)
    } else {
      return props.url
    }
  }

  return (
    <div className={classes.wrapper}>
      {showIframe && (
        <iframe
          title="embedded-post-item"
          ref={iframeRef}
          id="embedded-iframe"
          height={iframeLoaded ? '100%' : '0px'}
          align="middle"
          width={iframeLoaded ? '100%' : '0px'}
          border="0"
          src={getIframeUrl()}
          onLoad={onLoad}
          allowFullScreen
        />
      )}
      {!iframeLoaded && (
        <div className={classes.spinnerWrapper}>
          <BigDataSpinner size={80} />
        </div>
      )}
    </div>
  )
}

export default EmbeddedPost
