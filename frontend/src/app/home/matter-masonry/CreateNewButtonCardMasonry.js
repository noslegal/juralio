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

import { Button, Card, Paper } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import {
  triggerCreateNewMatterFlow,
  triggerCreateTemplateFlow,
} from '../../../components/navigation/common/dialog-triggers/dialog-trigger-actions'
import {
  AddMattersIcon,
  AddTemplatesIcon,
} from '../../../theme/navigation/CommonIcons'
import rawColours from '../../../theme/raw-colours'
import ClosableMasonryItem from './ClosableMasonryItem'

const style = makeStyles()(theme => ({
  content: {
    height: 'fit-content',
  },
  column: {
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
  },
  isTemplate: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    width: '90%',
    height: '85%',
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: rawColours.primary.purple.secondary,
    '&:hover': {
      backgroundColor: rawColours.primary.purple.dark,
    },
    color: rawColours.primary.purple[100],
  },
  isMatter: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    width: '85%',
    height: '75%',
    marginLeft: 'auto',
    marginRight: 'auto',
    color: rawColours.primary.blue.light,
    backgroundColor: rawColours.primary.matterCreateBlue.primary,
    '&:hover': {
      backgroundColor: rawColours.primary.matterCreateBlue.secondary,
    },
  },
  matterImageWrapper: {
    backgroundColor: rawColours.primary.blue.light,
    color: rawColours.primary.matterCreateBlue.primary,
    borderRadius: theme.spacing(2),
    height: theme.spacing(8),
    width: theme.spacing(10),
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: 'flex',
  },

  templateImageWrapper: {
    backgroundColor: rawColours.primary.purple[100],
    color: rawColours.primary.purple.dark,
    borderRadius: theme.spacing(2),
    height: theme.spacing(8),
    width: theme.spacing(10),
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: 'flex',
  },

  templateButtonCard: {
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(1.25),
    display: 'flex',
    flexDirection: 'row',
    maxWidth: '460px',
    minWidth: '380px',
    backgroundColor: 'transparent',
    flex: '1 1 380px',
  },
  paper: {
    backgroundColor: 'transparent',
  },
  div: { width: '15%' },
}))

const CreateNewButtonCardMasonry = props => {
  const { classes } = style()
  const { t } = useTranslation()
  const dispatch = useDispatch()

  const closeTip = () => {
    window.sessionStorage.setItem('hideTemplates', true)
    setTimeout(() => {
      props.resizeMasonry()
    }, 100)
  }

  const handleMasonryClick = () => {
    if (props.bMatterTemplate) {
      //call create matter dialog
      dispatch(triggerCreateNewMatterFlow())
    } else {
      // call create template dialog
      dispatch(triggerCreateTemplateFlow())
    }
  }

  if (props.bMatterTemplate) {
    return (
      <div class="item">
        <div className={classes.content} class="content">
          <Paper className={classes.paper} elevation={0}>
            <ClosableMasonryItem
              dataTest={'create-new-item'}
              closeTip={closeTip}
              content={
                <>
                  <Button
                    onClick={handleMasonryClick}
                    className={classes.isMatter}
                    variant="contained"
                    size="large"
                  >
                    <div>{t('matterCreation.createNewMatter')}</div>
                    <div className={classes.div}></div>

                    <div className={classes.column}>
                      <div className={classes.matterImageWrapper}>
                        {props.bMatterTemplate ? (
                          <AddMattersIcon />
                        ) : (
                          <AddTemplatesIcon />
                        )}
                      </div>
                    </div>
                  </Button>
                </>
              }
            />
          </Paper>
        </div>
      </div>
    )
  } else {
    return (
      <Card className={classes.templateButtonCard} elevation={0}>
        <Button
          onClick={handleMasonryClick}
          className={classes.isTemplate}
          variant="contained"
          size="large"
          data-test="create-template-button"
        >
          <div>{t('templateOverview.createNewTemplate')}</div>
          <div className={classes.div}></div>

          <div className={classes.column}>
            <div className={classes.templateImageWrapper}>
              <AddTemplatesIcon />
            </div>
          </div>
        </Button>
      </Card>
    )
  }
}

export default CreateNewButtonCardMasonry
