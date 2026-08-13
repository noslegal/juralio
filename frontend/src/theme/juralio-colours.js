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

import colourModifiers from './color-modifiers'
import rawColours from './raw-colours'

// Juralio specific colours are intended for custom controls or custom Mui components.
export default {
  // Error colours.
  error: rawColours.error.primary,
  warning: rawColours.warning.primary,
  alert: rawColours.primary.orange.primary,
  // Custom control colours.
  control: {
    background: rawColours.primary.primary.main,
    border: rawColours.primary.grey.main,
    borderLight: colourModifiers.secondaryBorder(
      rawColours.text.black //too light
    ),
    active: rawColours.status.done.light,
    contrast: rawColours.primary.primary.main,
    hover: colourModifiers.hover(rawColours.primary.black[100]),
    divider: colourModifiers.divider(rawColours.divider.dark),
  },
  darkControl: {
    backgroundPrimary: colourModifiers.primaryBackground(
      rawColours.primary.black.black
    ),
    backgroundSecondary: colourModifiers.secondaryBackground(
      rawColours.primary.black.black
    ),
  },
  lightControl: {
    backgroundPrimary: colourModifiers.primaryBackground(
      rawColours.primary.white.primary
    ),
  },

  // Projects specific status colours - not related to Mui theme.
  taskStatus: {
    notRequired: rawColours.status.notRequired.dark,
    notStarted: rawColours.status.notStarted.dark,
    inProgress: rawColours.status.inProgress.dark,
    done: rawColours.status.done.dark,
    filteredIn: {
      notRequired: colourModifiers.filterIn(rawColours.status.notRequired.dark),
      notStarted: colourModifiers.filterIn(rawColours.status.notStarted.dark),
      inProgress: colourModifiers.filterIn(rawColours.status.inProgress.dark),
      done: colourModifiers.filterIn(rawColours.status.done.dark),
    },
    filteredOut: {
      notRequired: colourModifiers.filterOut(
        rawColours.status.notRequired.dark
      ),
      notStarted: colourModifiers.filterOut(rawColours.status.notStarted.dark),
      inProgress: colourModifiers.filterOut(rawColours.status.inProgress.dark),
      done: colourModifiers.filterOut(rawColours.status.done.dark),
    },
    contrast: rawColours.primary.white.primary,
    roadmap: {
      'not-startedFilter':
        'invert(61%) sepia(7%) saturate(188%) hue-rotate(339deg) brightness(95%) contrast(88%)',
      'in-progressFilter':
        'invert(56%) sepia(76%) saturate(389%) hue-rotate(3deg) brightness(95%) contrast(100%)',
      doneFilter:
        'invert(58%) sepia(38%) saturate(361%) hue-rotate(134deg) brightness(96%) contrast(92%)',
      error:
        'invert(22%) sepia(92%) saturate(5101%) hue-rotate(339deg) brightness(66%) contrast(117%)',
    },
  },
  assumptionStatus: {
    onTarget: {
      background: rawColours.primary.blue.light,
      text: rawColours.primary.matterCreateBlue.primary,
    },
    atRisk: {
      background: rawColours.status.inProgress.light,
      text: rawColours.riskLabels.amber.text,
    },
    met: {
      background: rawColours.primary.green.light,
      text: rawColours.primary.green.dark,
    },
    notMet: {
      background: rawColours.error.light,
      text: rawColours.error.primary,
    },
  },
  taskStatusSelected: {
    notRequired: rawColours.status.notRequired.primary,
    notStarted: rawColours.status.notStarted.primary,
    inProgress: rawColours.status.inProgress.primary,
    done: rawColours.status.done.primary,
    template: rawColours.status.template.primary,
  },
  taskStatusWithOpacity: {
    notRequired: rawColours.status.notRequired.primary,
    notStarted: colourModifiers.opaque(rawColours.status.notStarted.primary),
    inProgress: colourModifiers.opaque(rawColours.status.inProgress.primary),
    done: colourModifiers.opaque(rawColours.status.done.primary),
  },
  noteStatusSelected: {
    dark: colourModifiers.secondarySelected(rawColours.primary.black.black),
  },
  // Navigation Colours.
  navigation: {
    foreground: rawColours.primary.black.black,
    background: rawColours.primary.grey.primary,
    selected: rawColours.primary.black[200],
  },
  // Overlay for behind dialog.
  overlay: {
    dark: rawColours.primary.black[200],
  },
  whiteText: {
    primary: colourModifiers.primaryText(rawColours.text.white),
    secondary: colourModifiers.secondaryText(rawColours.text.white),
    disabled: colourModifiers.disableText(rawColours.text.white),
  },
  darkText: {
    primary: colourModifiers.primaryText(rawColours.text.black),
    secondary: colourModifiers.secondaryText(rawColours.text.black),
    disabled: colourModifiers.disableText(rawColours.text.black),
  },
  greenBlue: {
    primary: rawColours.primary.greenBlue.primary,
  },
  hover: {
    hover: colourModifiers.hoverAction(rawColours.primary.white.primary),
    hoverMedium: colourModifiers.hover(rawColours.primary.greenBlue.primary),
    hoverDark: colourModifiers.hoverAction(rawColours.primary.black.black),
  },
  postDrawer: rawColours.status.notStarted.primary,
  arrow: rawColours.primary.black[200],
  icon: rawColours.primary.greenBlue.primary,
  iconDisabled: colourModifiers.disableAction(rawColours.primary.black.black),
  notificationHover: rawColours.primary.grey[200],
  helpText: {
    color: rawColours.primary.primary.dark,
  },
  card: {
    background: colourModifiers.loginBackground(
      rawColours.primary.white.primary
    ),
  },
  taskChip: {
    taskNameBackground: colourModifiers.textBackground(
      rawColours.primary.grey.main
    ),
  },
  useTemplateButton: {
    useButton: '#D1E5E6',
  },
  taskMap: {
    cancelButton: rawColours.primary.red.primary,
    snackbarBackground: rawColours.primary.greenBlue.secondary,
    newTasksHighlight: rawColours.primary.purple.primary,
    dropZone: {
      valid: rawColours.primary.purple.primary,
      invalid: rawColours.primary.black[200],
    },
  },
  matterDialog: {
    templateIcon: colourModifiers.iconOpacity(rawColours.primary.grey[100]),
    border: rawColours.primary.black[200],
  },
  offWhite: {
    a: rawColours.dialog.background,
    b: rawColours.dialog.background,
  },
  project: {
    name: colourModifiers.secondaryText(rawColours.primary.black[200]),
  },
  menu: {
    item: colourModifiers.primaryText(rawColours.primary.black.black),
  },
  people: {
    row: colourModifiers.rowOpacity(rawColours.primary.greenBlue.primary),
    hover: colourModifiers.hoverAction(rawColours.primary.black.black),
  },
  paper: {
    background: colourModifiers.primaryBackground(
      rawColours.primary.white.primary
    ),
  },
  move: {
    shadow: colourModifiers.hoverAction(rawColours.primary.black.black),
  },
  phaseLabel: {
    background: colourModifiers.textBackground(rawColours.primary.black[200]),
    backgroundExpanded: colourModifiers.loginBackground(
      rawColours.primary.black[200]
    ),
  },
  globalHeader: {
    background: rawColours.primary.black.black,
    button: colourModifiers.selectedAction(rawColours.primary.black.black),
  },
  globalSubHeader: {
    downloadButtonIcon: rawColours.primary.black[200],
  },
  toggle: {
    done: rawColours.primary.greenBlue.secondary,
    draft: rawColours.status.inProgress.secondary,
  },
  taskCell: {
    shadow: {
      bottom: colourModifiers.shadow(rawColours.primary.black.black),
      top: colourModifiers.secondaryShadow(rawColours.primary.black.black),
    },
    avatar: {
      border: rawColours.primary.black[100],
    },
    refNumber: {
      background: colourModifiers.rowOpacity(rawColours.primary.black.black),
    },
    background: {
      notRequired: rawColours.status.notRequired.light,
      notStarted: rawColours.status.notStarted.light,
      inProgress: rawColours.status.inProgress.light,
      done: rawColours.status.done.light,
      template: rawColours.status.template.light,
      withOpacity: {
        notRequired: colourModifiers.opaque(
          rawColours.status.notRequired.light
        ),
        notStarted: colourModifiers.opaque(rawColours.status.notStarted.light),
        inProgress: colourModifiers.opaque(rawColours.status.inProgress.light),
        done: colourModifiers.opaque(rawColours.status.done.light),
        template: colourModifiers.opaque(rawColours.status.template.light),
      },
      filteredOut: {
        notRequired: colourModifiers.filterOut(
          rawColours.status.notRequired.light
        ),
        notStarted: colourModifiers.filterOut(
          rawColours.status.notStarted.light
        ),
        inProgress: colourModifiers.filterOut(
          rawColours.status.inProgress.light
        ),
        done: colourModifiers.filterOut(rawColours.status.done.light),
        template: colourModifiers.filterOut(rawColours.status.template.light),
      },

      filteredIn: {
        notRequired: colourModifiers.filterIn(
          rawColours.status.notRequired.dark
        ),
        notStarted: colourModifiers.filterIn(rawColours.status.notStarted.dark),
        inProgress: colourModifiers.filterIn(rawColours.status.inProgress.dark),
        done: colourModifiers.filterIn(rawColours.status.done.dark),
        template: colourModifiers.filterIn(rawColours.status.template.dark),
      },
    },
    notRequired: {
      icon: rawColours.primary.red.primary,
      chip: rawColours.status.notRequired.primary,
      label: colourModifiers.disableText(rawColours.primary.black.black),
    },
    assignee: {
      hover: colourModifiers.hover(rawColours.primary.white.primary),
      filteredIn: {
        done: rawColours.status.done.primary,
        inProgress: rawColours.status.inProgress.primary,
        notStarted: rawColours.status.notStarted.primary,
      },
    },
  },
  toolbar: {
    text: colourModifiers.secondaryText(rawColours.primary.white.primary),
  },
  named: {
    black: {
      main: rawColours.primary.black.black,
      200: rawColours.primary.black[200],
      100: rawColours.primary.black[100],
      10040: colourModifiers.levelIndicator(rawColours.primary.black[100]),
    },
    beige: {
      main: rawColours.primary.grey.main,
      200: rawColours.primary.grey[200],
      100: rawColours.primary.grey[100],
    },
    red: {
      main: rawColours.error.primary,
      200: rawColours.primary.red.primary,
    },
    grey: {
      main: rawColours.primary.grey.main,
      300: rawColours.primary.black[100],
      200: rawColours.primary.grey[200],
      100: rawColours.primary.grey,
    },
    purple: {
      main: rawColours.primary.purple,
      300: rawColours.primary.purple.secondary,
      200: rawColours.primary.purple[200],
      100: rawColours.primary.purple[100],
    },
    blue: {
      main: rawColours.primary.primary.main,
    },
  },
  theme: {
    primary: {
      500: rawColours.primary.primary.main,
      main: rawColours.primary.primary.main,
      100: rawColours.primary.primary.main,
    },
    secondary: {
      main: rawColours.primary.red.primary,
    },
  },
  editor: {
    hover: rawColours.primary.grey[200],
  },
  avatar: {
    hover: rawColours.primary.black[100],
    hoverBackground: colourModifiers.hoverAction(
      rawColours.primary.black.black
    ),
  },
  matterSwitcher: {
    matterHeader: {
      nonSelectedTab: rawColours.primary.grey.main,
      hoverTabBackground: rawColours.primary.grey[200],
      selectedTabTextColour: rawColours.primary.black[200],
    },
    selectedMatter: {
      background: rawColours.dialog.backgroundDark,
      backgroundNoOpacity: rawColours.dialog.backgroundDark,
    },
    workstreamChip: {
      hover: rawColours.primary.grey[200],
    },
  },
  listItem: {
    hoverBackground: colourModifiers.hoverAction(
      rawColours.primary.black.black
    ),
  },
  roadmap: {
    divider: colourModifiers.secondaryBackground(rawColours.primary.black[200]),
    timeScale: rawColours.primary.grey[200],
    timeScaleText: rawColours.primary.black.black,
    expandableArea: colourModifiers.rowOpacity(rawColours.primary.black.black),
    expandableAreaHover: rawColours.dialog.background,
  },
  tooltipBackgroundColour: colourModifiers.primaryBackground(
    rawColours.primary.black[100]
  ),
  levelSelector: {
    unselected: rawColours.dialog.background,
  },
  taskPreview: {
    mask: 'rgba(0,0,0,0.2)',
  },
  rateTableCards: {
    clientNotRetired: '#4E5BA6',
    clientRetired: '#3C4580',
    orgNotRetired: '#0E9384',
    orgRetired: '#065B51',
    matter: rawColours.primary.primary.main,
    retiredChip: '#696969',
  },
}
