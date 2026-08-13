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

import { useEffect, useState } from 'react'
import { SSO } from '../../../app/constants'

export function useThirdPartyUsers(organisationUsers) {
  const [microsoftUsers, setMicrosoftUsers] = useState([])
  const [oktaUsers, setOktaUsers] = useState([])
  const [samlUsers, setSamlUsers] = useState([])
  const [googleUsers, setGoogleUsers] = useState([])

  useEffect(() => {
    setMicrosoftUsers(
      organisationUsers.filter(u => u.thirdPartyProvider === SSO.MICROSOFT)
    )
    setOktaUsers(
      organisationUsers.filter(u => u.thirdPartyProvider === SSO.OKTA)
    )
    setSamlUsers(
      organisationUsers.filter(u => u.thirdPartyProvider === SSO.SAML)
    )
    setGoogleUsers(
      organisationUsers.filter(u => u.thirdPartyProvider === SSO.GOOGLE)
    )
  }, [organisationUsers])

  return { microsoftUsers, oktaUsers, samlUsers, googleUsers }
}
