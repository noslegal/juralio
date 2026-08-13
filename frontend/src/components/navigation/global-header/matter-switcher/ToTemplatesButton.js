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

import { Button } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { makeStyles } from 'tss-react/mui'
import { TemplatesIcon } from '../../../../theme/navigation/CommonIcons'
import rawColours from '../../../../theme/raw-colours'

const style = makeStyles()(theme => ({
  templateGalleryButton: {
    marginLeft: theme.spacing(1),
    marginTop: 'auto',
    marginBottom: 'auto',
    color: rawColours.primary.purple.dark,
    minWidth: 'fit-content',
    backgroundColor: rawColours.primary.purple[100],
    '&:hover': {
      color: rawColours.primary.purple[100],
      backgroundColor: rawColours.primary.purple.secondary,
    },
    textTransform: 'none',
  },
}))

const TemplateSwitcher = () => {
  const history = useNavigate()
  const { classes } = style()
  const { t } = useTranslation()

  return (
    <Button
      component="span"
      className={classes.templateGalleryButton}
      data-test="template-navigate-button"
      style={
        window.location.href.includes('/templates')
          ? {
              color: rawColours.primary.purple[100],
              backgroundColor: rawColours.primary.purple.secondary,
            }
          : {}
      }
      onClick={() => {
        history('/templates')
      }}
      startIcon={<TemplatesIcon />}
      disableElevation
    >
      {t('navigationLinks.templates')}
    </Button>
  )
}
export default TemplateSwitcher
