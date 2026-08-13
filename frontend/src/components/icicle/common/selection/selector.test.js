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
  selectAllCells,
  selectCellFromPoint,
  selectElementData,
  selectElementById,
  ICICLE_CSS_NAME,
  selectIcicleElementFromEvent,
} from './selector'
import * as d3Selection from 'd3-selection'

jest.mock('d3-selection')

describe('selector.test', () => {
  describe('selectAllCells', () => {
    let selectObjectMock
    beforeEach(() => {
      selectObjectMock = {
        selectAll: jest.fn().mockReturnValueOnce('mockResult'),
      }
      d3Selection.select = jest.fn().mockReturnValueOnce(selectObjectMock)
    })

    describe('when data has been given', () => {
      let mockContainerElement = 'mockContainerElement'
      let result
      beforeEach(() => {
        result = selectAllCells(mockContainerElement)
      })

      it('should call the select function once', () => {
        expect(d3Selection.select.mock.calls.length).toBe(1)
      })

      it('should call the select function with the given container element', () => {
        expect(d3Selection.select).toHaveBeenCalledWith(mockContainerElement)
      })

      describe('selectAll', () => {
        it('should be called on the select result', () => {
          expect(selectObjectMock.selectAll.mock.calls.length).toBe(1)
        })

        it('should have been called with .icicle', () => {
          expect(selectObjectMock.selectAll).toHaveBeenCalledWith(
            `.${ICICLE_CSS_NAME}`
          )
        })
      })

      it('should have a result', () => {
        expect(result).toBe('mockResult')
      })
    })
  })

  describe('selectCellFromPoint', () => {
    let mockElement, result
    beforeEach(() => {
      mockElement = {
        closest: jest.fn().mockReturnValueOnce('mockResult'),
      }
      document.elementFromPoint = jest.fn().mockReturnValueOnce(mockElement)

      result = selectCellFromPoint(123, 456)
    })

    it('should call the elementFromPoint function once', () => {
      expect(document.elementFromPoint.mock.calls.length).toBe(1)
    })

    it('should call the elementFromPoint with the given coordinates', () => {
      expect(document.elementFromPoint).toHaveBeenCalledWith(123, 456)
    })

    describe('closest', () => {
      it('should be called once', () => {
        expect(mockElement.closest.mock.calls.length).toBe(1)
      })

      it('should have been called with .icicle', () => {
        expect(mockElement.closest).toHaveBeenCalledWith(`.${ICICLE_CSS_NAME}`)
      })
    })

    it('should have a result', () => {
      expect(result).toBe('mockResult')
    })
  })

  describe('selectElementData', () => {
    let selectObjectMock
    beforeEach(() => {
      selectObjectMock = {
        datum: jest.fn().mockReturnValueOnce({ data: 'mockData' }),
      }
      d3Selection.select = jest.fn().mockReturnValueOnce(selectObjectMock)
    })

    describe('when element has been given', () => {
      let mockElement = 'mockElement'
      let result
      beforeEach(() => {
        result = selectElementData(mockElement)
      })

      it('should call the select function once', () => {
        expect(d3Selection.select.mock.calls.length).toBe(1)
      })

      it('should call the select function with the given container element', () => {
        expect(d3Selection.select).toHaveBeenCalledWith(mockElement)
      })

      describe('datum', () => {
        it('should be called on the select result', () => {
          expect(selectObjectMock.datum.mock.calls.length).toBe(1)
        })
      })

      it('should have a result', () => {
        expect(result).toBe('mockData')
      })
    })
  })

  describe('selectElementById', () => {
    let mockCells, selectObjectMock, filterFunction, result

    beforeEach(() => {
      mockCells = {
        filter: jest.fn().mockReturnValueOnce('mockResult'),
      }
      selectObjectMock = {
        selectAll: jest.fn().mockReturnValueOnce(mockCells),
      }
      d3Selection.select = jest.fn().mockReturnValueOnce(selectObjectMock)

      result = selectElementById('mockContainerElement', 333)
      filterFunction = mockCells.filter.mock.calls[0][0]
    })

    it('should call the select function with the given container element', () => {
      expect(d3Selection.select).toHaveBeenCalledWith('mockContainerElement')
    })

    it('should call selectAll with .icicle', () => {
      expect(selectObjectMock.selectAll).toHaveBeenCalledWith(
        `.${ICICLE_CSS_NAME}`
      )
    })

    it('should call filter on the mockCells', () => {
      expect(mockCells.filter).toHaveBeenCalled()
    })

    describe('filter', () => {
      let filterResult

      describe('when the datum id does NOT match the given id', () => {
        beforeEach(() => {
          filterResult = filterFunction({ data: { id: 222 } })
        })

        it('should return fasle', () => {
          expect(filterResult).toEqual(false)
        })
      })

      describe('when the datum id does match the given id', () => {
        beforeEach(() => {
          filterResult = filterFunction({ data: { id: 333 } })
        })

        it('should return fasle', () => {
          expect(filterResult).toEqual(true)
        })
      })
    })

    it('should return the result', () => {
      expect(result).toEqual('mockResult')
    })
  })

  describe('selectIcicleElementFromEvent', () => {
    let mockEvent, result

    beforeEach(() => {
      d3Selection.select = jest.fn().mockReturnValueOnce('mock_select_result')
    })

    describe('when an icicle ancestor can be found from the given event', () => {
      beforeEach(() => {
        mockEvent = {
          sourceEvent: {
            srcElement: {
              closest: jest.fn().mockReturnValueOnce('mock_closest_icicle'),
            },
          },
        }

        result = selectIcicleElementFromEvent(mockEvent)
      })

      it('should call "closest" on the event srcElement with icicle selector class', () => {
        expect(mockEvent.sourceEvent.srcElement.closest).toHaveBeenCalledWith(
          `.${ICICLE_CSS_NAME}`
        )
      })

      it('should call d3 select with the retrieved icicle', () => {
        expect(d3Selection.select).toHaveBeenCalledWith('mock_closest_icicle')
      })

      it('should return the result of the d3 select call', () => {
        expect(result).toBe('mock_select_result')
      })
    })

    describe('when an icicle ancestor CANNOT be found from the given event', () => {
      beforeEach(() => {
        mockEvent = {
          sourceEvent: {
            srcElement: {
              closest: jest.fn().mockReturnValueOnce(undefined),
            },
          },
        }

        result = selectIcicleElementFromEvent(mockEvent)
      })

      it('should call "closest" on the event srcElement with icicle selector class', () => {
        expect(mockEvent.sourceEvent.srcElement.closest).toHaveBeenCalledWith(
          `.${ICICLE_CSS_NAME}`
        )
      })

      it('should NOT call d3 select', () => {
        expect(d3Selection.select).not.toHaveBeenCalled()
      })

      it('should return undefined', () => {
        expect(result).toBeUndefined()
      })
    })
  })
})
