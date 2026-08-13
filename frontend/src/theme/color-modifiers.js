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

const hex2RGBA = (hex, opacity = 1) => {
  let c
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('')
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]]
    }
    c = '0x' + c.join('')
    return (
      'rgba(' +
      [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') +
      ',' +
      opacity +
      ')'
    )
  }
}

export default {
  disableText: hex => hex2RGBA(hex, '0.38'),
  secondaryText: hex => hex2RGBA(hex, '0.54'),
  primaryText: hex => hex2RGBA(hex, '0.87'),
  divider: hex => hex2RGBA(hex, '0.12'),
  hover: hex => hex2RGBA(hex, '0.12'),
  activeAction: hex => hex2RGBA(hex, '0.54'),
  hoverAction: hex => hex2RGBA(hex, '0.04'),
  alternativeHoverAction: hex => hex2RGBA(hex, '0.31'),
  selectedAction: hex => hex2RGBA(hex, '0.08'),
  disableAction: hex => hex2RGBA(hex, '0.26'),
  disableBackgroundAction: hex => hex2RGBA(hex, '0.12'),
  focusAction: hex => hex2RGBA(hex, '0.12'),
  filterIn: hex => hex2RGBA(hex, '0.6'),
  filterOut: hex => hex2RGBA(hex, '0.4'), //this was a guess
  primaryBackground: hex => hex2RGBA(hex, '0.6'),
  secondaryBackground: hex => hex2RGBA(hex, '0.38'),
  secondaryBorder: hex => hex2RGBA(hex, '0.54'),
  opaque: hex => hex2RGBA(hex, '0.15'),
  secondarySelected: hex => hex2RGBA(hex, '0.25'),
  loginBackground: hex => hex2RGBA(hex, '0.92'),
  textBackground: hex => hex2RGBA(hex, '0.7'),
  iconOpacity: hex => hex2RGBA(hex, '0.14'),
  rowOpacity: hex => hex2RGBA(hex, '0.05'),
  shadow: hex => hex2RGBA(hex, '0.19'),
  secondaryShadow: hex => hex2RGBA(hex, '0.23'),
  levelIndicator: hex => hex2RGBA(hex, '0.4'),
  restingButtonOpacity: hex => hex2RGBA(hex, '0.3'),
  hoverButtonOpacity: hex => hex2RGBA(hex, '0.6'),
  riskLabel: hex => hex2RGBA(hex, '1'),
  templateCardData: hex => hex2RGBA(hex, '0.8'),
  skeletonBackground: hex => hex2RGBA(hex, '1'),
}
