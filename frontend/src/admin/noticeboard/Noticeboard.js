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

import ErrorIcon from '@mui/icons-material/Error'
import ImageIcon from '@mui/icons-material/Image'
import InfoIcon from '@mui/icons-material/Info'
import { Button, TextField, Typography } from '@mui/material'
import classNames from 'classnames'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import IconWithHeader from '../../components/data-display/icon-with-header/IconWithHeader'
import InfoHelperText from '../../components/data-display/info-helper-text/InfoHelperText'
import Slide from '../../components/data-display/slide/Slide'
import juralioColours from '../../theme/juralio-colours'
import { MattersIcon } from '../../theme/navigation/CommonIcons'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    maxWidth: theme.spacing(133),
    margin: 'auto',
  },
  slideDeckHeader: {
    paddingLeft: theme.spacing(2),
  },
  slideDeck: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    backgroundColor: juralioColours.control.contrast,
  },
  slideDeckContent: {
    padding: theme.spacing(3),
  },
  slideDeckTitle: { display: 'flex', alignItems: 'center' },
  slideDeckBody: {
    paddingTop: theme.spacing(1),
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  slide: {
    padding: theme.spacing(1),
  },
  uploadWidget: {
    width: '100%',
    backgroundColor: juralioColours.control.background,
  },
  uploadWidgetContent: {
    padding: theme.spacing(3),
  },
  form: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    paddingLeft: theme.spacing(2),
  },
  uploadImage: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
  },
  uploadText: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
  imagePreviewer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: theme.spacing(21),
    height: theme.spacing(21),
    margin: 'auto',
  },
  imagePreviewerNoImage: {
    borderStyle: 'dashed',
    borderColor: juralioColours.matterDialog.border,
    color: juralioColours.named.black[200],
  },
  imagePreview: {
    width: theme.spacing(6),
    height: theme.spacing(6),
    marginBottom: theme.spacing(),
  },
  buttonFloatRight: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  addButton: {
    width: theme.spacing(15),
    marginTop: theme.spacing(2),
  },
  disabledAddButton: {
    backgroundColor: juralioColours.iconDisabled,
  },
  infoHelperTextWrapper: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  },
  textField: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(),
  },
  uploadImageHintText: {
    paddingTop: theme.spacing(),
  },
  uploadButton: {
    width: '100%',
    marginTop: theme.spacing(),
  },
}))

const Noticeboard = props => {
  const {
    svg,
    title,
    subtitle,
    helperText,
    onSvgChange,
    onTitleChange,
    onSubtitleChange,
    submitDisabled,
    uploadNotice,
    listNotices,
    noticesMeta,
    notices,
    featureNotice,
    deleteNotice,
  } = props
  const { t } = useTranslation()
  const { classes } = useStyles()

  useEffect(() => {
    listNotices()
  }, []) // eslint-disable-line

  const isUnavailable = (metaList, metaItem) => {
    let results = metaList.filter(
      meta => meta.featured && meta.id !== metaItem.id
    )
    return results.length > 0
  }

  const renderPreviewImage = () =>
    svg ? (
      <img
        data-test="preview-image"
        src={URL.createObjectURL(svg)}
        width="20%"
        height="20%"
        alt={t('inboxOverviewZeroState.imageAlt')}
        className={classes.imagePreviewer}
      />
    ) : (
      <div
        data-test="preview-image-zero-state"
        className={classNames(
          classes.imagePreviewer,
          classes.imagePreviewerNoImage
        )}
      >
        <ImageIcon className={classes.imagePreview} />
      </div>
    )

  const renderUploadWidget = () => (
    <div className={classes.uploadWidget}>
      <div className={classes.uploadWidgetContent}>
        <IconWithHeader
          title={t('noticeboard.header')}
          icon={MattersIcon}
          dataTest="noticeboard-header"
        />
        <div className={classes.infoHelperTextWrapper}>
          <InfoHelperText
            text={t('noticeboard.helperInfo')}
            icon={InfoIcon}
            dataTest="noticeboard-info-helper-text"
          />
        </div>
        <form
          onSubmit={uploadNotice}
          className={classes.form}
          noValidate
          autoComplete="off"
        >
          <div className={classes.uploadImage}>
            {renderPreviewImage()}

            <input
              accept="image/svg+xml"
              className={classes.input}
              hidden
              id="upload-image"
              onChange={onSvgChange}
              type="file"
              data-test="noticeboard-upload"
            />
            <label htmlFor="upload-image">
              <Button
                component="span"
                className={classes.uploadButton}
                variant="outlined"
                color="primary"
                disableElevation
                data-test="upload-image-button"
              >
                {t('noticeboard.uploadButton')}
              </Button>
            </label>

            <Typography
              variant="caption"
              className={classes.uploadImageHintText}
            >
              {t('noticeboard.uploadImageHint')}
            </Typography>
          </div>
          <div className={classes.uploadText}>
            <TextField
              className={classes.textField}
              value={title}
              onChange={onTitleChange}
              id="standard-basic"
              label="Title"
              data-test="title-text-field"
            />
            <TextField
              className={classes.textField}
              value={subtitle}
              onChange={onSubtitleChange}
              id="standard-basic"
              label="Secondary text"
              data-test="subtitle-text-field"
            />
            <div className={classes.buttonFloatRight}>
              <Button
                className={classNames(
                  classes.addButton,
                  submitDisabled() ? classes.disabledAddButton : ''
                )}
                variant="outlined"
                color="primary"
                disableElevation
                disabled={submitDisabled()}
                type="submit"
                data-test="add-notice-button"
              >
                Add
              </Button>
            </div>
            {helperText !== '' && (
              <InfoHelperText
                text={helperText}
                icon={ErrorIcon}
                error={true}
                dataTest="noticeboard-upload-error-text"
              />
            )}
          </div>
        </form>
      </div>
    </div>
  )

  const renderSlideDeck = () => (
    <div className={classes.slideDeck}>
      <div className={classes.slideDeckContent}>
        {!notices || !noticesMeta ? (
          <Typography
            className={classes.slideDeckHeader}
            data-test={'noticeboard-text'}
            variant="subtitle1"
          >
            {t('noticeboard.zeroState')}
          </Typography>
        ) : (
          <React.Fragment>
            <div className={classes.slideDeckTitle}>
              <Typography
                className={classes.slideDeckHeader}
                data-test={'noticeboard-text'}
                variant="subtitle1"
              >
                {t('noticeboard.existingSlides')}
              </Typography>
            </div>
            <div className={classes.slideDeckBody}>
              {noticesMeta.map(noticeMeta => (
                <div className={classes.slide} key={noticeMeta.id}>
                  <Slide
                    title={noticeMeta.title}
                    subtitle={noticeMeta.subtitle}
                    image={`data:image/svg+xml,${encodeURIComponent(
                      notices[noticeMeta.id]
                    )}`}
                    buttonHighlighted={noticeMeta.featured}
                    buttonText={t('slide.feature')}
                    handleButtonClick={() => featureNotice(noticeMeta.id)}
                    iconTooltipText={t('noticeboard.toolTip')}
                    handleIconClick={() => deleteNotice(noticeMeta.id)}
                    unavailableTooltipText={t('noticeboard.notFeaturedTooltip')}
                    unavailable={isUnavailable(noticesMeta, noticeMeta)}
                  />
                </div>
              ))}
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  )

  return (
    <div data-test="noticeboard-wrapper" className={classes.root}>
      {renderUploadWidget()}
      {renderSlideDeck()}
    </div>
  )
}

export default Noticeboard
