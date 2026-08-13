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

import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import { Button, Typography } from '@mui/material'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import image from '../../assets/images/HillWalk.png'
import withLoader from '../../components/feedback/with-loader/WithLoader'
import { useIsViewOnly } from '../../hooks/matter/viewer/matter-viewer-hooks'
import juralioTheme from '../../theme/juralio-theme'
import { USER_ROLES } from '../constants'
import CreateNewButtonCardMasonry from '../home/matter-masonry/CreateNewButtonCardMasonry'
import TemplateCard from './template-card/TemplateCard'
import TemplateFilterButton from './TemplateFilterButton'
import SearchFilter from './SearchFilter'
import TemplateJsonImportDialogContainer from './template-json-import/TemplateJsonImportDialogContainer'
const useStyles = makeStyles()(theme => ({
  importButton: {
    marginLeft: theme.spacing(1),
    textTransform: 'unset',
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  templateListsContainer: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    paddingBottom: theme.spacing(11),

    [theme.breakpoints.down('md')]: {
      paddingTop: theme.spacing(1.75),
    },
  },
  allTemplatesWrapper: {
    marginTop: theme.spacing(1),
    display: 'flex',
    flexFlow: 'wrap',
    flexBasis: ' 100px',
  },
  favouritesWrapper: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    display: 'flex',
    flexFlow: 'wrap',
  },
  listTitle: {
    color: juralioTheme.palette.text.primary,
  },
  noFavourites: {
    color: juralioTheme.palette.text.secondary,
    marginBottom: theme.spacing(2),
  },
  noFavouriteIcon: {
    height: theme.spacing(2),
    marginBottom: '-2px',
  },
  zeroState: {
    width: ' 50%',
    marginLeft: 'auto',
    marginTop: '-60px',
    marginRight: 'auto',
    display: 'block',
    marginBottom: '16px',
    pointerEvents: 'none',
  },
  zeroStateDiv: {
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  filterWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(),
  },
}))

