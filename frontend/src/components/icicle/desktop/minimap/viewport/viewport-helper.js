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

const getWidthScaleFactor = (mainIcicle, miniIcicle) =>
  mainIcicle.scrollWidth / miniIcicle.clientWidth

const getHeightScaleFactor = (mainIcicle, miniIcicle) =>
  mainIcicle.scrollHeight / miniIcicle.clientHeight

export const getViewportWidth = (mainIcicle, miniIcicle) =>
  mainIcicle.clientWidth / getWidthScaleFactor(mainIcicle, miniIcicle)

export const getViewportHeight = (mainIcicle, miniIcicle) =>
  mainIcicle.clientHeight / getHeightScaleFactor(mainIcicle, miniIcicle)

export const getInteractiveIcicleScrollX = (
  viewportX,
  mainIcicle,
  miniIcicle
) => viewportX * getWidthScaleFactor(mainIcicle, miniIcicle)

export const getInteractiveIcicleScrollY = (
  viewportY,
  mainIcicle,
  miniIcicle
) => viewportY * getHeightScaleFactor(mainIcicle, miniIcicle)

export const getViewportScrollX = (
  interactiveIcicleScrollX,
  mainIcicle,
  miniIcicle
) => interactiveIcicleScrollX / getWidthScaleFactor(mainIcicle, miniIcicle)

export const getViewportScrollY = (
  interactiveIcicleScrollY,
  mainIcicle,
  miniIcicle
) => interactiveIcicleScrollY / getHeightScaleFactor(mainIcicle, miniIcicle)
