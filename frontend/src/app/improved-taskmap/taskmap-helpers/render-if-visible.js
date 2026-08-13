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

import React, { useEffect, useMemo, useRef, useState } from 'react'

// type Props = {
//   /**
//    * Whether the element should be visible initially or not.
//    * Useful e.g. for always setting the first N items to visible.
//    * Default: false
//    */
//   initialVisible?: boolean
//   /** An estimate of the element's height */
//   defaultHeight?: number
//   /** How far outside the viewport in pixels should elements be considered visible?  */
//   visibleOffset?: number
//   /** Should the element stay rendered after it becomes visible? */
//   stayRendered?: boolean
//   root?: HTMLElement | null
//   /** E.g. 'span', 'tbody'. Default = 'div' */
//   rootElement?: string
//   rootElementClass?: string
//   /** E.g. 'span', 'tr'. Default = 'div' */
//   placeholderElement?: string
//   placeholderElementClass?: string
//   children: React.ReactNode
// }

const RenderIfVisible = ({
  initialVisible = false,
  defaultHeight = 300,
  visibleOffset = 1000,
  stayRendered = false,
  root = null,
  rootElement = 'div',
  rootElementClass = '',
  placeholderElement = 'div',
  placeholderElementClass = '',
  children,
}) => {
  const [isVisible, setIsVisible] = useState(initialVisible)
  const wasVisible = useRef(initialVisible)
  const placeholderHeight = useRef(defaultHeight)
  const intersectionRef = useRef(null)

  // Set visibility with intersection observer
  useEffect(() => {
    if (intersectionRef.current) {
      const localRef = intersectionRef.current
      const observer = new IntersectionObserver(
        entries => {
          // Before switching off `isVisible`, set the height of the placeholder
          if (!entries[entries.length - 1].isIntersecting) {
            placeholderHeight.current = localRef?.offsetHeight
          }

          if (typeof window !== undefined && window.requestIdleCallback) {
            window.requestIdleCallback(
              () => setIsVisible(entries[entries.length - 1].isIntersecting),
              {
                timeout: 600,
              }
            )
          } else {
            setIsVisible(entries[entries.length - 1].isIntersecting)
          }
        },
        { root, rootMargin: `${visibleOffset}px 0px ${visibleOffset}px 0px` }
      )

      observer.observe(localRef)
      return () => {
        if (localRef) {
          observer.unobserve(localRef)
        }
      }
    }
    return () => {}
  }, []) //eslint-disable-line

  useEffect(() => {
    if (isVisible) {
      wasVisible.current = true
    }
  }, [isVisible])

  const placeholderStyle = { height: placeholderHeight.current }
  const rootClasses = useMemo(
    () => `renderIfVisible ${rootElementClass}`,
    [rootElementClass]
  )
  const placeholderClasses = useMemo(
    () => `renderIfVisible-placeholder ${placeholderElementClass}`,
    [placeholderElementClass]
  )

  return React.createElement(rootElement, {
    children:
      isVisible || (stayRendered && wasVisible.current) ? (
        <>{children}</>
      ) : (
        React.createElement(placeholderElement, {
          className: placeholderClasses,
          style: placeholderStyle,
        })
      ),
    ref: intersectionRef,
    className: rootClasses,
  })
}

export default RenderIfVisible
