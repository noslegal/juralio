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

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { updateSelf } from '../../../../app/users/users-actions'
import {
  checkNameIsValidLength,
  checkTextHasNonWhitespaceContent,
} from '../../../../services/helpers/text/text-util-helper'
import FTUEScreen from '../FTUEScreen'
import FTUEWizard from '../FTUEWizard'
import WizardImg2 from './img/ftueHomeImg2.svg'
import WizardImg4 from './img/ftueHomeImg4.svg'
import WizardImg5 from './img/ftueHomeImg5.svg'
import UsernameDialog from './UsernameDialog'
const HomeScreenFtue = props => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [disableNext, setDisableNext] = useState(false)
  const [validName, setValidName] = useState(false)
  const titles = [
    t('ftue.home.howItWorks'),
    t('ftue.home.switcher'),
    t('ftue.home.templates'),
  ]
  const user = useSelector(state => state.auth.data.details)
  const [forceIndexIncrement, setForceIndexIncrement] = useState(false)

  const [noName, setNoName] = useState(
    !(
      user.firstname &&
      user.firstname.length > 0 &&
      user.lastname &&
      user.lastname.length > 0
    )
  )

  if (noName) {
    titles.splice(0, 0, t('ftue.home.noName'))
  }
  const [disableClose, setDisableClose] = useState(noName)

  const validateName = name =>
    name &&
    checkNameIsValidLength(name) &&
    checkTextHasNonWhitespaceContent(name)

  const setName = (firstName, lastName) => {
    dispatch(
      updateSelf({
        firstname: firstName,
        lastname: lastName,
        isThirdPartyUser: user.isThirdPartyUser,
        thirdPartyUserId: user.thirdPartyUserId,
      })
    ).then(() => {
      setDisableClose(false)
      setDisableNext(false)
      setValidName(true)
    })
  }

  const handleNamechange = (firstName, lastName) => {
    if (validateName(firstName) && validateName(lastName)) {
      setName(firstName, lastName)
      if (!forceIndexIncrement) {
        //only auto increment once
        setForceIndexIncrement(true)
      }
    } else {
      setDisableClose(true)
      setDisableNext(true)
      setValidName(false)
    }
  }
  return (
    <FTUEWizard
      ftueFlagName="hasSeenHomePage"
      data-test="home-ftue"
      titles={titles}
      forceIndexIncrement={forceIndexIncrement}
      indexUpdate={index => {
        if (noName && !validName && index === 0) {
          setDisableClose(true)
          setDisableNext(true)
        }
      }}
      disableClose={disableClose}
      disableNext={disableNext}
      onClose={props.onClose}
    >
      {noName && <UsernameDialog handleNamechange={handleNamechange} />}
      <FTUEScreen
        datatest="screen2"
        imageurl={WizardImg2}
        subTitleText={t('ftue.home.howItWorksSubtitle')}
      />
      <FTUEScreen
        datatest="screen4"
        imageurl={WizardImg4}
        subTitleText={t('ftue.home.switcherSubtitle')}
        dangerous={true}
      />
      <FTUEScreen
        datatest="screen5"
        imageurl={WizardImg5}
        subTitleText={t('ftue.home.templatesSubtitle')}
        dangerous={true}
      />
    </FTUEWizard>
  )
}

export default HomeScreenFtue
