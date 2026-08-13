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

import { Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import { favouriteTemplate } from '../../../../app/template/template-actions'
import { favouriteTemplateInList } from '../../../../app/template-list/template-list-actions'
import FavouriteTemplateButton from '../../../../app/template/overview/FavouriteTemplateButton'
import SimpleChip from '../../../data-display/simple-chip/SimpleChip'
import juralioColours from '../../../../theme/juralio-colours'
import rawColours from '../../../../theme/raw-colours'

const useStyles = makeStyles()(theme => ({
  templateItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    height: theme.spacing(9),
    margin: `${theme.spacing(0.75)} ${theme.spacing(1.5)}`,
    padding: theme.spacing(1),
    border: '1px solid rgba(0,0,0,0.2)',
    borderRadius: theme.spacing(0.5),
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  templateItemOrg: {
    backgroundColor: rawColours.primary.purple[100],
    '&:hover': { backgroundColor: rawColours.primary.purple[200] },
  },
  selectedOrg: {
    backgroundColor: rawColours.primary.purple.dark,
  },
  dataColumn: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 1,
    overflow: 'hidden',
    paddingRight: theme.spacing(1),
  },
  nameBox: {
    backgroundColor: 'rgba(235, 236, 242, 0.8)',
    borderRadius: theme.spacing(0.5),
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
    width: 'fit-content',
    maxWidth: '100%',
    marginBottom: theme.spacing(0.25),
    minWidth: 0,
  },
  nameBoxSystem: {
    borderRadius: '4px 4px 4px 0px',
  },
  name: {
    fontSize: theme.spacing(1.625),
    fontWeight: 500,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  providerBox: {
    backgroundColor: 'rgba(235, 236, 242, 0.8)',
    borderRadius: '0px 0px 4px 4px',
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
    width: 'fit-content',
    maxWidth: '100%',
  },
  provider: {
    fontSize: theme.spacing(1.375),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: rawColours.primary.black[200],
  },
  previewPane: {
    flexShrink: 0,
    borderRadius: theme.spacing(0.5),
    alignSelf: 'stretch',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    width: theme.spacing(10),
    backgroundColor: 'white',
  },
  iconColumn: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    overflow: 'hidden',
  },
}))

const TemplateItem = ({ template, isSelected, onClick }) => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const isOrg = !template.isSystemTemplate

  const itemClass = [
    classes.templateItem,
    classes.templateItemOrg,
    isSelected ? classes.selectedOrg : '',
  ].join(' ')

  return (
    <div
      className={itemClass}
      onClick={onClick}
      data-test="template-switcher-template-item"
    >
      <div className={classes.iconColumn}>
        <FavouriteTemplateButton
          hearted={template.isFavourited}
          disableFavouriting={false}
          action={() => {
            const id = template.databaseUID ? template.databaseUID : template.id
            dispatch(favouriteTemplate(id, !template.isFavourited))
            dispatch(
              favouriteTemplateInList(template.id, !template.isFavourited)
            )
          }}
        />
      </div>
      <div className={classes.dataColumn}>
        <div className={classes.nameRow}>
          <div
            className={[
              classes.nameBox,
              template.isSystemTemplate ? classes.nameBoxSystem : '',
            ].join(' ')}
          >
            <Typography className={classes.name}>{template.name}</Typography>
          </div>
          {!isOrg && !template.published && (
            <SimpleChip
              text={t('templates.draft')}
              options={{
                color: juralioColours.whiteText.primary,
                backgroundColor: juralioColours.named.black[100],
              }}
            />
          )}
        </div>
        {template.isSystemTemplate && (
          <div className={classes.providerBox}>
            <Typography className={classes.provider}>
              {template.providedBy
                ? t('templates.providedBy') + template.providedBy
                : t('templates.systemTemplate')}
            </Typography>
          </div>
        )}
      </div>
      {isOrg && !template.published && (
        <div className={classes.iconColumn}>
          <SimpleChip
            text={t('templates.draft')}
            options={{
              color: juralioColours.whiteText.primary,
              backgroundColor: juralioColours.named.black[100],
            }}
          />
        </div>
      )}
    </div>
  )
}

export default TemplateItem
