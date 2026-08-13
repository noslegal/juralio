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

export const getRandomLoadingScreenTip = t => {
  const tips = {
    splitWorksteam: t('loadingScreen.splitWorkstream'),
    matterViewer: t('loadingScreen.matterViewer'),
    trafficLights: t('loadingScreen.trafficLights'),
    download: t('loadingScreen.download'),
    preview: t('loadingScreen.preview'),
    meetingNote: t('loadingScreen.meetingNote'),
    privateWorkstream: t('loadingScreen.privateWorkstream'),
    milestones: t('loadingScreen.milestones'),
    avatar: t('loadingScreen.avatar'),
    labels: t('loadingScreen.labels'),
    overview: t('loadingScreen.overview'),
  }
  let keys = Object.keys(tips)
  return tips[keys[(keys.length * Math.random()) << 0]]
}
