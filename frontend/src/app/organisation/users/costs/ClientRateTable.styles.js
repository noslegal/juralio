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
import juralioColours from '../../../../theme/juralio-colours'
import rawColours from '../../../../theme/raw-colours'

export const useStyles = makeStyles()(theme => ({
  sortButton: {
    width: '100%',
    padding: 0,
    color: rawColours.primary.black[200],
    backgroundColor: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    border: 'solid 1px transparent',
  },
  bottomRow: {
    height: '56px',
    width: '100%',
    borderTop: 'groove',
    borderRadius: '0 0 20px 20px',
    color: '#5E9EF8',
    display: 'grid',
    gridTemplateColumns: '2% 48% 50%',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#cfccc6',
    },
  },
  bottomRowDisabled: {
    height: '56px',
    width: '100%',
    borderTop: 'groove',
    borderRadius: '0 0 20px 20px',
    color: '#5E9EF8',
    display: 'grid',
    gridTemplateColumns: '2% 48% 50%',
  },
  headerLeftItem: {
    textAlign: 'left',
    paddingLeft: theme.spacing(1.25),
    paddingBottom: theme.spacing(1.25),
    paddingTop: theme.spacing(1.25),
  },
  headerCurrencyItem: {
    textAlign: 'right',
    paddingRight: theme.spacing(1.25),
    paddingBottom: theme.spacing(1.25),
    paddingTop: theme.spacing(1.25),
  },
  headerButton: {
    color: juralioColours.darkText.secondary,
    backgroundColor: 'white',
    '&:hover': {
      backgroundColor: rawColours.primary.black[100],
    },
    cursor: 'pointer',
    textAlign: 'center',
  },
  editSwitch: {
    width: 60,
    height: 26,
    padding: 0,
    '& .MuiSwitch-switchBase': {
      padding: 0,
      margin: 2,
      transitionDuration: '300ms',
      '&.Mui-checked': {
        transform: 'translateX(34px)',
        color: '#000', //clickeddd icon colour
        '& + .MuiSwitch-track': {
          backgroundColor: '#FFF', //clicked background colour
          opacity: 1,
          border: 0,
        },
        '&.Mui-disabled + .MuiSwitch-track': {
          opacity: 0.5,
        },
      },
      '&.Mui-focusVisible .MuiSwitch-thumb': {
        color: '#33cf4d',
        border: '6px solid #fff',
      },
    },
    '& .MuiSwitch-thumb': {
      boxSizing: 'border-box',
      width: 22,
      height: 22,
    },
    '& .MuiSwitch-track': {
      borderRadius: 26 / 2,
      backgroundColor: '#39393D', //unclicked bg colour
      opacity: 1,
      transition: theme.transitions.create(['background-color'], {
        duration: 500,
      }),
    },
  },
  gridWrapper: {
    display: 'grid',
    gridTemplateColumns: '20% 50% 20% 10%',
    borderTopLeftRadius: theme.spacing(2.5),
    borderTopRightRadius: theme.spacing(2.5),
    borderBottom: '4px solid',
    borderColor: rawColours.primary.black[100],
  },
  cardIcon: {
    marginTop: '9%',
    marginLeft: '45%',
    scale: '1.5',
  },
  cardIconDiv: {
    color: juralioColours.whiteText.primary,
    borderTopLeftRadius: theme.spacing(2.5),
  },
  cardIconText: {
    textAlignLast: 'center',
  },
  endIconDiv: {
    paddingTop: theme.spacing(2),
    color: juralioColours.whiteText.primary,
    borderTopRightRadius: theme.spacing(2.5),
  },
  textDiv: {
    paddingLeft: theme.spacing(1.5),
  },
  divider: {
    width: '60%',
  },
  currencyText: {
    paddingLeft: theme.spacing(2),
  },
  switchForm: {
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100%',
  },
  templateIconDiv: {
    backgroundColor: juralioColours.rateTableCards.orgNotRetired,
    borderRadius: '50%',
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginLeft: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
  },
  textField: {
    marginLeft: theme.spacing(1),
  },
  editFieldButton: {
    padding: theme.spacing(0.25),
    minWidth: 'auto',
    marginLeft: theme.spacing(0.5),
  },
  editButton: {
    textTransform: 'none',
    marginRight: '8px',
    marginBottom: '16px',
    marginLeft: 'auto',
    color: rawColours.primary.black[200],
    borderColor: rawColours.primary.black[200],
    backgroundColor: 'white',
    '&:hover': {
      backgroundColor: rawColours.primary.grey.main,
      borderColor: rawColours.primary.black[200],
    },
  },
  confirmBox: {
    borderRadius: theme.spacing(),
    padding: theme.spacing(1.25),
    marginRight: theme.spacing(1.5),
    marginLeft: 'auto',
    width: 'fit-content',
    display: 'flex',
  },
  replaceButton: {
    textTransform: 'none',
    marginRight: '8px',
    color: rawColours.primary.blue.dark,
    backgroundColor: 'white',
    '&:hover': {
      backgroundColor: 'white',
      color: rawColours.primary.darkBlue.main,
    },
  },
  hideButton: {
    height: 34,
    textTransform: 'none',
    borderBottom: 'solid 1px',
    borderColor: '#B8B3B0',
    color: juralioColours.darkText.secondary,
    borderRadius: '0',
    backgroundColor: '#F1F1EE',
    '&:hover': {
      backgroundColor: '#d6d6d4',
    },
  },
  showButton: {
    marginTop: 'auto',
    marginBottom: '2px',
    height: 34,
    textTransform: 'none',
    borderTop: 'solid 1px',
    borderColor: '#B8B3B0',
    color: juralioColours.darkText.secondary,
    borderRadius: '0',
    '&:hover': {
      backgroundColor: '#d6d6d4',
    },
  },
  draftChip: {
    backgroundColor: juralioColours.taskStatus.inProgress,
    marginTop: theme.spacing(0.5),
  },
  retiredChip: {
    backgroundColor: juralioColours.rateTableCards.retiredChip,
    marginTop: theme.spacing(0.5),
    color: juralioColours.whiteText.primary,
  },
  backButtonWrapper: {
    display: 'flex',
  },
  backButton: {
    marginBottom: '16px',
    marginRight: 'auto',
  },
  templateIcon: {
    scale: '0.7',
  },
  retireExtraWrapper: {
    marginTop: '4px',
  },
  retireDialogText1: {
    color: 'rgba(0, 0, 0, 0.54)',
    marginLeft: '32px',
    marginTop: '8px',
  },
  retireDialogText2: {
    color: 'rgba(0, 0, 0, 0.54)',
    marginLeft: '32px',
  },
  retireDialogText3: {
    color: 'rgba(0, 0, 0, 0.54)',
    marginTop: '36px',
  },
  clientTableRow: {
    display: 'flex',
    marginBottom: '8px',
  },
  clientTableEntry: {
    marginLeft: '8px',
    marginBottom: '4px',
    color: 'rgba(0, 0, 0, 0.54)',
    display: 'flex',
  },
  clientTableEntryName: {
    fontWeight: 'bold',
  },
  andMoreText: {
    marginTop: '8px',
    color: 'rgba(0, 0, 0, 0.54)',
    marginLeft: '8px',
    fontWeight: 'bold',
  },
  errorContainer: {
    width: 'fit-content',
    marginLeft: 'auto',
    marginRight: '8px',
  },
  rateOptionsContainer: {
    zIndex: 999,
    position: 'relative',
    marginTop: '20px',
  },
  adoptRatesRow: {
    display: 'flex',
    height: '24px',
    cursor: 'pointer',
    marginBottom: '16px',
    alignItems: 'center',
  },
  ofText: {
    paddingRight: '4px',
    paddingLeft: '4px',
    cursor: 'pointer',
  },
  manualRatesRow: {
    display: 'flex',
    height: '24px',
    cursor: 'pointer',
  },
  tableWrapper: {
    marginTop: '16px',
  },
  chipContainer: {
    justifySelf: 'center',
    marginBottom: '8px',
  },
  basedOnLocation: {
    paddingLeft: '8px',
  },
  gradeRowContainer: {
    display: 'flex',
    height: 'auto',
  },
  sortButtonWrapper: {
    width: 375,
    height: 'auto',
  },
  toggleGradesPaper: {
    borderRight: 'solid 1px',
    borderColor: '#B8B3B0',
  },
  gradeToggleHeader: {
    height: 72,
    backgroundColor: rawColours.primary.grey.main,
    borderBottom: 'solid 1px',
    borderColor: '#B8B3B0',
    display: 'flex',
  },
  visibilityHidden: {
    visibility: 'hidden',
  },
  menuItem: {
    height: 'fit-content',
  },
  menuItemDefault: {
    height: 'fit-content',
    cursor: 'default',
  },
  menuItemText: {
    marginLeft: '12px',
  },
  deletePeriodItem: {
    display: 'flex',
    alignItems: 'center',
  },
  deleteIcon: {
    color: juralioColours.darkText.primary,
    marginLeft: '4px',
  },
  inlineFlexPaddingTop: {
    display: 'inline-flex',
    paddingTop: '16px',
  },
  clientTableMore: {
    marginTop: '8px',
  },
  displayFlex: {
    display: 'flex',
  },
}))
