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

import juralioColours from './juralio-colours'

// Juralio Core Theme colours are provided to customise the Mui theme.
export const JuralioCoreColors = {
  // Main background color - for Mui.
  background: {
    default: juralioColours.named.black[100],
  },
  // This sets the primary colour and variants within the theme.
  // There is no need to add additional variants or use this directly.
  primary: {
    500: juralioColours.theme.primary[500],
    main: juralioColours.theme.primary.main,
    100: juralioColours.theme.primary[100],
  },
  // This sets the secondary colour and variants within the theme.
  // There is no need to add additional variants or use this directly.
  secondary: {
    main: juralioColours.theme.secondary.main,
  },
}
