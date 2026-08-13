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

import FeaturedPlayListIcon from '@mui/icons-material/FeaturedPlayList'
import FeedbackIcon from '@mui/icons-material/Feedback'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import TwoColumnList from '../../components/layouts/two-column-list/TwoColumnList'
import AllTipCards from './AllTipCards'
import SupportAndFeedback from './SupportAndFeedback'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: `calc(100% - ${theme.spacing(4)})`,
  },
}))

const HowToUseJuralio = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const auth = useSelector(state => state.auth)
  const roles = auth.data.details.roles
    ? [...auth.data.details.roles, ...auth.data.auth.roles]
    : auth.data.auth.roles

  useEffect(() => {
    document.title = t('howToUseJuralio.title')
  }, [t])

  let listItems = {
    tipCards: {
      dataTest: 'tipCards',
      prompt: t('howToUseJuralio.title'),
      header: t('howToUseJuralio.tipCardsHeader'),
      subtitle: t('howToUseJuralio.tipCardsSubheader'),
      icon: <FeaturedPlayListIcon />,
      component: (
        <AllTipCards userRoles={roles} icon={<FeaturedPlayListIcon />} t={t} />
      ),
    },
    supportAndFeedback: {
      dataTest: 'supportAndFeedback',
      prompt: t('howToUseJuralio.title'),
      header: t('howToUseJuralio.supportHeader'),
      subtitle: t('howToUseJuralio.supportSubheader'),
      icon: <FeedbackIcon />,
      component: <SupportAndFeedback icon={<FeedbackIcon />} t={t} />,
    },
  }

  return (
    <div className={classes.root}>
      <TwoColumnList listItems={listItems} />
    </div>
  )
}

export default HowToUseJuralio
