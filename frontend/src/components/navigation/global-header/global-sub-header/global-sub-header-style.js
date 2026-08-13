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
import colorModifiers from '../../../../theme/color-modifiers'
import { JuralioNamedColours } from '../../../../theme/juralio-named-colours'

export const useStyles = makeStyles()(theme => ({
  globalSubHeader: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    height: '35px',
  },
  globalSubHeaderHighlighted: {
    transition: 'background-color 1s linear',
  },
  subtitleOption: {
    textTransform: 'none !important',
  },
  selectedButton: {
    marginTop: '4px',
    height: theme.spacing(4),
    paddingLeft: theme.spacing(1.25),
    paddingRight: theme.spacing(1.25),
    textTransform: 'none',
    fontWeight: 'bold',
    color: rawColours.primary.grey.main,
    backgroundColor: rawColours.primary.black[200],
    '&:hover': {
      backgroundColor: rawColours.primary.black[100],
    },
  },
  button: {
    borderColor: '#D0D5DD',
    height: theme.spacing(4),
    marginTop: '4px',
    paddingLeft: theme.spacing(1.25),
    paddingRight: theme.spacing(1.25),
    textTransform: 'none',
    color: juralioColours.darkText.secondary,
    backgroundColor: 'transparent',
    '&:hover': {
      color: rawColours.primary.grey.main,
      backgroundColor: rawColours.primary.black[200],
    },
  },
  userOptionButton: {
    fontWeight: 'normal',
    fontSize: '14px',
    fontFamily: theme.typography.fontFamily,
    color: juralioColours.menu.item,
    textTransform: 'none !important',
    marginTop: 'auto',
    marginBottom: 'auto',
    marginRight: theme.spacing(2),
  },
  goToAdminButton: {
    marginRight: theme.spacing(4),
    marginTop: theme.spacing(1),
    display: 'flex',
    color: JuralioNamedColours.blue.main,
    textTransform: 'none',
    backgroundColor: colorModifiers.secondaryBackground(
      rawColours.primary.white.primary
    ),
    '&:hover': {
      backgroundColor: colorModifiers.hoverAction(rawColours.action.dark),
    },
  },
  userButtons: {
    display: 'flex',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  filterButtons: {
    display: 'flex',
    alignItems: 'center',
  },
  mobileTabWrapper: {
    display: 'flex',
  },
  animatedItem: {
    animation: `$myEffect 300ms ${theme.transitions.easing.easeInOut}`,
    position: 'absolute',
    left: 0,
  },
  animatedItemExiting: {
    animation: `$myEffectExit 300ms ${theme.transitions.easing.easeInOut}`,
    position: 'absolute',
    right: 0,
  },
  '@keyframes myEffect': {
    '0%': {
      transform: 'translateX(1000%)',
    },
    '100%': {
      transform: 'translateX(0)',
    },
  },
  '@keyframes myEffectExit': {
    '0%': {
      transform: 'translateX(-1000%)',
    },
    '100%': {
      transform: 'translateX(0)',
    },
  },
  taskCountIcon: {
    color: juralioColours.alert,
    alignSelf: 'center',
  },
  limitCard: {
    position: 'absolute',
    left: theme.spacing(31.25),
    top: theme.spacing(13.125),
    width: theme.spacing(26.875),
  },
  cardTooltip: {
    paddingTop: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(0.5),
    paddingBottom: theme.spacing(1),
  },
  PublishToggle: {
    alignSelf: 'center',
  },
  icon: {
    fill: juralioColours.darkText.primary,
    paddingRight: theme.spacing(0.5),
  },
}))
