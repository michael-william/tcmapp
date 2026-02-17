/**
 * Management Question Template
 *
 * Template for all management questions to be seeded when management module is enabled.
 * Structured to match the PDF layout with 25 sections.
 *
 * Delta sections: Users, Groups, Project Hierarchy, Project Permissions, Data Sources,
 * Workbooks, Flows, Virtual Connections, Custom Views, Data Driven Alerts, Favorites,
 * Tags, Accelerated Views, Webhooks, Collections, Data Source Extract Refreshes,
 * Workbook Extract Refreshes, Flow Run Tasks, Subscriptions
 */

const managementQuestionTemplate = [
  // ==================== SECTION 1: SITE SETUP ====================
  {
    id: 'mgmt-site-auth',
    section: 'Site Setup',
    questionText: 'Authentication set-up on Site',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 1001,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-site-setup',
      hasDate: true,
      hasDetails: true
    }
  },
  {
    id: 'mgmt-site-auth-mechanism',
    section: 'Site Setup',
    questionText: 'Provide Authentication mechanism',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 1002,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-site-setup',
      isFullWidth: true
    }
  },
  {
    id: 'mgmt-site-smtp',
    section: 'Site Setup',
    questionText: 'SMTP',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 1003,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-site-setup',
      hasDate: true,
      hasConditionalInput: true
    }
  },
  {
    id: 'mgmt-site-smtp-used',
    section: 'Site Setup',
    questionText: 'Is Custom SMTP being used?',
    questionType: 'yesNo',
    answer: null,
    completed: false,
    order: 1004,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-site-setup'
    }
  },
  {
    id: 'mgmt-site-data-connectivity',
    section: 'Site Setup',
    questionText: 'Data Connectivity',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 1005,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-site-setup',
      hasDate: true
    }
  },
  {
    id: 'mgmt-site-connectivity-details',
    section: 'Site Setup',
    questionText: 'Provide connectivity details',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 1006,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-site-setup',
      isFullWidth: true
    }
  },
  {
    id: 'mgmt-site-custom-domain',
    section: 'Site Setup',
    questionText: 'Custom Domain',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 1007,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-site-setup',
      hasDate: true,
      hasConditionalInput: true
    }
  },
  {
    id: 'mgmt-site-custom-domain-used',
    section: 'Site Setup',
    questionText: 'Is Custom Domain being used?',
    questionType: 'yesNo',
    answer: null,
    completed: false,
    order: 1008,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-site-setup'
    }
  },

  // ==================== SECTION 2: USERS (Delta Support) ====================
  {
    id: 'mgmt-users-parent',
    section: 'Users',
    questionText: 'Users',
    questionType: 'deltaParent',
    answer: null,
    completed: false,
    order: 2000,
    deltas: [],  // Start empty
    metadata: {
      isManagementQuestion: true,
      isDeltaParent: true,
      sectionGroup: 'management-users',
      deltaTemplate: {
        runbook: '',
        migrated: null,
        owner: null,
        date: null,
        notes: '',
        complete: false
      }
    }
  },
  {
    id: 'mgmt-users-initial',
    section: 'Users',
    questionText: 'Initial Users',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 2001,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-users',
      hasDate: true
    }
  },
  {
    id: 'mgmt-users-initial-notes',
    section: 'Users',
    questionText: 'Initial Users notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 2002,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-users',
      isFullWidth: true
    }
  },
  {
    id: 'mgmt-users-validation',
    section: 'Users',
    questionText: 'User Validation',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 2003,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-users',
      hasDate: true
    }
  },
  {
    id: 'mgmt-users-validation-notes',
    section: 'Users',
    questionText: 'User Validation notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 2004,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-users',
      isFullWidth: true
    }
  },

  // ==================== SECTION 3: GROUPS (Delta Support) ====================
  {
    id: 'mgmt-groups-parent',
    section: 'Groups',
    questionText: 'Groups',
    questionType: 'deltaParent',
    answer: null,
    completed: false,
    order: 3000,
    deltas: [],
    metadata: {
      isManagementQuestion: true,
      isDeltaParent: true,
      sectionGroup: 'management-groups',
      deltaTemplate: {
        runbook: '',
        migrated: null,
        owner: null,
        date: null,
        notes: '',
        complete: false
      }
    }
  },
  {
    id: 'mgmt-groups-initial',
    section: 'Groups',
    questionText: 'Groups',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 3001,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-groups',
      hasDate: true
    }
  },
  {
    id: 'mgmt-groups-notes',
    section: 'Groups',
    questionText: 'Groups notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 3002,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-groups',
      isFullWidth: true
    }
  },
  {
    id: 'mgmt-groups-validation',
    section: 'Groups',
    questionText: 'Groups Validation',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 3003,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-groups',
      hasDate: true
    }
  },
  {
    id: 'mgmt-groups-validation-notes',
    section: 'Groups',
    questionText: 'Groups Validation notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 3004,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-groups',
      isFullWidth: true
    }
  },

  // ==================== SECTION 4: PROJECT HIERARCHY (Delta Support) ====================
  {
    id: 'mgmt-project-hierarchy-parent',
    section: 'Project Hierarchy',
    questionText: 'Project Hierarchy',
    questionType: 'deltaParent',
    answer: null,
    completed: false,
    order: 4000,
    deltas: [],
    metadata: {
      isManagementQuestion: true,
      isDeltaParent: true,
      sectionGroup: 'management-project-hierarchy',
      deltaTemplate: {
        runbook: '',
        migrated: null,
        owner: null,
        date: null,
        notes: '',
        complete: false
      }
    }
  },
  {
    id: 'mgmt-project-hierarchy-initial',
    section: 'Project Hierarchy',
    questionText: 'Project Hierarchy',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 4001,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-project-hierarchy',
      hasDate: true
    }
  },
  {
    id: 'mgmt-project-hierarchy-notes',
    section: 'Project Hierarchy',
    questionText: 'Project Hierarchy notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 4002,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-project-hierarchy',
      isFullWidth: true
    }
  },
  {
    id: 'mgmt-project-hierarchy-validation',
    section: 'Project Hierarchy',
    questionText: 'Project Hierarchy Validation',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 4003,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-project-hierarchy',
      hasDate: true
    }
  },
  {
    id: 'mgmt-project-hierarchy-validation-notes',
    section: 'Project Hierarchy',
    questionText: 'Project Hierarchy Validation notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 4004,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-project-hierarchy',
      isFullWidth: true
    }
  },

  // ==================== SECTION 5: PROJECT PERMISSIONS (Delta Support) ====================
  {
    id: 'mgmt-project-permissions-parent',
    section: 'Project Permissions',
    questionText: 'Project Permissions',
    questionType: 'deltaParent',
    answer: null,
    completed: false,
    order: 5000,
    deltas: [],
    metadata: {
      isManagementQuestion: true,
      isDeltaParent: true,
      sectionGroup: 'management-project-permissions',
      deltaTemplate: {
        runbook: '',
        migrated: null,
        owner: null,
        date: null,
        notes: '',
        complete: false
      }
    }
  },
  {
    id: 'mgmt-project-permissions-initial',
    section: 'Project Permissions',
    questionText: 'Project Permissions',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 5001,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-project-permissions',
      hasDate: true
    }
  },
  {
    id: 'mgmt-project-permissions-notes',
    section: 'Project Permissions',
    questionText: 'Project Permissions notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 5002,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-project-permissions',
      isFullWidth: true
    }
  },
  {
    id: 'mgmt-project-permissions-validation',
    section: 'Project Permissions',
    questionText: 'Project Permissions Validation',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 5003,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-project-permissions',
      hasDate: true
    }
  },
  {
    id: 'mgmt-project-permissions-validation-notes',
    section: 'Project Permissions',
    questionText: 'Project Permissions Validation notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 5004,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-project-permissions',
      isFullWidth: true
    }
  },

  // ==================== SECTION 6: DATA SOURCES (Delta Support) ====================
  {
    id: 'mgmt-data-sources-parent',
    section: 'Data Sources',
    questionText: 'Data Sources',
    questionType: 'deltaParent',
    answer: null,
    completed: false,
    order: 6000,
    deltas: [],
    metadata: {
      isManagementQuestion: true,
      isDeltaParent: true,
      sectionGroup: 'management-data-sources',
      deltaTemplate: {
        runbook: '',
        migrated: null,
        owner: null,
        date: null,
        notes: '',
        complete: false
      }
    }
  },
  {
    id: 'mgmt-data-sources-initial',
    section: 'Data Sources',
    questionText: 'Data Sources',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 6001,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-data-sources',
      hasDate: true
    }
  },
  {
    id: 'mgmt-data-sources-notes',
    section: 'Data Sources',
    questionText: 'Data Sources notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 6002,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-data-sources',
      isFullWidth: true
    }
  },
  {
    id: 'mgmt-data-sources-validation',
    section: 'Data Sources',
    questionText: 'Data Sources Validation',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 6003,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-data-sources',
      hasDate: true
    }
  },
  {
    id: 'mgmt-data-sources-validation-notes',
    section: 'Data Sources',
    questionText: 'Data Sources Validation notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 6004,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-data-sources',
      isFullWidth: true
    }
  },

  // ==================== SECTION 7: WORKBOOKS (Delta Support) ====================
  {
    id: 'mgmt-workbooks-parent',
    section: 'Workbooks',
    questionText: 'Workbooks',
    questionType: 'deltaParent',
    answer: null,
    completed: false,
    order: 7000,
    deltas: [],
    metadata: {
      isManagementQuestion: true,
      isDeltaParent: true,
      sectionGroup: 'management-workbooks',
      deltaTemplate: {
        runbook: '',
        migrated: null,
        owner: null,
        date: null,
        notes: '',
        complete: false
      }
    }
  },
  {
    id: 'mgmt-workbooks-initial',
    section: 'Workbooks',
    questionText: 'Workbooks',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 7001,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-workbooks',
      hasDate: true
    }
  },
  {
    id: 'mgmt-workbooks-notes',
    section: 'Workbooks',
    questionText: 'Workbooks notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 7002,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-workbooks',
      isFullWidth: true
    }
  },
  {
    id: 'mgmt-workbooks-validation',
    section: 'Workbooks',
    questionText: 'Workbooks Validation',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 7003,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-workbooks',
      hasDate: true
    }
  },
  {
    id: 'mgmt-workbooks-validation-notes',
    section: 'Workbooks',
    questionText: 'Workbooks Validation notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 7004,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-workbooks',
      isFullWidth: true
    }
  },

  // ==================== SECTION 8: FLOWS (Delta Support) ====================
  {
    id: 'mgmt-flows-parent',
    section: 'Flows',
    questionText: 'Flows',
    questionType: 'deltaParent',
    answer: null,
    completed: false,
    order: 8000,
    deltas: [],
    metadata: {
      isManagementQuestion: true,
      isDeltaParent: true,
      sectionGroup: 'management-flows',
      deltaTemplate: {
        runbook: '',
        migrated: null,
        owner: null,
        date: null,
        notes: '',
        complete: false
      }
    }
  },
  {
    id: 'mgmt-flows-none',
    section: 'Flows',
    questionText: 'No flows to migrate',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 8001,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-flows'
    }
  },
  {
    id: 'mgmt-flows-initial',
    section: 'Flows',
    questionText: 'Flows',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 8002,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-flows',
      hasDate: true
    }
  },
  {
    id: 'mgmt-flows-notes',
    section: 'Flows',
    questionText: 'Flows notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 8003,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-flows',
      isFullWidth: true
    }
  },
  {
    id: 'mgmt-flows-validation',
    section: 'Flows',
    questionText: 'Flows Validation',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 8004,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-flows',
      hasDate: true
    }
  },
  {
    id: 'mgmt-flows-validation-notes',
    section: 'Flows',
    questionText: 'Flows Validation notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 8005,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-flows',
      isFullWidth: true
    }
  },

  // ==================== SECTION 9: VIRTUAL CONNECTIONS (Delta Support) ====================
  {
    id: 'mgmt-virtual-connections-parent',
    section: 'Virtual Connections',
    questionText: 'Virtual Connections',
    questionType: 'deltaParent',
    answer: null,
    completed: false,
    order: 9000,
    deltas: [],
    metadata: {
      isManagementQuestion: true,
      isDeltaParent: true,
      sectionGroup: 'management-virtual-connections',
      deltaTemplate: {
        runbook: '',
        migrated: null,
        owner: null,
        date: null,
        notes: '',
        complete: false
      }
    }
  },
  {
    id: 'mgmt-virtual-connections-none',
    section: 'Virtual Connections',
    questionText: 'No virtual connections to migrate',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 9001,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-virtual-connections'
    }
  },
  {
    id: 'mgmt-virtual-connections-initial',
    section: 'Virtual Connections',
    questionText: 'Virtual Connections',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 9002,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-virtual-connections',
      hasDate: true
    }
  },
  {
    id: 'mgmt-virtual-connections-notes',
    section: 'Virtual Connections',
    questionText: 'Virtual Connections notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 9003,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-virtual-connections',
      isFullWidth: true
    }
  },
  {
    id: 'mgmt-virtual-connections-validation',
    section: 'Virtual Connections',
    questionText: 'Virtual Connections Validation',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 9004,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-virtual-connections',
      hasDate: true
    }
  },
  {
    id: 'mgmt-virtual-connections-validation-notes',
    section: 'Virtual Connections',
    questionText: 'Virtual Connections Validation notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 9005,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-virtual-connections',
      isFullWidth: true
    }
  },

  // ==================== SECTION 10: CUSTOM VIEWS (Delta Support) ====================
  {
    id: 'mgmt-custom-views-parent',
    section: 'Custom Views',
    questionText: 'Custom Views',
    questionType: 'deltaParent',
    answer: null,
    completed: false,
    order: 10000,
    deltas: [],
    metadata: {
      isManagementQuestion: true,
      isDeltaParent: true,
      sectionGroup: 'management-custom-views',
      deltaTemplate: {
        runbook: '',
        migrated: null,
        owner: null,
        date: null,
        notes: '',
        complete: false
      }
    }
  },
  {
    id: 'mgmt-custom-views-none',
    section: 'Custom Views',
    questionText: 'No custom views to migrate',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 10001,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-custom-views'
    }
  },
  {
    id: 'mgmt-custom-views-initial',
    section: 'Custom Views',
    questionText: 'Custom Views',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 10002,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-custom-views',
      hasDate: true
    }
  },
  {
    id: 'mgmt-custom-views-notes',
    section: 'Custom Views',
    questionText: 'Custom Views notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 10003,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-custom-views',
      isFullWidth: true
    }
  },
  {
    id: 'mgmt-custom-views-validation',
    section: 'Custom Views',
    questionText: 'Custom Views Validation',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 10004,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-custom-views',
      hasDate: true
    }
  },
  {
    id: 'mgmt-custom-views-validation-notes',
    section: 'Custom Views',
    questionText: 'Custom Views Validation notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 10005,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-custom-views',
      isFullWidth: true
    }
  },

  // ==================== SECTION 11: DATA DRIVEN ALERTS (Delta Support) ====================
  {
    id: 'mgmt-data-driven-alerts-parent',
    section: 'Data Driven Alerts',
    questionText: 'Data Driven Alerts',
    questionType: 'deltaParent',
    answer: null,
    completed: false,
    order: 11000,
    deltas: [],
    metadata: {
      isManagementQuestion: true,
      isDeltaParent: true,
      sectionGroup: 'management-data-driven-alerts',
      deltaTemplate: {
        runbook: '',
        migrated: null,
        owner: null,
        date: null,
        notes: '',
        complete: false
      }
    }
  },
  {
    id: 'mgmt-data-driven-alerts-none',
    section: 'Data Driven Alerts',
    questionText: 'No data driven alerts to migrate',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 11001,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-data-driven-alerts'
    }
  },
  {
    id: 'mgmt-data-driven-alerts-initial',
    section: 'Data Driven Alerts',
    questionText: 'Data Driven Alerts',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 11002,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-data-driven-alerts',
      hasDate: true
    }
  },
  {
    id: 'mgmt-data-driven-alerts-notes',
    section: 'Data Driven Alerts',
    questionText: 'Data Driven Alerts notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 11003,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-data-driven-alerts',
      isFullWidth: true
    }
  },
  {
    id: 'mgmt-data-driven-alerts-validation',
    section: 'Data Driven Alerts',
    questionText: 'Data Driven Alerts Validation',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 11004,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-data-driven-alerts',
      hasDate: true
    }
  },
  {
    id: 'mgmt-data-driven-alerts-validation-notes',
    section: 'Data Driven Alerts',
    questionText: 'Data Driven Alerts Validation notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 11005,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-data-driven-alerts',
      isFullWidth: true
    }
  },

  // ==================== SECTION 12: FAVORITES (Delta Support) ====================
  {
    id: 'mgmt-favorites-parent',
    section: 'Favorites',
    questionText: 'Favorites',
    questionType: 'deltaParent',
    answer: null,
    completed: false,
    order: 12000,
    deltas: [],
    metadata: {
      isManagementQuestion: true,
      isDeltaParent: true,
      sectionGroup: 'management-favorites',
      deltaTemplate: {
        runbook: '',
        migrated: null,
        owner: null,
        date: null,
        notes: '',
        complete: false
      }
    }
  },
  {
    id: 'mgmt-favorites-initial',
    section: 'Favorites',
    questionText: 'Favorites',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 12001,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-favorites',
      hasDate: true
    }
  },
  {
    id: 'mgmt-favorites-notes',
    section: 'Favorites',
    questionText: 'Favorites notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 12002,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-favorites',
      isFullWidth: true
    }
  },
  {
    id: 'mgmt-favorites-validation',
    section: 'Favorites',
    questionText: 'Favorites Validation',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 12003,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-favorites',
      hasDate: true
    }
  },
  {
    id: 'mgmt-favorites-validation-notes',
    section: 'Favorites',
    questionText: 'Favorites Validation notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 12004,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-favorites',
      isFullWidth: true
    }
  },

  // ==================== SECTION 13: TAGS (Delta Support) ====================
  {
    id: 'mgmt-tags-parent',
    section: 'Tags',
    questionText: 'Tags',
    questionType: 'deltaParent',
    answer: null,
    completed: false,
    order: 13000,
    deltas: [],
    metadata: {
      isManagementQuestion: true,
      isDeltaParent: true,
      sectionGroup: 'management-tags',
      deltaTemplate: {
        runbook: '',
        migrated: null,
        owner: null,
        date: null,
        notes: '',
        complete: false
      }
    }
  },
  {
    id: 'mgmt-tags-none',
    section: 'Tags',
    questionText: 'No tags to migrate',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 13001,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-tags'
    }
  },
  {
    id: 'mgmt-tags-initial',
    section: 'Tags',
    questionText: 'Tags',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 13002,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-tags',
      hasDate: true
    }
  },
  {
    id: 'mgmt-tags-notes',
    section: 'Tags',
    questionText: 'Tags notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 13003,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-tags',
      isFullWidth: true
    }
  },
  {
    id: 'mgmt-tags-validation',
    section: 'Tags',
    questionText: 'Tags Validation',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 13004,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-tags',
      hasDate: true
    }
  },
  {
    id: 'mgmt-tags-validation-notes',
    section: 'Tags',
    questionText: 'Tags Validation notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 13005,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-tags',
      isFullWidth: true
    }
  },

  // ==================== SECTION 14: ACCELERATED VIEWS (Delta Support) ====================
  {
    id: 'mgmt-accelerated-views-parent',
    section: 'Accelerated Views',
    questionText: 'Accelerated Views',
    questionType: 'deltaParent',
    answer: null,
    completed: false,
    order: 14000,
    deltas: [],
    metadata: {
      isManagementQuestion: true,
      isDeltaParent: true,
      sectionGroup: 'management-accelerated-views',
      deltaTemplate: {
        runbook: '',
        migrated: null,
        owner: null,
        date: null,
        notes: '',
        complete: false
      }
    }
  },
  {
    id: 'mgmt-accelerated-views-none',
    section: 'Accelerated Views',
    questionText: 'No accelerated views to migrate',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 14001,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-accelerated-views'
    }
  },
  {
    id: 'mgmt-accelerated-views-initial',
    section: 'Accelerated Views',
    questionText: 'Accelerated Views',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 14002,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-accelerated-views',
      hasDate: true
    }
  },
  {
    id: 'mgmt-accelerated-views-notes',
    section: 'Accelerated Views',
    questionText: 'Accelerated Views notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 14003,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-accelerated-views',
      isFullWidth: true
    }
  },
  {
    id: 'mgmt-accelerated-views-validation',
    section: 'Accelerated Views',
    questionText: 'Accelerated Views Validation',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 14004,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-accelerated-views',
      hasDate: true
    }
  },
  {
    id: 'mgmt-accelerated-views-validation-notes',
    section: 'Accelerated Views',
    questionText: 'Accelerated Views Validation notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 14005,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-accelerated-views',
      isFullWidth: true
    }
  },

  // ==================== SECTION 15: WEBHOOKS (Delta Support) ====================
  {
    id: 'mgmt-webhooks-parent',
    section: 'Webhooks',
    questionText: 'Webhooks',
    questionType: 'deltaParent',
    answer: null,
    completed: false,
    order: 15000,
    deltas: [],
    metadata: {
      isManagementQuestion: true,
      isDeltaParent: true,
      sectionGroup: 'management-webhooks',
      deltaTemplate: {
        runbook: '',
        migrated: null,
        owner: null,
        date: null,
        notes: '',
        complete: false
      }
    }
  },
  {
    id: 'mgmt-webhooks-none',
    section: 'Webhooks',
    questionText: 'No webhooks to migrate',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 15001,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-webhooks'
    }
  },
  {
    id: 'mgmt-webhooks-initial',
    section: 'Webhooks',
    questionText: 'Webhooks',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 15002,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-webhooks',
      hasDate: true
    }
  },
  {
    id: 'mgmt-webhooks-notes',
    section: 'Webhooks',
    questionText: 'Webhooks notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 15003,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-webhooks',
      isFullWidth: true
    }
  },
  {
    id: 'mgmt-webhooks-validation',
    section: 'Webhooks',
    questionText: 'Webhooks Validation',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 15004,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-webhooks',
      hasDate: true
    }
  },
  {
    id: 'mgmt-webhooks-validation-notes',
    section: 'Webhooks',
    questionText: 'Webhooks Validation notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 15005,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-webhooks',
      isFullWidth: true
    }
  },

  // ==================== SECTION 16: COLLECTIONS (Delta Support) ====================
  {
    id: 'mgmt-collections-parent',
    section: 'Collections',
    questionText: 'Collections',
    questionType: 'deltaParent',
    answer: null,
    completed: false,
    order: 16000,
    deltas: [],
    metadata: {
      isManagementQuestion: true,
      isDeltaParent: true,
      sectionGroup: 'management-collections',
      deltaTemplate: {
        runbook: '',
        migrated: null,
        owner: null,
        date: null,
        notes: '',
        complete: false
      }
    }
  },
  {
    id: 'mgmt-collections-initial',
    section: 'Collections',
    questionText: 'Collections',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 16001,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-collections',
      hasDate: true
    }
  },
  {
    id: 'mgmt-collections-notes',
    section: 'Collections',
    questionText: 'Collections notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 16002,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-collections',
      isFullWidth: true
    }
  },
  {
    id: 'mgmt-collections-validation',
    section: 'Collections',
    questionText: 'Collections Validation',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 16003,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-collections',
      hasDate: true
    }
  },
  {
    id: 'mgmt-collections-validation-notes',
    section: 'Collections',
    questionText: 'Collections Validation notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 16004,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-collections',
      isFullWidth: true
    }
  },

  // ==================== SECTION 17: DATA SOURCE EXTRACT REFRESHES (Delta Support) ====================
  {
    id: 'mgmt-data-source-extract-refreshes-parent',
    section: 'Data Source Extract Refreshes',
    questionText: 'Data Source Extract Refreshes',
    questionType: 'deltaParent',
    answer: null,
    completed: false,
    order: 17000,
    deltas: [],
    metadata: {
      isManagementQuestion: true,
      isDeltaParent: true,
      sectionGroup: 'management-data-source-extract-refreshes',
      deltaTemplate: {
        runbook: '',
        migrated: null,
        owner: null,
        date: null,
        notes: '',
        complete: false
      }
    }
  },
  {
    id: 'mgmt-data-source-extract-refreshes-initial',
    section: 'Data Source Extract Refreshes',
    questionText: 'Data Source Extract Refreshes',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 17001,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-data-source-extract-refreshes',
      hasDate: true
    }
  },
  {
    id: 'mgmt-data-source-extract-refreshes-notes',
    section: 'Data Source Extract Refreshes',
    questionText: 'Data Source Extract Refreshes notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 17002,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-data-source-extract-refreshes',
      isFullWidth: true
    }
  },
  {
    id: 'mgmt-data-source-extract-refreshes-validation',
    section: 'Data Source Extract Refreshes',
    questionText: 'Data Source Extract Refreshes Validation',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 17003,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-data-source-extract-refreshes',
      hasDate: true
    }
  },
  {
    id: 'mgmt-data-source-extract-refreshes-validation-notes',
    section: 'Data Source Extract Refreshes',
    questionText: 'Data Source Extract Refreshes Validation notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 17004,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-data-source-extract-refreshes',
      isFullWidth: true
    }
  },

  // ==================== SECTION 18: WORKBOOK EXTRACT REFRESHES (Delta Support) ====================
  {
    id: 'mgmt-workbook-extract-refreshes-parent',
    section: 'Workbook Extract Refreshes',
    questionText: 'Workbook Extract Refreshes',
    questionType: 'deltaParent',
    answer: null,
    completed: false,
    order: 18000,
    deltas: [],
    metadata: {
      isManagementQuestion: true,
      isDeltaParent: true,
      sectionGroup: 'management-workbook-extract-refreshes',
      deltaTemplate: {
        runbook: '',
        migrated: null,
        owner: null,
        date: null,
        notes: '',
        complete: false
      }
    }
  },
  {
    id: 'mgmt-workbook-extract-refreshes-initial',
    section: 'Workbook Extract Refreshes',
    questionText: 'Workbook Extract Refreshes',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 18001,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-workbook-extract-refreshes',
      hasDate: true
    }
  },
  {
    id: 'mgmt-workbook-extract-refreshes-notes',
    section: 'Workbook Extract Refreshes',
    questionText: 'Workbook Extract Refreshes notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 18002,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-workbook-extract-refreshes',
      isFullWidth: true
    }
  },
  {
    id: 'mgmt-workbook-extract-refreshes-validation',
    section: 'Workbook Extract Refreshes',
    questionText: 'Workbook Extract Refreshes Validation',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 18003,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-workbook-extract-refreshes',
      hasDate: true
    }
  },
  {
    id: 'mgmt-workbook-extract-refreshes-validation-notes',
    section: 'Workbook Extract Refreshes',
    questionText: 'Workbook Extract Refreshes Validation notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 18004,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-workbook-extract-refreshes',
      isFullWidth: true
    }
  },

  // ==================== SECTION 19: FLOW RUN TASKS (Delta Support) ====================
  {
    id: 'mgmt-flow-run-tasks-parent',
    section: 'Flow Run Tasks',
    questionText: 'Flow Run Tasks',
    questionType: 'deltaParent',
    answer: null,
    completed: false,
    order: 19000,
    deltas: [],
    metadata: {
      isManagementQuestion: true,
      isDeltaParent: true,
      sectionGroup: 'management-flow-run-tasks',
      deltaTemplate: {
        runbook: '',
        migrated: null,
        owner: null,
        date: null,
        notes: '',
        complete: false
      }
    }
  },
  {
    id: 'mgmt-flow-run-tasks-initial',
    section: 'Flow Run Tasks',
    questionText: 'Flow Run Tasks',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 19001,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-flow-run-tasks',
      hasDate: true
    }
  },
  {
    id: 'mgmt-flow-run-tasks-notes',
    section: 'Flow Run Tasks',
    questionText: 'Flow Run Tasks notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 19002,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-flow-run-tasks',
      isFullWidth: true
    }
  },
  {
    id: 'mgmt-flow-run-tasks-validation',
    section: 'Flow Run Tasks',
    questionText: 'Flow Run Tasks Validation',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 19003,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-flow-run-tasks',
      hasDate: true
    }
  },
  {
    id: 'mgmt-flow-run-tasks-validation-notes',
    section: 'Flow Run Tasks',
    questionText: 'Flow Run Tasks Validation notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 19004,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-flow-run-tasks',
      isFullWidth: true
    }
  },

  // ==================== SECTION 20: SUBSCRIPTIONS (Delta Support) ====================
  {
    id: 'mgmt-subscriptions-parent',
    section: 'Subscriptions',
    questionText: 'Subscriptions',
    questionType: 'deltaParent',
    answer: null,
    completed: false,
    order: 20000,
    deltas: [],
    metadata: {
      isManagementQuestion: true,
      isDeltaParent: true,
      sectionGroup: 'management-subscriptions',
      deltaTemplate: {
        runbook: '',
        migrated: null,
        owner: null,
        date: null,
        notes: '',
        complete: false
      }
    }
  },
  {
    id: 'mgmt-subscriptions-initial',
    section: 'Subscriptions',
    questionText: 'Subscriptions',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 20001,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-subscriptions',
      hasDate: true
    }
  },
  {
    id: 'mgmt-subscriptions-notes',
    section: 'Subscriptions',
    questionText: 'Subscriptions notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 20002,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-subscriptions',
      isFullWidth: true
    }
  },
  {
    id: 'mgmt-subscriptions-validation',
    section: 'Subscriptions',
    questionText: 'Subscriptions Validation',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 20003,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-subscriptions',
      hasDate: true
    }
  },
  {
    id: 'mgmt-subscriptions-validation-notes',
    section: 'Subscriptions',
    questionText: 'Subscriptions Validation notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 20004,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-subscriptions',
      isFullWidth: true
    }
  },

  // ==================== SECTION 21: BRIDGE CONNECTIONS (Custom Grid) ====================
  {
    id: 'mgmt-bridge-intro',
    section: 'Bridge Connections',
    questionText: 'Introduction to Bridge',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 21001,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-bridge-connections',
      hasDate: true,
      gridColumn: 1
    }
  },
  {
    id: 'mgmt-bridge-configure-pooling',
    section: 'Bridge Connections',
    questionText: 'Configure Pooling',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 21002,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-bridge-connections',
      hasDate: true,
      gridColumn: 1
    }
  },
  {
    id: 'mgmt-bridge-update-workbooks',
    section: 'Bridge Connections',
    questionText: 'Update Bridge Workbooks',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 21003,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-bridge-connections',
      hasDate: true,
      gridColumn: 1
    }
  },
  {
    id: 'mgmt-bridge-update-prep-flows',
    section: 'Bridge Connections',
    questionText: 'Update Bridge Prep Flows',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 21004,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-bridge-connections',
      hasDate: true,
      gridColumn: 1
    }
  },
  {
    id: 'mgmt-bridge-testing',
    section: 'Bridge Connections',
    questionText: 'Testing & Troubleshoot if necessary',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 21005,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-bridge-connections',
      hasDate: true,
      gridColumn: 1
    }
  },
  {
    id: 'mgmt-bridge-setup-install',
    section: 'Bridge Connections',
    questionText: 'Set Up/Install Bridge (if necessary)',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 21006,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-bridge-connections',
      hasDate: true,
      gridColumn: 2
    }
  },
  {
    id: 'mgmt-bridge-test-connections',
    section: 'Bridge Connections',
    questionText: 'Test Connections',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 21007,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-bridge-connections',
      hasDate: true,
      gridColumn: 2
    }
  },
  {
    id: 'mgmt-bridge-update-data-sources',
    section: 'Bridge Connections',
    questionText: 'Update Bridge Data Sources',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 21008,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-bridge-connections',
      hasDate: true,
      gridColumn: 2
    }
  },
  {
    id: 'mgmt-bridge-update-virtual-connections',
    section: 'Bridge Connections',
    questionText: 'Update Bridge Virtual Connections',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 21009,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-bridge-connections',
      hasDate: true,
      gridColumn: 2
    }
  },
  {
    id: 'mgmt-bridge-runbook-updates',
    section: 'Bridge Connections',
    questionText: 'Runbook Bridge Updates',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 21010,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-bridge-connections',
      hasDate: true,
      gridColumn: 2
    }
  },
  {
    id: 'mgmt-bridge-validation-notes',
    section: 'Bridge Connections',
    questionText: 'Bridge Connections Validation notes',
    questionType: 'textInput',
    answer: '',
    completed: false,
    order: 21011,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-bridge-connections',
      hasDate: true,
      isFullWidth: true
    }
  },

  // ==================== SECTION 22: MIGRATION ISSUES LOG ====================
  {
    id: 'mgmt-issues-log-parent',
    section: 'Migration Issues Log',
    questionText: 'Migration Issues Log',
    questionType: 'deltaParent',
    answer: null,
    completed: false,
    order: 22000,
    deltas: [],
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-migration-issues-log',
      isIssuesLog: true
    }
  },

  // ==================== SECTION 23: CONTENT VALIDATION TABLE ====================
  {
    id: 'mgmt-content-validation-parent',
    section: 'Content Validation',
    questionText: 'Content Validation',
    questionType: 'deltaParent',
    answer: null,
    completed: false,
    order: 23000,
    deltas: [],
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-content-validation',
      isContentValidationTable: true
    }
  },

  // ==================== SECTION 24: CONTENT TESTING ====================
  {
    id: 'mgmt-content-testing-user-access',
    section: 'Content Testing',
    questionText: 'User Access',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 24001,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-content-testing',
      hasDate: true
    }
  },
  {
    id: 'mgmt-content-testing-workbook-access',
    section: 'Content Testing',
    questionText: 'Workbook Access',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 24002,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-content-testing',
      hasDate: true
    }
  },
  {
    id: 'mgmt-content-testing-data-connectivity-live',
    section: 'Content Testing',
    questionText: 'Data Connectivity - Live Connections',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 24003,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-content-testing',
      hasDate: true
    }
  },
  {
    id: 'mgmt-content-testing-data-connectivity-extracts',
    section: 'Content Testing',
    questionText: 'Data Connectivity - Extract Refreshes',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 24004,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-content-testing',
      hasDate: true
    }
  },
  {
    id: 'mgmt-content-testing-dashboard-functionality',
    section: 'Content Testing',
    questionText: 'Dashboard functionality',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 24005,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-content-testing',
      hasDate: true
    }
  },
  {
    id: 'mgmt-content-testing-metrics',
    section: 'Content Testing',
    questionText: 'Metrics',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 24006,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-content-testing',
      hasDate: true
    }
  },
  {
    id: 'mgmt-content-testing-subscriptions',
    section: 'Content Testing',
    questionText: 'Subscriptions',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 24007,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-content-testing',
      hasDate: true
    }
  },
  {
    id: 'mgmt-content-testing-rls',
    section: 'Content Testing',
    questionText: 'RLS',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 24008,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-content-testing',
      hasDate: true,
      ownerDropdown: ['Client']
    }
  },
  {
    id: 'mgmt-content-testing-url-actions',
    section: 'Content Testing',
    questionText: 'URL Actions',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 24009,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-content-testing',
      hasDate: true,
      ownerDropdown: ['Client']
    }
  },
  {
    id: 'mgmt-content-testing-subscription',
    section: 'Content Testing',
    questionText: 'Subscription',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 24010,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-content-testing',
      hasDate: true
    }
  },

  // ==================== SECTION 25: POST MIGRATION TASKS ====================
  {
    id: 'mgmt-post-custom-logo',
    section: 'Post Migration Tasks',
    questionText: 'Custom Logo on Cloud',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 25001,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-post-migration-tasks',
      hasDate: true
    }
  },
  {
    id: 'mgmt-post-iw-testing-complete',
    section: 'Post Migration Tasks',
    questionText: 'InterWorks Testing Complete',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 25002,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-post-migration-tasks',
      hasDate: true
    }
  },
  {
    id: 'mgmt-post-client-testing-complete',
    section: 'Post Migration Tasks',
    questionText: 'Client Testing Complete',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 25003,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-post-migration-tasks',
      hasDate: true
    }
  },
  {
    id: 'mgmt-post-backup-tableau-server',
    section: 'Post Migration Tasks',
    questionText: 'Back-up Tableau Server',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 25004,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-post-migration-tasks',
      hasDate: true
    }
  },
  {
    id: 'mgmt-post-export-config-data',
    section: 'Post Migration Tasks',
    questionText: 'Export Config Data',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 25005,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-post-migration-tasks',
      hasDate: true
    }
  },
  {
    id: 'mgmt-post-export-content-disk',
    section: 'Post Migration Tasks',
    questionText: 'Export all Content to Disk',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 25006,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-post-migration-tasks',
      hasDate: true
    }
  },
  {
    id: 'mgmt-post-decommission-server',
    section: 'Post Migration Tasks',
    questionText: 'Fully Decommission Tableau Server',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 25007,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-post-migration-tasks',
      hasDate: true
    }
  },
  {
    id: 'mgmt-post-go-live-confirmed',
    section: 'Post Migration Tasks',
    questionText: 'Go Live Date Confirmed?',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 25008,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-post-migration-tasks',
      hasDate: true
    }
  },
  {
    id: 'mgmt-post-activate-subscriptions',
    section: 'Post Migration Tasks',
    questionText: 'Activate subscriptions',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 25009,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-post-migration-tasks',
      hasDate: true
    }
  },
  {
    id: 'mgmt-post-go-live-completed',
    section: 'Post Migration Tasks',
    questionText: 'Go Live Completed',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 25010,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-post-migration-tasks',
      hasDate: true
    }
  },
  {
    id: 'mgmt-post-client-sign-off',
    section: 'Post Migration Tasks',
    questionText: 'Client Sign Off',
    questionType: 'checkbox',
    answer: false,
    completed: false,
    order: 25011,
    metadata: {
      isManagementQuestion: true,
      sectionGroup: 'management-post-migration-tasks',
      hasDate: true
    }
  }
];

module.exports = managementQuestionTemplate;
