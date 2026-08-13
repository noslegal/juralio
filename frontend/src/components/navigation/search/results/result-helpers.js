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

export const findMatchingSubsection = (
  htmlString,
  substring,
  styleOverride,
  ignoreWidth = false
) => {
  //stips out all html, find the match and adds bold tags around it, then tried to pad out each side with an even amount of text up to the limit
  if (!htmlString) return null
  let htmlRemovedString = htmlString.replace(/<\/?[a-zA-Z]+(>|.*?[^?]>)/g, '')
  if (!htmlRemovedString) {
    return null
  }
  let maxDescriptionLength = 500 //this is fairly arbitrary, tends to centre the matched query
  let container = document.getElementById('global-search-results-container')
  if (container && !ignoreWidth) {
    let width = container.getBoundingClientRect().width
    maxDescriptionLength = width / 6
  }

  let matchingIndex = htmlRemovedString
    .toLowerCase()
    .indexOf(substring.toLowerCase())
  if (matchingIndex === -1) {
    return htmlRemovedString // if there is no match, then bail out early
  }
  let beforeMatch = htmlRemovedString.substring(0, matchingIndex) //all text before the match
  let afterMatch = htmlRemovedString.substring(
    //all text after the match
    matchingIndex + substring.length,
    htmlRemovedString.length
  )
  let matchedString = `<b style=${
    styleOverride ? styleOverride : 'font-size:16px;'
  }>${htmlRemovedString.substring(
    matchingIndex,
    matchingIndex + substring.length
  )}</b>`

  let remainingChars = maxDescriptionLength - matchedString.length
  if (beforeMatch.length + afterMatch.length > remainingChars) {
    //will have to cut them off
    let charCountBefore = remainingChars / 2
    let charCountAfter = remainingChars / 2
    if (beforeMatch.length < charCountBefore) {
      charCountBefore = beforeMatch.length
      charCountAfter = remainingChars - charCountBefore
    }
    if (afterMatch.length < charCountAfter) {
      charCountAfter = afterMatch.length
      charCountBefore = remainingChars - charCountAfter
    }
    let textBefore = beforeMatch.substring(
      beforeMatch.length - charCountBefore,
      beforeMatch.length
    )
    if (textBefore.length < beforeMatch.length) {
      textBefore = '...' + textBefore
    }
    let textAfter = afterMatch.substring(0, charCountAfter)
    if (textAfter.length < afterMatch.length) {
      textAfter = textAfter + '...'
    }
    return textBefore + matchedString + textAfter
  }
  return beforeMatch + matchedString + afterMatch
}
