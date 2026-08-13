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

import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import AddButton from '../../../../../../components/inputs/add-button/AddButton'
import NewPostMenu from './NewPostMenu'
import PostTitle from './PostTitle'
import { useMediaQuery } from '@mui/material'
import juralioTheme from '../../../../../../theme/juralio-theme'

const useStyles = makeStyles()(theme => ({
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  addBtn: {
    marginLeft: 'auto',
    paddingRight: '16px',
  },
}))

const PostListHeader = props => {
  const isSmallScreen = useMediaQuery(juralioTheme.breakpoints.down('ss'))
  const [anchorEl, setAnchorEl] = useState(null)
  const { classes } = useStyles()
  const { t } = useTranslation()
  const [isTemplate, setIsTemplate] = useState(false)

  const checkIsTemplate = () => {
    if (props.templateId) {
      setIsTemplate(true)
    } else {
      setIsTemplate(false)
    }
  }

  useEffect(() => {
    checkIsTemplate()
  }, [props.templateId]) //eslint-disable-line

  return (
    <>
      <div
        style={isSmallScreen ? { marginTop: '10px', display: 'block' } : {}}
        className={classes.header}
      >
        <PostTitle
          isTemplate={isTemplate}
          isMilestone={props.isMilestone}
          isDeliverable={props.isDeliverable}
        />
        {props.isEditor &&
          !props.isReadOnly &&
          !props.viewOnly &&
          !props.postLimit && (
            <>
              <div
                style={isSmallScreen ? { justifyItems: 'center' } : {}}
                className={classes.addBtn}
              >
                <AddButton
                  text={t('postsList.createAPost')}
                  onClick={e => setAnchorEl(e.currentTarget)}
                  data-test="create-post-button-post-title"
                  width={120}
                />
              </div>
              <NewPostMenu
                menuItemClickCallback={() => setAnchorEl(null)}
                anchorEl={anchorEl}
                origin="center"
                isTemplate={isTemplate}
                isPostListHeaderBtn={true}
                taskId={props.taskId}
              />
            </>
          )}
      </div>
    </>
  )
}
export default PostListHeader