const TemplateList = props => {
  const userRoles = useSelector(state => state.auth.data.auth.roles)
  const { t } = useTranslation()
  const { classes } = useStyles()
  const isViewOnly = useIsViewOnly({ activities: [] })
  const [selectedTemplateFilter, setSelectedTemplateFilter] = useState(0)
  const [filterString, setFilterString] = useState('')
  const [showImportDialog, setShowImportDialog] = useState(false)

  const canImport =
    userRoles.includes(USER_ROLES.ROLE_KNOWLEDGE_MANAGER) &&
    userRoles.includes(USER_ROLES.ROLE_ORG_ADMIN)
  const templateTypeEnum = {
    0: t('templates.filter.all'),
    1: t('templates.filter.organisation'),
    2: t('templates.filter.community'),
    3: t('templates.filter.drafts'),
  }

  useEffect(() => {
    if (selectedTemplateFilter === 2) {
      //reset filter when new template is made and in community setting
      setSelectedTemplateFilter(0)
      setFilterString('')
    }
  }, [props.templates]) //eslint-disable-line

  if (!props.templates || props.templates.length === 0)
    return (
      <div className={classes.zeroStateDiv}>
        <img
          src={image}
          alt="Zero state graphic"
          data-test="zero-state-image"
          className={classes.zeroState}
        />
        <Typography
          style={{ textAlign: 'center' }}
          variant={'h4'}
          data-test="template-zero-state"
        >
          {t('templates.zeroState')}
        </Typography>
        {userRoles.includes(USER_ROLES.ROLE_KNOWLEDGE_MANAGER) && (
          <Typography
            style={{ textAlign: 'center' }}
            variant={'h6'}
            data-test="template-zero-state-caption"
          >
            {t('templates.zeroStateCaption')}
          </Typography>
        )}
      </div>
    )

  const isInFilterList = template => {
    switch (parseInt(selectedTemplateFilter)) {
      case 0:
        return true
      case 1:
        return !template.isSystemTemplate
      case 2:
        return template.isSystemTemplate
      case 3:
        return !template.published
      default:
        return true
    }
  }

  const filterTemplateBySearchString = template => {
    return (
      template.name.toLowerCase().includes(filterString.toLowerCase()) ||
      (template.providedBy &&
        template.providedBy
          .toLowerCase()
          .includes(filterString.toLowerCase())) ||
      (template.urlTags &&
        template.urlTags
          .map(t => t.toLowerCase())
          .includes(filterString.toLowerCase()))
    )
  }

  const favourites = props.templates.filter(
    template => template.isFavourited && filterTemplateBySearchString(template)
  )
  const others = props.templates.filter(
    template =>
      !template.isFavourited &&
      isInFilterList(template) &&
      filterTemplateBySearchString(template)
  )

  return (
    <div className={classes.templateListsContainer}>
      <div className={classes.filterWrapper}>
        <TemplateFilterButton
          templatesEnum={templateTypeEnum}
          selectedTemplateFilter={selectedTemplateFilter}
          setSelectedTemplateFilter={setSelectedTemplateFilter}
          isKnowledgeManager={userRoles.includes(
            USER_ROLES.ROLE_KNOWLEDGE_MANAGER
          )}
        />
        <SearchFilter
          filterString={filterString}
          setFilterString={setFilterString}
          helperText={t('templates.filter.findATemplate')}
        />
        {canImport && (
          <Button
            className={classes.importButton}
            startIcon={<FileUploadIcon />}
            variant="contained"
            data-test="import-template-json-button"
            onClick={() => setShowImportDialog(true)}
          >
            {t('templateJsonImport.importButton')}
          </Button>
        )}
      </div>
      {showImportDialog && (
        <TemplateJsonImportDialogContainer
          cancelHandler={() => setShowImportDialog(false)}
        />
      )}
      <div>
        <Typography variant="subtitle1" className={classes.listTitle}>
          {t('templateOverview.yourFavourites')}
        </Typography>
        {!favourites.length && filterString.length > 0 && (
          <div data-test="favourites-zero-state">
            <Typography variant="subtitle2" className={classes.noFavourites}>
              {t('templateOverview.noFavouritesMatchingThatFilter')}
            </Typography>
          </div>
        )}
        {!favourites.length && !filterString.length > 0 && (
          <div data-test="favourites-zero-state">
            <Typography variant="subtitle2" className={classes.noFavourites}>
              {t('templateOverview.noFavourites1')}
              <FavoriteBorderIcon className={classes.noFavouriteIcon} />
              {t('templateOverview.noFavourites2')}
            </Typography>
          </div>
        )}
        <div className={classes.favouritesWrapper} data-test="favouritesList">
          {favourites.map(template => {
            return (
              <TemplateCard
                template={template}
                key={template.id}
                clickHandler={props.clickHandler}
                isFavourited={template.isFavourited}
                isFavouriteActive={true}
                listContext={true}
                showFavourite={true}
                disableFavouriting={false}
              />
            )
          })}
        </div>
      </div>
      {props.templates.length > 0 && (
        <div>
          <div data-test="otherOrgTemplates" className={classes.titleWrapper}>
            <Typography variant="subtitle1" className={classes.listTitle}>
              {t('templateOverview.otherTemplates')}
            </Typography>
          </div>

          <div
            className={classes.allTemplatesWrapper}
            data-test="otherOrgTemplatesList"
          >
            {userRoles.includes(USER_ROLES.ROLE_KNOWLEDGE_MANAGER) && (
              <CreateNewButtonCardMasonry
                bMatterTemplate={false}
                key={'create-template'}
              />
            )}
            {others.map(template => {
              return (
                <TemplateCard
                  template={template}
                  key={template.id}
                  clickHandler={props.clickHandler}
                  isFavouriteActive={true}
                  listContext={true}
                  disableFavouriting={isViewOnly}
                  isFavourited={false}
                  showFavourite={true}
                />
              )
            })}
            {!userRoles.includes(USER_ROLES.ROLE_KNOWLEDGE_MANAGER) &&
              others.length === 0 && (
                <div className={classes.zeroStateDiv}>
                  <img
                    src={image}
                    alt="Zero state graphic"
                    data-test="zero-state-image"
                    className={classes.zeroState}
                  />
                  <Typography
                    style={{ textAlign: 'center' }}
                    variant={'h4'}
                    data-test="template-zero-state"
                  >
                    {filterString.length > 0
                      ? t('templates.filter.filterZeroState')
                      : t('templates.filter.zeroState')}
                  </Typography>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  )
}

TemplateList.propTypes = {
  /** Template object list */
  templates: PropTypes.array.isRequired,
  /** Template card click handler */
  clickHandler: PropTypes.func.isRequired,
  /** Organisation name */
  organisationName: PropTypes.string,
}

export default withLoader(200)(TemplateList)
