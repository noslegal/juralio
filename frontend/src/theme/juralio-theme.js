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

import { createTheme } from '@mui/material'
import juralioColours from './juralio-colours'
import { JuralioCoreColors } from './juralio-core-colors'

export default createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      ss: 1000,
      lg: 1200,
      xl: 1536,
    },
  },
  typography: {
    fontFamily: 'Montserrat',
    h1: {
      lineHeight: '120px',
    },
    h2: {
      lineHeight: '74px',
    },
    h3: {
      lineHeight: '58px',
    },
    h4: {
      lineHeight: '42px',
    },
    h5: {
      lineHeight: '28px',
    },
    h6: {
      lineHeight: '24px',
    },
    body1: {
      lineHeight: '20px',
      fontSize: '0.875rem',
    },
    body2: {
      lineHeight: '28px',
      fontSize: '1rem',
    },
    subtitle1: {
      lineHeight: '24px',
    },
    subtitle2: {
      lineHeight: '24px',
    },
    caption: {
      lineHeight: '16px',
    },
    overline: {
      lineHeight: '16px',
      letterSpacing: 2,
    },
  },
  palette: {
    background: {
      default: JuralioCoreColors.background.default,
    },
    primary: {
      main: JuralioCoreColors.primary.main, // Set main and MUI will derive the other shades.
    },
    secondary: {
      main: JuralioCoreColors.secondary.main, // Set main and MUI will derive the other shades.
    },
    text: {
      primary: juralioColours.darkText.primary,
      secondary: juralioColours.darkText.secondary,
      disabled: juralioColours.darkText.disabled,
    },
  },
  components: {
    MuiTextField: {
      defaultProps: {
        variant: 'standard',
      },
    },

    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#E1DED8',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          background: 'white',
          opacity: 0.54,
          borderRadius: 4,
        },
        input: { padding: '11px 12px' },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          paddingTop: 11,
          paddingBottom: 11,
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        root: {
          marginTop: 0,
          marginBottom: 0,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: '36px 54px 24px',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '0px 54px 24px',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          height: 24,
          minHeight: 0,
          paddingTop: 11,
          paddingBottom: 11,
          boxSizing: 'content-box',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        body: {
          fontSize: '0.8125rem',
        },
      },
    },

    MuiTypography: {
      styleOverrides: {
        root: {
          display: 'block',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: '0.8125rem',
        },
      },
    },

    MuiSelect: {
      defaultProps: {
        variant: 'standard',
      },
      styleOverrides: {
        select: {
          '& :focus': {
            borderRadius: '4px',
          },
        },
      },
    },
  },
})
