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

import { split_text_two_lines } from './text-split-helper'

describe('text-split-helper.test', () => {
  describe('split_text_two_lines', () => {
    it('handles a null input', () => {
      const l = split_text_two_lines(null)
      expect(l[0]).toBe('')
      expect(l[1]).toBe('')
    })
    it('handles undefined input', () => {
      const l = split_text_two_lines(undefined)
      expect(l[0]).toBe('')
      expect(l[1]).toBe('')
    })
    it('handles the empty string', () => {
      const l = split_text_two_lines('')
      expect(l[0]).toBe('')
      expect(l[1]).toBe('')
    })
    it('handles a single characer', () => {
      const l = split_text_two_lines('H')
      expect(l[0]).toBe('H')
      expect(l[1]).toBe('')
    })
    it('handles a single word', () => {
      const l = split_text_two_lines('Hello')
      expect(l[0]).toBe('Hello')
      expect(l[1]).toBe('')
    })
    it('handles a two words', () => {
      const l = split_text_two_lines('Hello World')
      expect(l[0]).toBe('Hello World')
      expect(l[1]).toBe('')
    })
    it('handles a multi words', () => {
      const l = split_text_two_lines('The Planet Of The Apes')
      expect(l[0]).toBe('The Planet Of The Apes')
      expect(l[1]).toBe('')
    })
    it('handles a multi words near limit', () => {
      const l = split_text_two_lines('Carnoustie Panmure Football Club')
      expect(l[0]).toBe('Carnoustie Panmure Football Club')
      expect(l[1]).toBe('')
    })
    it('handles a multi words going over limit', () => {
      const l = split_text_two_lines(
        'The Original Carnoustie Panmure Football Club'
      )
      expect(l[0]).toBe('The Original Carnoustie Panmure')
      expect(l[1]).toBe('Football Club')
    })
    it('handles a multi words going to the limit', () => {
      const l = split_text_two_lines(
        'This is a long task name to hit the seventy characters limit. It is ya.'
      )
      expect(l[0]).toBe('This is a long task name to hit the')
      expect(l[1]).toBe('seventy characters limit. It is ya.')
    })
    it('handles a single word going to half the limit', () => {
      const l = split_text_two_lines('wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww')
      expect(l[0]).toBe('wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww')
      expect(l[1]).toBe('')
    })
    it('handles a single word going to half the limit+1', () => {
      const l = split_text_two_lines('wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwX')
      expect(l[0]).toBe('wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwX')
      expect(l[1]).toBe('')
    })
    it('handles words with the first going to half the limit', () => {
      const l = split_text_two_lines('wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww X')
      expect(l[0]).toBe('wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww')
      expect(l[1]).toBe('X')
    })
    it('handles a single word going to the limit', () => {
      const l = split_text_two_lines(
        'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww'
      )
      expect(l[0]).toBe(
        'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww'
      )
      expect(l[1]).toBe('')
    })
    it('handles a long word at the start', () => {
      const l = split_text_two_lines(
        'bbbbbbbbbbeeeeeeeeeettttttttttteeeeeeeeeee this can really mess it up.'
      )
      expect(l[0]).toBe('bbbbbbbbbbeeeeeeeeeettttttttttteeeeeeeeeee')
      expect(l[1]).toBe('this can really mess it up.')
    })
    it('handles a long word at the end', () => {
      const l = split_text_two_lines(
        'rup it mess really can this bbbbbbbbbbeeeeeeeeeettttttttttteeeeeeeeeee'
      )
      expect(l[0]).toBe('rup it mess really can this')
      expect(l[1]).toBe('bbbbbbbbbbeeeeeeeeeettttttttttteeeeeeeeeee')
    })
  })
})
