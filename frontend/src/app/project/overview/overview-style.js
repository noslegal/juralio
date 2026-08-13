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

import { makeStyles } from 'tss-react/mui'
import colorModifiers from '../../../theme/color-modifiers'
import juralioColours from '../../../theme/juralio-colours'
import { JuralioNamedColours } from '../../../theme/juralio-named-colours'
import rawColours from '../../../theme/raw-colours'
import navigationBackgroundStyles from '../../../components/navigation/common/navigation-background-styles'

export const descriptionCollapseProps = { collapsedHeight: 108 }

const columnWidth = 400

export const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    height: '100%',
    overflow: 'hidden',
    //marginTop: theme.spacing(6.25),
  },
  leftColumn: {
    flex: `1 1 ${columnWidth}px`,
    paddingTop: theme.spacing(1.5),
    maxWidth: columnWidth,
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(2),
    overflowY: 'auto',
    marginTop: '5px',
    paddingBottom: theme.spacing(11),
    position: 'relative',
  },
  backgroundImage: {
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: ' center center',
    height: '100px',
    width: '100%',
    borderRadius: '4px',
    display: 'flex',
    position: 'relative',
  },
  artistLink: {
    color: 'black',
    textTransform: 'underline',
  },
  imageIconButton: {
    color: 'black',
    marginLeft: 'auto',
    marginBottom: 'auto',
    backgroundColor: 'rgba(206, 202, 237, 0.8)',
  },
  unsplashText: {
    position: 'absolute',
    bottom: '0px',
    right: '0px',
    fontSize: '10px',
    backgroundColor: 'rgba(206, 202, 237, 0.6)',
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
    borderRadius: '4px 0px 4px 0px',
    display: 'flex',
  },
  middlePanel: {
    flex: '1 1 649px',
    height: '100%',
    display: 'flex',
    background: theme.palette.common.white,
    overflow: 'hidden',
    zIndex: 1,
    position: 'relative',
    marginTop: '5px',
  },
  mapFrame: {
    overflow: 'scroll',
    position: 'absolute',
    padding: theme.spacing(3),
    height: '100%',
    width: '100%',
    boxSizing: 'border-box',
  },
  roadmapFrame: {
    position: 'absolute',
    paddingTop: theme.spacing(3),
    height: '100%',
    width: '100%',
    boxSizing: 'border-box',
  },
  menuItem: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: theme.spacing(2),
    border: `1px solid ${colorModifiers.opaque(rawColours.divider.dark)}`,
    borderRadius: theme.spacing(0.5),
  },
  menuItemNotSelected: {
    cursor: 'pointer',
    backgroundColor: colorModifiers.primaryBackground(
      rawColours.primary.white.primary
    ),
    '&:hover': {
      backgroundColor: colorModifiers.hoverAction(rawColours.action.dark),
    },
  },
  menuItemSelected: {
    backgroundColor: rawColours.primary.primary.light,
    '&:hover': {
      backgroundColor: rawColours.primary.primary.light,
    },
  },
  menuItemHeader: {
    display: 'flex',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(),
    width: '100%',
    alignItems: 'center',
  },
  menuItemArrow: {
    marginTop: 'auto',
    marginBottom: 'auto',
    color: juralioColours.arrow,
    marginLeft: 'auto',
  },
  menuItemArrowSelected: {
    color: rawColours.primary.primary.main,
  },
  taskCount: {
    display: 'flex',
    width: '100%',
  },
  taskCountText: {
    marginTop: 'auto',
    marginBottom: 'auto',
    marginLeft: theme.spacing(1),
    fontSize: theme.spacing(2),
  },
  tasksIcon: {
    marginTop: 'auto',
    marginBottom: 'auto',
    height: theme.spacing(3),
  },
  menuItemBodyWrapper: {
    width: '100%',
  },
  editTextFieldWrapper: {
    marginBottom: theme.spacing(2),
  },
  skeletonText: {
    marginLeft: theme.spacing(1.5),
  },
  skeletonBody: {
    marginBottom: theme.spacing(1),
  },
  workstreamChipIcon: {
    height: theme.spacing(2),
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  workstreamChipText: {
    marginTop: 'auto',
    marginBottom: 'auto',
    fontSize: theme.spacing(1.5),
    marginLeft: theme.spacing(0.5),
  },
  list: {
    paddingTop: '0px',
    marginBottom: theme.spacing(6),
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: theme.spacing(),
    marginRight: theme.spacing(),
    marginBottom: theme.spacing(),
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(),
    marginRight: theme.spacing(),
  },
  workstreamNameWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
  },
  workstreamRef: {
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(1),
  },
  workstreamRefNoMargin: {
    marginRight: 0,
  },
  workstreamName: {
    marginRight: theme.spacing(),
    fontWeight: theme.typography.fontWeightLight,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxHeight: '5em', //added for non-webkit browsers
    display: '-webkit-box',
    WebkitLineClamp: 4,
    WebkitBoxOrient: 'vertical',
    overflowWrap: 'break-word',
  },
  descriptionTitle: {
    color: colorModifiers.primaryText(rawColours.primary.black[200]),
    fontSize: theme.spacing(1.5),
    textTransform: 'uppercase',
    marginBottom: theme.spacing(),
    marginTop: theme.spacing(),
  },
  postsTitle: {
    color: colorModifiers.primaryText(rawColours.primary.black[200]),
    fontSize: theme.spacing(1.5),
    textTransform: 'uppercase',
    marginBottom: theme.spacing(),
  },
  divider: {
    height: theme.spacing(0.5),
    backgroundColor: rawColours.primary.black[100],
    marginLeft: theme.spacing(-2),
    marginTop: theme.spacing(2),
  },
  icon: {
    marginRight: theme.spacing(),
  },
  unSplashIcon: {
    color: 'black',
  },
  matterDetails: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
    alignItems: 'center',
  },
  postsZeroState: {
    marginBottom: theme.spacing(),
    color: colorModifiers.primaryText(rawColours.primary.black[200]),
  },
  taskIcon: {
    height: theme.spacing(2),
    marginRight: theme.spacing(),
  },
  counterIcon: {
    height: theme.spacing(2),
    marginRight: theme.spacing(),
    marginLeft: theme.spacing(),
  },
  userControllWrapper: {
    marginLeft: theme.spacing(2),
    width: 'fit-content',
  },
  peopleRow: {
    width: 'fit-content',
  },
  goToAdminButton: {
    textTransform: 'none',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    display: 'flex',
    color: JuralioNamedColours.blue.main,
  },
  goToAdminButtonMA: {
    textTransform: 'none',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    display: 'flex',
    color: JuralioNamedColours.blue.main,
    backgroundColor: colorModifiers.secondaryBackground(
      rawColours.primary.white.primary
    ),
    '&:hover': {
      backgroundColor: colorModifiers.hoverAction(rawColours.action.dark),
    },
  },
  carouselWrapper: {
    overflowX: 'auto',
    width: '100%',
    marginTop: '8px',
  },
  privateMatterDetailsWrapper: {
    maxWidth: '80%',
    overflowX: 'hidden',
    display: 'flex',
  },
  matterDetailsWrapper: {},
  alignCenter: {
    display: 'flex',
    alignItems: 'center',
  },
  workstreamNameOverview: {
    overflowX: 'hidden',
    textOverflow: 'ellipsis',
  },
  progressIcon: {
    marginRight: theme.spacing(1),
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
    marginLeft: theme.spacing(0.5),
  },
  overviewHeader: {
    display: 'flex',
    marginBottom: theme.spacing(1),
  },
  refRow: {
    display: 'flex',
    width: 'fit-content',
  },
  userOptionButton: {
    fontWeight: 'normal',
    fontSize: '14px',
    fontFamily: theme.typography.fontFamily,
    color: juralioColours.menu.item,
    textTransform: 'none !important',
    marginTop: 'auto',
    marginBottom: 'auto',
    marginRight: theme.spacing(2),
    marginLeft: 'auto',
  },
  rootMatterOverview: {
    background: `url(${navigationBackgroundStyles.image})`,
    backgroundColor: colorModifiers.primaryBackground(
      rawColours.overview.matter
    ),
  },
  overviewHeader: {
    display: 'flex',
    marginBottom: theme.spacing(1),
  },
  refNumberWrapper: {
    display: 'flex',
    width: 'fit-content',
  },
  refNumberNoMargin: {
    marginRight: 0,
  },
  progressIcon: {
    marginRight: theme.spacing(1),
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
    marginLeft: theme.spacing(0.5),
  },
  positionsRow: {
    display: 'flex',
    flexDirection: 'column',
  },
  positionColumn: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing(0.25),
    gap: theme.spacing(0.5),
  },
  groupColumn: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  groupColumnClient: {
    marginLeft: theme.spacing(1.5),
  },
  overviewProgressIcon: {
    marginRight: theme.spacing(1),
    width: '20px',
    height: '20px',
    marginLeft: theme.spacing(0.5),
  },
  overviewTitleRow: {
    display: 'flex',
    marginBottom: theme.spacing(1),
  },
  refNumberRow: {
    display: 'flex',
    width: 'fit-content',
  },
}))
