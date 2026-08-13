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

import React from 'react'
import rawColours from '../../theme/raw-colours'
import AccessImage from './tip-images/AccessImage'
import AdminRolesImage from './tip-images/AdminRolesImage'
import ArchiveImage from './tip-images/ArchiveImage'
import AvatarsImage from './tip-images/AvatarsImage'
import BlankNoteImage from './tip-images/BlankNoteImage'
import BlockingLinksImage from './tip-images/BlockingLinksImage'
import CalendarImage from './tip-images/CalendarImage'
// import DateLinksImage from './tip-images/DateLinksImage'
import DocumentLinkImage from './tip-images/DocumentLinkImage'
import DownloadImage from './tip-images/DownloadImage'
import ExternalImage from './tip-images/ExternalImage'
import FiltersImage from './tip-images/FiltersImage'
import GenericPostImage from './tip-images/GenericPostImage'
import GoogleImage from './tip-images/GoogleImage'
import HashtagImage from './tip-images/HashtagImage'
import JuralioLogoImage from './tip-images/JuralioLogoImage'
import MatterSwitcherImage from './tip-images/MatterSwitcherImage'
import MeetingNoteImage from './tip-images/MeetingNoteImage'
import MilestoneImage from './tip-images/MilestoneImage'
import MiroImage from './tip-images/MiroImage'
import MultiAddImage from './tip-images/MultiAddImage'
import OverviewsImage from './tip-images/OverviewsImage'
import PreviewImage from './tip-images/PreviewImage'
import PrivateImage from './tip-images/PrivateImage'
import RecentlyViewedImage from './tip-images/RecentlyViewedImage'
import RisksImage from './tip-images/RisksImage'
import RoadmapImage from './tip-images/RoadmapImage'
import SplitImage from './tip-images/SplitImage'
import StatusImage from './tip-images/StatusImage'
import TaskmapImage from './tip-images/TaskmapImage'
import TemplateGalleryImage from './tip-images/TemplateGalleryImage'
import TemplatesImage from './tip-images/TemplatesImage'
import UploadImage from './tip-images/UploadImage'
import VariousViewsImage from './tip-images/VariousViewsImage'
import WarningImage from './tip-images/WarningImage'
import WorkflowLabelsImage from './tip-images/WorkflowLabelsImage'
import DragAndDropImage from './tip-images/DragAndDropImage'
import DeliverableImage from './tip-images/DeliverableImage'
import TasklistImage from './tip-images/TasklistImage'
//Adding a new tip card?
//Follow these steps to make it dead easy for yourself
//* Add your .js file and .svg file in the tip-card folder
//N.B. Make sure they are of the format {tipcard name }Image.js and {tipcard name}Image.svg
//run the following command to generate a new list of tipcards in juralio-mm/frontend/src/components/ftue/tip-images
//find . -name '*.js'  | awk '{print substr($0, 3, length($0) - 5)}'| awk '{print "\""$0"\","}'
//Update the TipCardNames array below
//run the follwing command in the same directory to generate the new imports list
//find . -name '*.js'  | awk '{print substr($0, 3, length($0) - 5)}'| awk '{print "import "$0" from \"./tip-images/"$0"\""}'
//replace the imports above with the output
//regenerate the generateTipImageByName case statements by using the below command in the same directory
//find . -name '*.js'  | awk '{print substr($0, 3, length($0) - 5)}'| awk '{print "case \""$0"\":\n return <"$0"/>"}'

//find . -name '*.js'  | awk '{print substr($0, 3, length($0) - 5)}'| awk '{print "\""$0"\","}'
export const TipCardNames = [
  'MatterAdminImage',
  'BlockingLinksImage',
  // 'DateLinksImage',
  'DragAndDropImage',
  'MatterSwitcherImage',
  'ExternalImage',
  'PrivateImage',
  'DocumentLinkImage',
  'AccessImage',
  'AvatarsImage',
  'FiltersImage',
  'RecentlyViewedImage',
  'WorkflowLabelsImage',
  'DownloadImage',
  'MeetingNoteImage',
  'ArchiveImage',
  'MilestoneImage',
  'StatusImage',
  'RoadmapImage',
  'AdminRolesImage',
  'GoogleImage',
  'OverviewsImage',
  // 'CalendarImage',
  // 'UploadImage',
  'HashtagImage',
  'TemplatesImage',
  'TemplateGalleryImage',
  'SplitImage',
  'VariousViewsImage',
  'BlankNoteImage',
  'PreviewImage',
  // 'PasswordResetImage',
  'MiroImage',
  'GenericPostImage',
  'TaskmapImage',
  'RisksImage',
  'MultiAddImage',
  'deliverableImage',
  'tasklistImage',
]

// ALSO ADD ANY ROLE SPECIFIC TIP CARDS HERE (for filtering)
const TipCardByRole = {
  ROLE_ORG_ADMIN: ['AdminRolesImage'],
  ROLE_MATTER_ADMIN: [
    'AccessImage',
    'SplitImage',
    'ArchiveImage',
    'PrivateImage',
  ],
  ROLE_KNOWLEDGE_MANAGER: ['TemplatesImage', 'TemplateGalleryImage'],
}

