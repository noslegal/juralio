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
import rawColours from './raw-colours'

export const JuralioNamedColours = {
  black: {
    main: juralioColours.named.black.main,
    200: juralioColours.named.black[200],
    100: juralioColours.named.black[100],
  },
  beige: {
    main: juralioColours.named.beige.main,
    200: juralioColours.named.beige[200],
    100: juralioColours.named.beige[100],
  },
  red: {
    main: juralioColours.named.red.main,
    300: juralioColours.named.red[300],
    200: juralioColours.named.red[200],
    100: juralioColours.named.red[100],
  },
  grey: {
    main: juralioColours.named.grey.main,
    300: juralioColours.named.grey[300],
    200: juralioColours.named.grey[200],
    100: juralioColours.named.grey[100],
  },
  purple: {
    main: juralioColours.named.purple,
    300: juralioColours.named.purple[300],
    200: juralioColours.named.purple[200],
    100: juralioColours.named.purple[100],
  },
  blue: {
    main: juralioColours.named.blue.main,
  },
}

export const JuralioAvatarColours = [
  { backgroundColor: rawColours.avatars.green },
  { backgroundColor: rawColours.avatars.blue },
  { backgroundColor: rawColours.avatars.red },
  { backgroundColor: rawColours.avatars.green_2 },
  { backgroundColor: rawColours.avatars.purple },
]
