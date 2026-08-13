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

const developerKey = import.meta.env.VITE_GOOGLE_API_DEVELOPER_KEY
const clientId = import.meta.env.VITE_GOOGLE_API_CLIENT_ID
const scope = import.meta.env.VITE_GOOGLE_API_SCOPE
const appId = import.meta.env.VITE_GOOGLE_API_APP_ID

export const isGoogleDriveConfigured = Boolean(clientId && appId && scope)

const TOKEN_EXPIRY_BUFFER_MS = 60 * 1000

let pickerApiLoaded = false
let tokenClient
let accessToken
let accessTokenExpiresAt = 0

export function clearGoogleDriveAuth() {
  tokenClient = undefined
  accessToken = undefined
  accessTokenExpiresAt = 0
}

function isTokenValid() {
  return Boolean(accessToken) && Date.now() < accessTokenExpiresAt
}

function ensurePickerLoaded() {
  return new Promise(resolve => {
    if (pickerApiLoaded) {
      resolve()
      return
    }
    window.gapi.load('picker', () => {
      pickerApiLoaded = true
      resolve()
    })
  })
}

function ensureToken(onToken, onError) {
  if (!tokenClient) {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: scope,
      callback: '',
      error_callback: '',
    })
  }
  tokenClient.callback = tokenResponse => {
    if (tokenResponse.error) {
      clearGoogleDriveAuth()
      onError(tokenResponse.error)
      return
    }
    accessToken = tokenResponse.access_token
    const expiresInMs = Number(tokenResponse.expires_in || 0) * 1000
    accessTokenExpiresAt =
      Date.now() + Math.max(0, expiresInMs - TOKEN_EXPIRY_BUFFER_MS)
    onToken()
  }
  tokenClient.error_callback = error => {
    clearGoogleDriveAuth()
    onError(error.message || error.type)
  }
  tokenClient.requestAccessToken({
    prompt: isTokenValid() ? '' : 'select_account',
  })
}

function setJuralioDialogVisible(visible) {
  const jurDialog = document.querySelector("div[data-test='juralio-dialog']")
  if (jurDialog) jurDialog.style.display = visible ? 'unset' : 'none'
}

export function loadPicker(componentCallback) {
  ensurePickerLoaded().then(() => {
    ensureToken(
      () => showPicker(componentCallback),
      error => componentCallback({ error })
    )
  })
}

export function createDriveDoc(componentCallback, name = 'Untitled Document') {
  ensurePickerLoaded().then(() => {
    ensureToken(
      () =>
        showFolderPicker(async data => {
          if (data.error) {
            setJuralioDialogVisible(true)
            componentCallback({ error: data.error })
          } else if (data.action === window.google.picker.Action.CANCEL) {
            setJuralioDialogVisible(true)
            componentCallback({ action: window.google.picker.Action.CANCEL })
          } else if (data.action === window.google.picker.Action.PICKED) {
            setJuralioDialogVisible(true)
            const folderId = data.docs[0].id
            try {
              const res = await fetch(
                'https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink',
                {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    name,
                    mimeType: 'application/vnd.google-apps.document',
                    parents: [folderId],
                  }),
                }
              )
              if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                  clearGoogleDriveAuth()
                }
                const errorBody = await res.json().catch(() => ({}))
                componentCallback({
                  error:
                    errorBody?.error?.message ||
                    `Google Drive error (${res.status})`,
                })
                return
              }
              const file = await res.json()
              componentCallback({
                action: window.google.picker.Action.PICKED,
                docs: [{ id: file.id, name: file.name, url: file.webViewLink }],
              })
            } catch (err) {
              componentCallback({ error: err.message })
            }
          }
        }),
      error => componentCallback({ error })
    )
  })
}

function showPicker(componentCallback) {
  const view = new window.google.picker.DocsView()
    .setIncludeFolders(true)
    .setSelectFolderEnabled(false)

  const picker = new window.google.picker.PickerBuilder()
    .enableFeature(window.google.picker.Feature.SUPPORT_DRIVES)
    .setAppId(appId)
    .setOAuthToken(accessToken)
    .addView(view)
    .addView(new window.google.picker.DocsUploadView())
    .setDeveloperKey(developerKey)
    .setMaxItems(1)
    .setCallback(data => {
      if (
        data.action === window.google.picker.Action.PICKED ||
        data.action === window.google.picker.Action.CANCEL
      ) {
        setJuralioDialogVisible(true)
      }
      componentCallback(data)
    })
    .build()

  picker.setVisible(true)
  setJuralioDialogVisible(false)
}

function showFolderPicker(folderCallback) {
  const view = new window.google.picker.DocsView()
    .setIncludeFolders(true)
    .setSelectFolderEnabled(true)
    .setMimeTypes('application/vnd.google-apps.folder')

  const picker = new window.google.picker.PickerBuilder()
    .enableFeature(window.google.picker.Feature.SUPPORT_DRIVES)
    .setTitle('Select folder')
    .setAppId(appId)
    .setOAuthToken(accessToken)
    .addView(view)
    .setDeveloperKey(developerKey)
    .setCallback(folderCallback)
    .build()

  picker.setVisible(true)
  setJuralioDialogVisible(false)
}
