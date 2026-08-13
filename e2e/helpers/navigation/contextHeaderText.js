import VisitHelpers from '../matterprojects/visit_helpers'

// Expected breadcrumb/context-header text for each route in the app, used to assert
// that navigation lands where it should and labels the location correctly.

export const getExpectedHeadersData = (testProjectName, testTemplateName) => [
  {
    path: '/#/matters/MATTER_ID',
    visit: params => new VisitHelpers().visitMatter(params.matterId),
    expectedTitle: 'Matter details',
    expectedSubtitle: 'See and manage matter and project details',
    expectedSearchPlaceholder: 'Search your matters',
  },
  {
    path: '/#/matter/MATTER_ID/project/PROJECT_ID/taskmap/',
    visit: params =>
      new VisitHelpers().visitTaskMap(params.matterId, params.projectId),
    expectedTitle: testProjectName,
    expectedSubtitle: '', // temporary, these should be updated when we have access to the date
    expectedSearchPlaceholder: 'Search in ' + testProjectName,
  },
  {
    path: '/#/matter/MATTER_ID/project/PROJECT_ID/timeline/',
    visit: params =>
      new VisitHelpers().visitProjectTimeLine(
        params.matterId,
        params.projectId,
        params.isMobile
      ),
    expectedTitle: testProjectName,
    expectedSubtitle: '',
    expectedSearchPlaceholder: 'Search in ' + testProjectName,
  },
  {
    path: '/#/matter/MATTER_ID/project/PROJECT_ID/task/TASK_ID',
    visit: params =>
      new VisitHelpers().visitTaskDetails(
        params.matterId,
        params.projectId,
        params.taskId
      ),
    expectedTitle: testProjectName,
    expectedSubtitle: '',
    expectedSearchPlaceholder: 'Search in ' + testProjectName,
  },
  {
    path: '/#/matter/MATTER_ID/project/PROJECT_ID/taskmap',
    visit: params =>
      new VisitHelpers().visitTaskMap(
        params.matterId,
        params.projectId,
        params.taskId
      ),
    expectedTitle: testProjectName,
    expectedSubtitle: '',
    expectedSearchPlaceholder: 'Search in ' + testProjectName,
  },
  {
    path: '/#/templates',
    visit: params => new VisitHelpers().visitTemplates(),
    expectedTitle: 'Templates',
    expectedSubtitle: 'Choose a template to begin your project',
    expectedSearchPlaceholder: 'Search your matters',
  },
  {
    path: '/#/template/TEMPLATE_ID/taskmap',
    visit: params => new VisitHelpers().visitTemplateTaskMap(params.templateId),
    expectedTitle: testTemplateName,
    expectedSubtitle: '',
    expectedSearchPlaceholder: 'Search your matters',
  },
  {
    path: '/#/template/TEMPLATE_ID/task/TEMPLATE_TASK_ID',
    visit: params =>
      new VisitHelpers().visitTemplateTaskDetails(
        params.templateId,
        params.templateTaskId
      ),
    expectedTitle: testTemplateName,
    expectedSubtitle: '',
    expectedSearchPlaceholder: 'Search your matters',
  },
]
