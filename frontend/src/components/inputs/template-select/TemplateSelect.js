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

import { StatusCodes } from 'http-status-codes'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import templateService from '../../../services/template/template-service'
import Search from '../search/Search'
import {
  formatTemplateItemPlainText,
  renderTemplateItemContent,
} from './TemplateItem'

/** Template selection for the Template Task Destination Dialog */
class TemplateSelect extends Component {
  state = {
    items: [],
    disabled: true,
    selectedTemplate: undefined,
  }

  componentDidMount() {
    this.fetchTemplates()
  }

  fetchTemplates() {
    templateService.getTemplatesBasic().then(response => {
      if (response.status !== StatusCodes.OK) return
      this.setState(
        {
          disabled: false,
          items: response.body,
          selectedTemplate: this.getSelectedTemplateFromId(response.body),
        },
        () => {
          this.getSelectedTemplateDetails()
        }
      )
    })
  }

  performSearch = searchTerm => {
    return Promise.resolve(
      this.state.items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }

  getSelectedTemplateFromId(itemsOverride) {
    const itemsToUse =
      itemsOverride === undefined ? this.state.items : itemsOverride
    let retval = ''
    if (this.props.templateId && itemsToUse.length > 0) {
      retval = itemsToUse.find(
        template => template.id === this.props.templateId
      )
    }
    return retval
  }

  getSelectedTemplateDetails() {
    if (this.props.templateId) {
      templateService.getTemplate(this.props.templateId).then(response => {
        if (response.status !== StatusCodes.OK) return
        this.setState(
          {
            selectedTemplate: response.body,
          },
          () => {
            this.props.handleCreateTaskTemplateLevelAValidation &&
              this.props.handleCreateTaskTemplateLevelAValidation(
                this.state.selectedTemplate
              )
          }
        )
      })
    }
  }

  hasFocus = () => {
    return this.state.selectedTemplate === undefined
  }

  render() {
    if (this.state.items.length === 0) return null
    return (
      <div data-test="template-select-container">
        <Search
          selectedItem={this.getSelectedTemplateFromId()}
          onChange={this.props.selectionChangeHandler}
          performSearch={this.performSearch}
          placeholder={this.props.placeholder}
          renderItemContent={renderTemplateItemContent}
          formatSelectedItem={(item, index) => {
            return formatTemplateItemPlainText(item, index)
          }}
          showDropDownArrow
          disabled={this.state.disabled}
          focus={this.hasFocus()}
          error={this.props.error}
          usageContext="TemplateSelect"
          exclusionComparator={this.resultExclusionComparator}
          resultsToExclude={this.props.templatesToExclude}
          onFocus={() => {}}
          onBlur={() => {}}
          showNoResults={true}
        />
      </div>
    )
  }

  resultExclusionComparator = (itemToExclude, searchResult) =>
    itemToExclude.id === searchResult.id
}

TemplateSelect.propTypes = {
  /** templateId */
  templateId: PropTypes.number,
  /** Placeholder text*/
  placeholder: PropTypes.string.isRequired,
  /** selectionChangeHandler */
  selectionChangeHandler: PropTypes.func.isRequired,
  /** Error flag*/
  error: PropTypes.bool,
  /** Handler to validate create operations on level A*/
  handleCreateTaskTemplateLevelAValidation: PropTypes.func,
  /** Template to exclude from results*/
  templatesToExclude: PropTypes.array,
}

export default TemplateSelect
