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

import React, { useEffect, useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import RoadmapConstants from '../helpers/roadmap-constants'
import { generateLabelData, getLabelText } from './render-dividers'
import { scaleTime } from 'd3-scale'
import { Typography } from '@mui/material'
import juralioColours from '../../../theme/juralio-colours'
import dayjs from 'dayjs'

const style = makeStyles()(theme => ({
  wrapper: {
    height: RoadmapConstants.DIVIDER_HEIGHT,
    display: 'flex',
    left: '0',
    position: 'sticky',
    top: 0,
    backgroundColor: '#504C4B',
  },
}))

const RoadmapDividers = props => {
  const { classes } = style()
  const { dimensions, startDate, endDate, timePeriod } = props

  const [show, setShow] = useState(false)
  useEffect(() => {
    setShow(false)
    setTimeout(() => setShow(true), 1000)
  }, [timePeriod])

  const width = Math.max(dimensions.width, dimensions.roadMapWidth)

  const labelData = generateLabelData(
    dimensions,
    new Date(startDate),
    new Date(endDate),
    timePeriod
  )
  const spacedData = labelData
  const timeScale = scaleTime()
    .domain([new Date(startDate), new Date(endDate)])
    .range([RoadmapConstants.DIVIDER_LHS_MARGIN, props.rangeRHS])

  if (!show) {
    return null
  }

  return (
    <>
      {spacedData.map((d, i) => {
        let left = timeScale(d)
        return (
          <div
            key={i}
            style={{
              borderLeft: '2px dashed',
              width: RoadmapConstants.DIVIDER,
              borderColor: juralioColours.roadmap.divider,
              height: dimensions.roadmapHeight,
              left: `${left}px`,
              position: 'absolute',
              zIndex: 100,
              top: 20,
            }}
          />
        )
      })}
      <div
        className={classes.wrapper}
        style={{ width: `${width}px`, zIndex: 1004 }}
      >
        <div
          style={{
            position: 'sticky',
            width: '100%',
            left: 0,
            top: 0,
            zIndex: 1004,
          }}
        >
          {spacedData.map((d, i) => {
            let left = timeScale(d) - (i === 0 ? 10 : 40)
            return (
              <Typography
                key={i}
                style={{
                  left: `${left}px`,
                  position: 'absolute',
                  zIndex: 1005,
                  borderRadius: '4px',
                  padding: '2px',
                  color: juralioColours.whiteText.primary,
                }}
                data-test={
                  i === 0
                    ? 'divider-label-start'
                    : i === spacedData.length - 1
                      ? 'divider-label-end'
                      : 'divider-label'
                }
              >
                {getLabelText(d, timePeriod)}
              </Typography>
            )
          })}
          {spacedData.map((d, i) => {
            const pixelsBetween =
              timeScale(spacedData[1]) - timeScale(spacedData[0])
            const labelRange = Math.abs(
              dayjs(d).diff(
                dayjs(spacedData[i + 1 > spacedData.length ? i - 1 : i + 1]),
                'day'
              )
            )
            const left = timeScale(d)
            const nextDay = dayjs(d).add(1, 'day')
            const leftNext = timeScale(nextDay)
            const widthBetween = Math.max(Math.floor(leftNext - left), 25)
            const labelsBetween = Math.round(pixelsBetween / widthBetween)

            return (
              <React.Fragment key={i}>
                <div
                  style={{
                    rotate: '90deg',
                    width: '18px',
                    left: `${left - 8}px`,
                    position: 'absolute',
                    zIndex: 2006,
                    backgroundColor: 'white',
                    opacity: '40%',
                    top: '30px',
                    height: '2px',
                  }}
                ></div>
                {labelRange > 1 &&
                  new Array(labelsBetween).fill(0).map((l, index) => {
                    const invertDate = timeScale(
                      timeScale.invert(timeScale(d) + widthBetween * index)
                    )
                    if (invertDate - 3 > dimensions.roadMapWidth) return null
                    return (
                      <div
                        key={index}
                        style={{
                          rotate: '90deg',
                          width: '8px',
                          left: `${invertDate - 3}px`,
                          position: 'absolute',
                          zIndex: 2005,
                          backgroundColor: 'white',
                          opacity: '40%',
                          height: '1px',
                          top: '36px',
                        }}
                      ></div>
                    )
                  })}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default RoadmapDividers