export const filterCardsByUserRole = userRoles => {
  const cardsToFilter = Object.keys(TipCardByRole)
    .filter(role => !userRoles.includes(role))
    .flatMap(role => TipCardByRole[role])
  return TipCardNames.filter(card => !cardsToFilter.includes(card))
}

const lowerCaseFirstLetter = string => {
  return string.charAt(0).toLowerCase() + string.slice(1)
}

export const generateTipCards = (t, cards = TipCardNames) => {
  return cards.map(tipCardName => {
    const tipCardWithoutImage = lowerCaseFirstLetter(
      tipCardName.substring(0, tipCardName.length - 5)
    )
    return {
      title: t(`tipCards.${tipCardWithoutImage}.title`),
      description: t(`tipCards.${tipCardWithoutImage}.description`),
      name: tipCardName,
    }
  })
}

export const isTipCardNew = name => {
  switch (name) {
    case 'PrivateImage':
      return new Date() < new Date(2022, 4, 20)
    default:
      return false
  }
}

//find . -name '*.js'  | awk '{print substr($0, 3, length($0) - 5)}'| awk '{print "case \""$0"\":\n return <"$0"/>"}'
export const generateTipImageByName = name => {
  switch (name) {
    case 'MatterAdminImage':
      return <AdminRolesImage />
    case 'MatterSwitcherImage':
      return <MatterSwitcherImage />
    case 'TemplateGalleryImage':
      return <TemplateGalleryImage />
    case 'ExternalImage':
      return <ExternalImage />
    case 'PrivateImage':
      return <PrivateImage />
    case 'DocumentLinkImage':
      return <DocumentLinkImage />
    case 'AccessImage':
      return <AccessImage />
    case 'AvatarsImage':
      return <AvatarsImage />
    case 'FiltersImage':
      return <FiltersImage />
    case 'RecentlyViewedImage':
      return <RecentlyViewedImage />
    case 'WorkflowLabelsImage':
      return <WorkflowLabelsImage />
    case 'BlockingLinksImage':
      return <BlockingLinksImage />
    // case 'DateLinksImage':
    //   return <DateLinksImage />
    case 'DragAndDropImage':
      return <DragAndDropImage />
    case 'DownloadImage':
      return <DownloadImage />
    case 'MeetingNoteImage':
      return <MeetingNoteImage />
    case 'ArchiveImage':
      return <ArchiveImage />
    case 'MilestoneImage':
      return <MilestoneImage />
    case 'StatusImage':
      return <StatusImage />
    case 'RoadmapImage':
      return <RoadmapImage />
    case 'AdminRolesImage':
      return <AdminRolesImage />
    case 'GoogleImage':
      return <GoogleImage />
    case 'OverviewsImage':
      return <OverviewsImage />
    case 'CalendarImage':
      return <CalendarImage />
    case 'UploadImage':
      return <UploadImage />
    case 'HashtagImage':
      return <HashtagImage />
    case 'TemplatesImage':
      return <TemplatesImage />
    case 'SplitImage':
      return <SplitImage />
    case 'VariousViewsImage':
      return <VariousViewsImage />
    case 'BlankNoteImage':
      return <BlankNoteImage />
    case 'PreviewImage':
      return <PreviewImage />
    // case 'PasswordResetImage':
    //   return <PasswordResetImage />
    case 'MiroImage':
      return <MiroImage />
    case 'GenericPostImage':
      return <GenericPostImage />
    case 'TaskmapImage':
      return <TaskmapImage />
    case 'RisksImage':
      return <RisksImage />
    case 'freeTrial':
      return <JuralioLogoImage />
    case 'trialExpired':
      return <WarningImage />
    case 'gracePeriod':
      return <WarningImage />
    case 'viewOnly':
      return <WarningImage />
    case 'termination':
      return <WarningImage />
    case 'MultiAddImage':
      return <MultiAddImage />
    case 'deliverableImage':
      return <DeliverableImage />
    case 'tasklistImage':
      return <TasklistImage />
    default:
      return null
  }
}

export const getTipById = (t, id) => {
  const tipCards = generateTipCards(t)
  return tipCards[id]
}

export const getRandomTipId = (t, exlude = []) => {
  const tipCards = generateTipCards(t)
  let ids = [...Array(tipCards.length).keys()].filter(
    key => !exlude.includes(key)
  )
  return ids[Math.floor(Math.random() * ids.length)]
}

export const getBackgroundColour = number => {
  switch (number) {
    case 0:
      return rawColours.tips.blue
    case 1:
      return rawColours.tips.green
    case 2:
      return rawColours.tips.orange
    case 3:
      return rawColours.tips.pink
    case 4:
      return rawColours.tips.pink
    case 5:
      return rawColours.tips.lightBlue
    case 6:
      return rawColours.tips.japonica
    default:
      return rawColours.tips.pink
  }
}
