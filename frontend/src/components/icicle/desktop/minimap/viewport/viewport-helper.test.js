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

import {
  getViewportWidth,
  getViewportHeight,
  getInteractiveIcicleScrollX,
  getInteractiveIcicleScrollY,
  getViewportScrollX,
  getViewportScrollY,
} from './viewport-helper'
import each from 'jest-each'

describe('viewport-helper.test', () => {
  describe('getViewportWidth', () => {
    each`
      mainClientWidth | mainScrollWidth | miniClientWidth | expectedValue
      ${200}          | ${400}          | ${50}           | ${25}
      ${780}          | ${4000}         | ${170}          | ${33.15}
      ${678}          | ${4454}         | ${333}          | ${50.690166142793}
    `.test(
      'the result should be the mainClientWidth divided by the division of mainScrollWidth by miniClientWidth (i.e. scale factor)',
      ({
        mainClientWidth,
        mainScrollWidth,
        miniClientWidth,
        expectedValue,
      }) => {
        expect(
          getViewportWidth(
            {
              clientWidth: mainClientWidth,
              scrollWidth: mainScrollWidth,
            },
            {
              clientWidth: miniClientWidth,
            }
          )
        ).toBe(expectedValue)
      }
    )
  })

  describe('getViewportHeight', () => {
    each`
      mainClientHeight | mainScrollHeight | miniClientHeight | expectedValue
      ${200}          | ${400}          | ${50}           | ${25}
      ${780}          | ${4000}         | ${170}          | ${33.15}
      ${678}          | ${4454}         | ${333}          | ${50.690166142793}
    `.test(
      'the result should be the mainClientHeight divided by the division of mainScrollHeight by miniClientHeight (i.e. scale factor)',
      ({
        mainClientHeight,
        mainScrollHeight,
        miniClientHeight,
        expectedValue,
      }) => {
        expect(
          getViewportHeight(
            {
              clientHeight: mainClientHeight,
              scrollHeight: mainScrollHeight,
            },
            {
              clientHeight: miniClientHeight,
            }
          )
        ).toBe(expectedValue)
      }
    )
  })

  describe('getInteractiveIcicleScrollX', () => {
    each`
      viewportX | mainScrollWidth | miniClientWidth | expectedValue
      ${20}     | ${400}          | ${50}           | ${160}
      ${120}    | ${2400}         | ${320}          | ${900}
      ${345}    | ${5400}         | ${523}          | ${3562.1414913957938}
    `.test(
      'the result should be the viewportX multiplied by the division of mainScrollWidth by miniClientWidth (i.e. scale factor)',
      ({ viewportX, mainScrollWidth, miniClientWidth, expectedValue }) => {
        expect(
          getInteractiveIcicleScrollX(
            viewportX,
            {
              scrollWidth: mainScrollWidth,
            },
            {
              clientWidth: miniClientWidth,
            }
          )
        ).toBe(expectedValue)
      }
    )
  })

  describe('getInteractiveIcicleScrollY', () => {
    each`
      viewportY | mainScrollHeight | miniClientHeight | expectedValue
      ${20}     | ${400}           | ${50}            | ${160}
      ${120}    | ${2400}          | ${320}           | ${900}
      ${345}    | ${5400}          | ${523}           | ${3562.1414913957938}
    `.test(
      'the result should be the viewportY multiplied by the division of mainScrollHeight by miniClientHeight (i.e. scale factor)',
      ({ viewportY, mainScrollHeight, miniClientHeight, expectedValue }) => {
        expect(
          getInteractiveIcicleScrollY(
            viewportY,
            {
              scrollHeight: mainScrollHeight,
            },
            {
              clientHeight: miniClientHeight,
            }
          )
        ).toBe(expectedValue)
      }
    )
  })

  describe('getViewportScrollX', () => {
    each`
    interactiveIcicleScrollX | mainScrollWidth | miniClientWidth | expectedValue
      ${450}                 | ${3400}         | ${150}          | ${19.852941176470587}
      ${879}                 | ${2386}         | ${444}          | ${163.569153394803}
      ${3}                   | ${4500}         | ${200}          | ${0.13333333333333333}
    `.test(
      'the result should be the interactiveIcicleScrollX divided by the division of mainScrollWidth by miniClientWidth (i.e. scale factor)',
      ({
        interactiveIcicleScrollX,
        mainScrollWidth,
        miniClientWidth,
        expectedValue,
      }) => {
        expect(
          getViewportScrollX(
            interactiveIcicleScrollX,
            {
              scrollWidth: mainScrollWidth,
            },
            {
              clientWidth: miniClientWidth,
            }
          )
        ).toBe(expectedValue)
      }
    )
  })

  describe('getViewportScrollY', () => {
    each`
    interactiveIcicleScrollY | mainScrollHeight | miniClientHeight | expectedValue
      ${450}                 | ${3400}         | ${150}          | ${19.852941176470587}
      ${879}                 | ${2386}         | ${444}          | ${163.569153394803}
      ${3}                   | ${4500}         | ${200}          | ${0.13333333333333333}
    `.test(
      'the result should be the interactiveIcicleScrollY divided by the division of mainScrollHeight by miniClientHeight (i.e. scale factor)',
      ({
        interactiveIcicleScrollY,
        mainScrollHeight,
        miniClientHeight,
        expectedValue,
      }) => {
        expect(
          getViewportScrollY(
            interactiveIcicleScrollY,
            {
              scrollHeight: mainScrollHeight,
            },
            {
              clientHeight: miniClientHeight,
            }
          )
        ).toBe(expectedValue)
      }
    )
  })
})
