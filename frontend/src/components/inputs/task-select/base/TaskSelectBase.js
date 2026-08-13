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

import PropTypes from 'prop-types'
import React from 'react'
import { withStyles } from 'tss-react/mui'
import Search from '../../search/Search'
import { formatTaskItemPlainText, TaskItem } from './TaskItem'

const styles = () => ({
  searchContainer: {
    //paddingTop: theme.spacing(3),
  },
})

const TaskSelectBase = props => {
  return (
    <div className={props.classes.searchContainer} data-test="task-select-base">
      <Search
        onChange={props.onChange}
        selectedItem={props.selectedTask}
        performSearch={props.performSearch}
        placeholder={props.placeholder}
        renderItemContent={(item, index) => (
          <TaskItem item={item} index={index} />
        )}
        formatSelectedItem={item => formatTaskItemPlainText(item)}
        disabledItemFilter={props.disabledItemFilter}
        showDropDownArrow
        disabled={props.disabled}
        focus={props.focus}
        helperText={props.helperText}
        error={props.error}
        usageContext="TaskSelectBase"
        resultsToExclude={[
          { id: 'this is here to make the exclusion comparator work' },
        ]}
        exclusionComparator={(itemToExclude, searchResult) => {
          return (
            itemToExclude.id === searchResult.id ||
            (props.filterOutMilestones && searchResult.isMilestone)
          )
        }}
        filterHidden={true}
        onFocus={() => {}}
        onBlur={() => {}}
        showNoResults={true}
      />
    </div>
  )
}

TaskSelectBase.propTypes = {
  disabled: PropTypes.bool,
  disabledItemFilter: PropTypes.func,
  onChange: PropTypes.func.isRequired,
  performSearch: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
  focus: PropTypes.bool,
  helperText: PropTypes.string,
  error: PropTypes.bool,
  filterOutMilestones: PropTypes.bool,
}

export default withStyles(TaskSelectBase, styles)
