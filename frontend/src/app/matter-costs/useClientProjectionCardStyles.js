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
import juralioColours from '../../theme/juralio-colours'
import rawColours from '../../theme/raw-colours'

const useClientProjectionCardStyles = makeStyles()(theme => ({
  div1: {
    backgroundColor: rawColours.primary.white.primary,
    padding: theme.spacing(1),
    textAlign: 'center',
    borderBottomStyle: 'solid',
    borderBottomWidth: 4,
  },
  div1Snapshot: {
    borderColor: juralioColours.taskStatus.done,
  },
  div1Live: {
    borderColor: juralioColours.taskStatus.inProgress,
  },
  liveToggleGroup: {
    marginLeft: theme.spacing(0.5),
    marginTop: '-8px',
    flexDirection: 'row',
    alignItems: 'center',
  },
  div1Retired: {
    borderColor: juralioColours.taskStatus.notRequired,
    backgroundColor: rawColours.primary.grey.main,
  },
  div1NotStarted: {
    borderColor: juralioColours.taskStatus.notStarted,
  },
  div1Inner: {
    display: 'flex',
  },
  iconWrapper: {
    marginTop: theme.spacing(1.5),
  },
  periodBlock: {
    display: 'flex',
    padding: theme.spacing(0.5),
  },
  dateTypographySingle: {
    width: 'fit-content',
    marginRight: '4px',
    marginLeft: '8px',
  },
  dateTypographyRange: {
    width: 'fit-content',
    marginRight: '4px',
    marginLeft: '4px',
  },
  statusChipContainer: {
    marginLeft: '8px',
    marginRight: '8px',
    marginTop: '6px',
    marginBottom: 'auto',
    display: 'flex',
  },
  currencyRow: {
    marginLeft: '4px',
    marginRight: 'auto',
    display: 'flex',
    alignItems: 'center',
  },
  expandPillWrapper: {
    marginLeft: 'auto',
    marginTop: 'auto',
    marginBottom: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  expandPill: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '32px',
    width: '32px',
    borderRadius: '16px',
    cursor: 'pointer',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    color: juralioColours.darkText.secondary,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    transition:
      'width 0.25s ease, background-color 0.25s ease, color 0.25s ease',
  },
  expandPillExpanded: {
    width: 'fit-content',
    gap: '4px',
    paddingLeft: '12px',
    paddingRight: '12px',
  },
  expandPillExpandedSnapshot: {
    backgroundColor: juralioColours.taskStatus.done,
    color: rawColours.primary.white.primary,
  },
  expandPillExpandedLive: {
    backgroundColor: juralioColours.taskStatus.inProgress,
    color: rawColours.primary.white.primary,
  },
  expandPillExpandedRetired: {
    backgroundColor: juralioColours.taskStatus.notRequired,
    color: rawColours.primary.white.primary,
  },
  expandPillExpandedNotStarted: {
    backgroundColor: juralioColours.taskStatus.notStarted,
    color: rawColours.primary.white.primary,
  },
  expandPillText: {
    fontSize: '0.8rem',
    fontWeight: 500,
    overflow: 'hidden',
    maxWidth: 0,
    opacity: 0,
    transition: 'max-width 0.25s ease, opacity 0.15s ease',
    whiteSpace: 'nowrap',
  },
  expandPillTextVisible: {
    maxWidth: 'none',
    opacity: 1,
  },
  divWrapper: {
    display: 'grid',
    gridTemplateColumns: '50% 50%',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    backgroundColor: rawColours.primary.white.primary,
  },
  segment: {
    backgroundColor: rawColours.primary.white.primary,
    height: '100%',
    boxSizing: 'border-box',
  },
  contentCell: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    padding: theme.spacing(0.5),
    height: '100%',
    boxSizing: 'border-box',
  },
  contentCellIcon: {
    flexShrink: 0,
  },
  contentCellText: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'stretch',
    justifyContent: 'center',
    gap: theme.spacing(0.25),
  },
  pricingHeaderRow: {
    display: 'flex',
    alignItems: 'center',
  },
  pricingTitleBlock: {
    display: 'flex',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: theme.spacing(0.5),
    marginRight: 'auto',
  },
  pricingSubtext: {
    color: juralioColours.darkText.secondary,
    fontWeight: 400,
  },
  pricingOffset: {
    marginTop: '2px',
  },
  feesLabel: {
    marginRight: 'auto',
    fontWeight: 'bold',
  },
  feesAmount: {
    fontSize: '1.5rem',
  },
  feesProjectedCaption: {
    display: 'block',
    textAlign: 'right',
  },
  expandedSection: {
    padding: theme.spacing(2),
    backgroundColor: rawColours.primary.grey[100],
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
  detailPanel: {
    backgroundColor: rawColours.primary.white.primary,
    border: `1px solid ${rawColours.primary.black[200]}`,
    borderRadius: theme.spacing(1.5),
    padding: theme.spacing(2.5),
  },
  liveScopeNotice: {
    marginBottom: theme.spacing(1.5),
    padding: theme.spacing(1, 1.5),
    borderRadius: theme.spacing(0.75),
    borderLeft: `3px solid ${juralioColours.taskStatus.inProgress}`,
    backgroundColor: rawColours.primary.grey.main,
    color: juralioColours.darkText.secondary,
    fontSize: 13,
    lineHeight: 1.4,
  },
  scopeHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1.5),
  },
  scopeHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  scopeHeaderIcon: {
    color: juralioColours.darkText.secondary,
  },
  scopeHeaderTitle: {
    fontWeight: 600,
    color: juralioColours.darkText.primary,
  },
  scopeHeaderCount: {
    color: juralioColours.darkText.secondary,
  },
  hideDetailsButton: {
    textTransform: 'none',
    borderColor: rawColours.primary.black[200],
    color: juralioColours.darkText.primary,
    borderRadius: theme.spacing(1),
  },
  phaseBlock: {
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
    borderTop: `1px solid ${rawColours.primary.black[200]}`,
    '&:first-of-type': {
      borderTop: 'none',
      paddingTop: 0,
    },
  },
  phaseHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
  },
  phaseHeadCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.25),
  },
  phaseHeadColRight: {
    alignItems: 'flex-end',
    textAlign: 'right',
  },
  phaseTitle: {
    fontWeight: 500,
    color: juralioColours.darkText.primary,
  },
  phaseMeta: {
    color: juralioColours.darkText.secondary,
  },
  phaseListsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: theme.spacing(2),
    marginTop: theme.spacing(1),
    paddingLeft: theme.spacing(5),
  },
  phaseListHead: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    color: juralioColours.darkText.secondary,
    marginBottom: theme.spacing(0.5),
  },
  deliverableIcon: {
    '& path': {
      stroke: rawColours.primary.black[100],
      strokeWidth: 1,
    },
  },
  phaseList: {
    display: 'flex',
    flexDirection: 'column',
  },
  phaseListItems: {
    margin: 0,
    paddingLeft: theme.spacing(3),
    color: juralioColours.darkText.primary,
    '& li': { marginTop: theme.spacing(0.25) },
    '& li::marker': { color: juralioColours.darkText.disabled },
  },
  oosTitle: {
    fontWeight: 600,
    color: juralioColours.darkText.primary,
    marginBottom: theme.spacing(1),
  },
  kvRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
    padding: theme.spacing(1, 0),
    borderTop: `1px solid ${rawColours.primary.black[200]}`,
    '&:first-of-type': { borderTop: 'none' },
  },
  kvKey: {
    color: juralioColours.darkText.secondary,
    flexShrink: 0,
  },
  kvVal: {
    color: juralioColours.darkText.primary,
    fontWeight: 500,
    minWidth: 0,
    textAlign: 'right',
    overflowWrap: 'anywhere',
  },
  card: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    border: `1px solid ${rawColours.primary.black[200]}`,
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  cardHoverSnapshot: {
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: `0 0 0 3px ${juralioColours.taskStatus.done}, 0 0 16px 4px ${juralioColours.taskStatus.done}bb`,
    },
  },
  cardHoverLive: {
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: `0 0 0 3px ${juralioColours.taskStatus.inProgress}, 0 0 16px 4px ${juralioColours.taskStatus.inProgress}bb`,
    },
  },
  cardHoverRetired: {
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: `0 0 0 3px ${juralioColours.taskStatus.notRequired}, 0 0 16px 4px ${juralioColours.taskStatus.notRequired}bb`,
    },
  },
  cardHoverNotStarted: {
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: `0 0 0 3px ${juralioColours.taskStatus.notStarted}, 0 0 16px 4px ${juralioColours.taskStatus.notStarted}bb`,
    },
  },
}))

export default useClientProjectionCardStyles
