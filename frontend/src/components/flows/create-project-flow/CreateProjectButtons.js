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

import AddIcon from '@mui/icons-material/Add'
import SplitIcon from '@mui/icons-material/CallSplit'
import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import { WORKSTREAM_TYPE } from '../../../app/constants'
import { useIsViewOnly } from '../../../hooks/matter/viewer/matter-viewer-hooks'
import juralioColours from '../../../theme/juralio-colours'
import { JuralioNamedColours } from '../../../theme/juralio-named-colours'
import { TemplatesIcon } from '../../../theme/navigation/CommonIcons'
import rawColours from '../../../theme/raw-colours'
import CardButton from '../../inputs/card-button/CardButton'

const useStyles = makeStyles()(theme => ({
  blankIcon: {
    color: rawColours.primary.primary.main,
    borderStyle: 'dotted',
    backgroundColor: JuralioNamedColours.beige[100],
  },
  templateIcon: {
    backgroundColor: juralioColours.matterDialog.templateIcon,
    borderRadius: theme.spacing(0.5),
    borderStyle: 'solid',
    color: rawColours.status.template.dark,
  },
  cardContainer: {
    display: 'flex',
    justifyContent: 'space-evenly',
    marginTop: theme.spacing(1),
  },
}))

const CreateProjectButtons = props => {
  const { projectType, isFirstWorkstreamToBeCreated, cardSize } = props
  const { classes } = useStyles()
  const { t } = useTranslation()
  const isViewOnly = useIsViewOnly({ activities: [] })

  const aTemplateHasTasks = () =>
    props.templates.filter(t => t.taskCount > 0 && t.published).length > 0

  const renderUseTemplateButton = disabled => (
    <CardButton
      size={cardSize}
      text={
        isFirstWorkstreamToBeCreated
          ? t('workstreamCreation.useATemplate')
          : t('workstreamCreation.createWorkstreamFromTemplate')
      }
      dataTest="create-workstream-from-template"
      selected={projectType === WORKSTREAM_TYPE.FROM_TEMPLATE}
      onClickHandler={() => props.projectTemplate()}
      CardIcon={TemplatesIcon}
      iconCustomCss={classes.templateIcon}
      disabled={disabled}
      border={false}
    />
  )

  return (
    <div data-test={'create-project'} className={classes.cardContainer}>
      {props.showSplit && (
        <CardButton
          size={cardSize}
          text={
            isFirstWorkstreamToBeCreated
              ? t('workstreamCreation.splitExistingWorkstream')
              : t('workstreamCreation.createWorkstreamFromExistingTasks')
          }
          dataTest="split-workstream"
          selected={projectType === WORKSTREAM_TYPE.SPLIT}
          onClickHandler={props.projectSplit}
          CardIcon={SplitIcon}
          disabled={isViewOnly}
          iconCustomCss={''}
          border={false}
        />
      )}
      <CardButton
        size={cardSize}
        text={
          isFirstWorkstreamToBeCreated
            ? t('workstreamCreation.createOwnTasks')
            : t('workstreamCreation.createABlankWorkstream')
        }
        dataTest="blank-workstream"
        selected={projectType === WORKSTREAM_TYPE.BLANK}
        onClickHandler={() => props.projectBlank()}
        CardIcon={AddIcon}
        iconCustomCss={classes.blankIcon}
        disabled={isViewOnly}
        border={false}
      />
      {props.templates.length > 0 && aTemplateHasTasks()
        ? renderUseTemplateButton(isViewOnly)
        : ''}
    </div>
  )
}

CreateProjectButtons.propTypes = {
  projectType: PropTypes.string,
  projectBlank: PropTypes.func.isRequired,
  projectTemplate: PropTypes.func.isRequired,
  templates: PropTypes.array.isRequired,
  classes: PropTypes.object,
  cardSize: PropTypes.oneOf(['large', 'small']),
}

export default CreateProjectButtons
