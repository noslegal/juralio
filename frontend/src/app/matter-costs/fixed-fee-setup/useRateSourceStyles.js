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

import { makeStyles } from 'tss-react/mui'
import juralioColours from '../../../theme/juralio-colours'
import rawColours from '../../../theme/raw-colours'

const useRateSourceStyles = makeStyles()(() => ({
  sourceGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  sourceCard: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
    padding: '12px 14px',
    borderRadius: 10,
    cursor: 'pointer',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    background: rawColours.primary.white.primary,
  },
  sourceCardSelected: {
    borderColor: rawColours.primary.primary.main,
    background: rawColours.primary.primary.light,
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 9999,
    marginTop: 3,
    border: `2px solid ${rawColours.primary.black[100]}`,
    display: 'grid',
    placeItems: 'center',
    flex: 'none',
  },
  radioSelected: { borderColor: rawColours.primary.primary.main },
  radioDot: {
    width: 7,
    height: 7,
    borderRadius: 9999,
    background: rawColours.primary.primary.main,
  },
  sourceTitle: {
    font: '500 13px Montserrat',
    color: rawColours.primary.black.black,
  },
  sourceDesc: {
    fontSize: 11.5,
    color: rawColours.primary.black[100],
    marginTop: 2,
    lineHeight: '16px',
  },
  section: {
    marginTop: 14,
  },
  fieldLabel: {
    fontSize: 13,
    color: rawColours.primary.black[100],
    marginBottom: 6,
  },
  selectWrap: {
    maxWidth: 460,
  },
  select: {
    width: '100%',
    background: rawColours.primary.white.primary,
    fontFamily: 'Montserrat, sans-serif',
    fontSize: 14,
    color: rawColours.primary.black.black,
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(0, 0, 0, 0.12)',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: rawColours.primary.primary.main,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: rawColours.primary.primary.main,
      boxShadow: '0 0 0 3px rgba(63,121,155,0.15)',
    },
    '& .MuiSelect-select': { padding: '12px 14px' },
  },
  rateCard: {
    marginTop: 16,
    border: '1px solid rgba(0, 0, 0, 0.12)',
    borderRadius: 20,
    background: rawColours.primary.white.primary,
    overflow: 'hidden',
  },
  rateCardHeader: {
    display: 'grid',
    gridTemplateColumns: '20% 50% 20% 10%',
    borderBottom: `4px solid ${rawColours.primary.black[100]}`,
  },
  rateCardHeaderBandLeft: {
    background: rawColours.primary.primary.main,
    opacity: 0.85,
    color: rawColours.primary.white.primary,
    padding: '14px 12px',
    borderTopLeftRadius: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  rateCardHeaderBandRight: {
    background: rawColours.primary.primary.main,
    opacity: 0.85,
    borderTopRightRadius: 20,
  },
  rateCardHeaderBandIcon: {
    color: rawColours.primary.white.primary,
    fontSize: 22,
  },
  rateCardHeaderBandLabel: {
    color: rawColours.primary.white.primary,
    fontSize: 12,
    textAlign: 'center',
  },
  rateCardHeaderMiddle: {
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 4,
  },
  rateCardBasedOnRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12.5,
    color: rawColours.primary.black[100],
  },
  rateCardBasedOnLabel: {
    color: rawColours.primary.black.black,
    fontWeight: 500,
  },
  rateCardSourceIcon: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateCardSourceIconClient: {
    background: 'rgb(78, 91, 166)',
    color: 'white',
  },
  rateCardSourceIconOrg: {
    background: juralioColours.rateTableCards.orgNotRetired,
  },
  rateCardSourceIconInner: {
    transform: 'scale(0.7)',
    color: 'white',
  },
  rateCardCurrencyCell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '14px 8px',
    borderLeft: '1px solid rgba(0, 0, 0, 0.06)',
    borderRight: '1px solid rgba(0, 0, 0, 0.06)',
  },
  rateCardCurrencyCode: {
    fontWeight: 600,
    fontSize: 18,
    color: rawColours.primary.black.black,
  },
  rateCardCurrencyName: {
    fontSize: 11,
    color: rawColours.primary.black[100],
    marginTop: 2,
    textAlign: 'center',
  },
  modifierRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
    flexWrap: 'wrap',
  },
  modifierLabel: {
    fontSize: 13,
    color: rawColours.primary.black[100],
  },
  modifierValueField: {
    width: 90,
    '& input': {
      textAlign: 'right',
    },
  },
  modifierSuffix: {
    fontSize: 13,
    color: rawColours.primary.black[100],
  },
  rateTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
  },
  rateTableHeadRow: {
    background: rawColours.primary.grey[200],
  },
  rateTableHeadCell: {
    padding: '10px 14px',
    font: '500 11px Montserrat',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: rawColours.primary.black[100],
    textAlign: 'left',
  },
  rateTableHeadCellRight: {
    textAlign: 'right',
  },
  rateTableHeadCellCenter: {
    textAlign: 'center',
  },
  rateTableRow: {
    borderTop: '1px solid rgba(0, 0, 0, 0.06)',
  },
  rateTableCell: {
    padding: '10px 14px',
    verticalAlign: 'middle',
  },
  rateTableCellRight: {
    textAlign: 'right',
  },
  rateTableCellCenter: {
    textAlign: 'center',
  },
  gradeChip: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: 9999,
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 1.4,
  },
  discountCell: {
    fontSize: 12,
    color: rawColours.primary.black[100],
  },
  targetRateCell: {
    color: rawColours.primary.black[100],
    fontSize: 12.5,
  },
  fieldHelp: {
    padding: '10px 16px 16px',
    fontSize: 12,
    color: rawColours.primary.black[100],
  },
  empty: {
    padding: 20,
    border: '1px dashed rgba(0, 0, 0, 0.12)',
    borderRadius: 8,
    textAlign: 'center',
    color: rawColours.primary.black[100],
    fontSize: 13,
  },
  hideButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    color: rawColours.primary.black[100],
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    '&:hover': {
      background: 'rgba(0, 0, 0, 0.04)',
      color: rawColours.primary.black.black,
    },
  },
  showAllButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    font: '500 11px Montserrat',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: rawColours.primary.primary.main,
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  manualRateInputRoot: {
    width: '100%',
    fontFamily: 'Montserrat, sans-serif',
    fontSize: 13,
  },
  manualRateInputInput: {
    textAlign: 'right',
    padding: '4px 0',
  },
  hideCol: {
    width: 36,
    padding: '6px 4px',
    textAlign: 'center',
  },
}))

export default useRateSourceStyles
