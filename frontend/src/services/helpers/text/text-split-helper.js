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

export const split_text_two_lines = (text, maxCharacters = 35) => {
  let line1 = ''
  let line2 = ''

  if (text === null || text === undefined) {
    return [line1, line2]
  }

  if (text.indexOf(' ') === -1) {
    line1 = text
  } else {
    const words = text.split(' ').reverse()
    const getLengthOfNextWord = () => words[words.length - 1].length

    while (
      words.length > 0 &&
      line1.length < maxCharacters &&
      (line1.length === 0 ||
        line1.length + getLengthOfNextWord() < maxCharacters + 1)
    ) {
      line1 += words.pop() + ' '
    }
    if (words.length > 0) {
      line2 = words.reverse().join(' ')
    }
  }

  return [line1.trim(), line2.trim()]
}
