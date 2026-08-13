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

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import backend from 'i18next-xhr-backend'
import queryString from 'querystring-browser'
// https://github.com/i18next/i18next-browser-languageDetector#detector-options
const detectorOptions = {
  // avoid using any other detectors for now so we don't show translations that aren't fully ready
  order: ['hashedPathQueryParam'],
  lookupQuerystring: 'lng',
}

const backendOptions = {
  loadPath: '/locales/{{lng}}.json',
  crossDomain: false,
  withCredentials: false,
  overrideMimeType: false,
}

const reactI18NextOptions = {
  useSuspense: true,
}

const hashedPathQueryParamDetector = {
  name: 'hashedPathQueryParam',
  lookup: () => {
    const location = document.location.href
    if (location.includes('?')) {
      const splitPath = location.split('?')

      if (splitPath && splitPath.length === 2) {
        const pathQueryString = splitPath[1]
        const languageParameter = queryString.parse(pathQueryString).lng

        return languageParameter
      }
    }
  },
  cacheUserLanguage: () => {},
}

const detector = new LanguageDetector()
detector.addDetector(hashedPathQueryParamDetector)

i18n
  .use(detector)
  .use(backend)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: detectorOptions,
    backend: backendOptions,
    react: reactI18NextOptions,
  })

export default i18n
