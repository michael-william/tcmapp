/**
 * Question Key Mapping
 *
 * Maps legacy sequential IDs (q1-q64) to semantic questionKey identifiers.
 * Format: {section_prefix}_{semantic_description}
 */

const questionKeyMapping = {
  // Security
  q1: 'security_secops_confirm',
  q2: 'security_data_connectivity',
  q3: 'security_connection_details',

  // Communications
  q4: 'communications_strategy_confirmed',
  q5: 'communications_assistance_needed',
  q6: 'communications_resources_assigned',
  q7: 'communications_change_freeze',
  q58: 'communications_notes',

  // Stakeholders
  q8: 'stakeholders_list',

  // Access & Connectivity
  q9: 'access_connection_method',
  q10: 'access_vpn_required',
  q11: 'access_vpn_details',
  q12: 'access_vpn_notes',
  q13: 'access_interworks_access',
  q14: 'access_tableau_install',
  q15: 'access_jumpbox_required',
  q16: 'access_jumpbox_details',
  q59: 'access_notes',

  // Authentication
  q17: 'auth_sso_enabled',
  q18: 'auth_openid_enabled',
  q19: 'auth_saml_enabled',
  q20: 'auth_migration_type',
  q21: 'auth_tableau_used',
  q22: 'auth_user_provisioning',
  q23: 'auth_user_list',
  q24: 'auth_user_deactivation',
  q60: 'auth_notes',

  // Backup & Disaster Recovery
  q25: 'backup_tableau_automated',
  q26: 'backup_tableau_manual',
  q27: 'backup_postgres_automated',
  q28: 'backup_postgres_manual',
  q29: 'backup_file_automated',
  q30: 'backup_file_manual',
  q61: 'backup_notes',

  // Scheduling & Monitoring
  q31: 'schedule_current_tool',
  q32: 'schedule_cloud_scheduler',
  q62: 'schedule_notes',

  // Tableau Cloud
  q33: 'cloud_sku_type',
  q34: 'cloud_site_count',
  q35: 'cloud_admin_setup',
  q36: 'cloud_user_groups',
  q37: 'cloud_projects_created',
  q38: 'cloud_license_assigned',
  q39: 'cloud_license_pending',
  q40: 'cloud_trial_expiry',
  q41: 'cloud_service_account',
  q42: 'cloud_service_account_owner',
  q43: 'cloud_service_account_manager',
  q44: 'cloud_manager_url',
  q45: 'cloud_access_confirmed',
  q63: 'cloud_notes',

  // Tableau Bridge
  q46: 'bridge_required',
  q47: 'bridge_servers_built',
  q48: 'bridge_expected_date',
  q49: 'bridge_testing_done',
  q50: 'bridge_service_mode',
  q51: 'bridge_service_account',
  q52: 'bridge_windows_auth',
  q53: 'bridge_flatfile_unc',
  q64: 'bridge_notes',

  // Content to be Migrated
  q54: 'content_sites_list',
  q55: 'content_projects_list',

  // Cloud Data Sources
  q56: 'cloud_ds_required',
  q57: 'cloud_ds_platform',
};

/**
 * Get questionKey for a given ID
 */
function getQuestionKey(id) {
  return questionKeyMapping[id];
}

/**
 * Get ID for a given questionKey (reverse lookup)
 */
function getQuestionId(key) {
  return Object.keys(questionKeyMapping).find(id => questionKeyMapping[id] === key);
}

/**
 * Validate that all keys are unique
 */
function validateUniqueKeys() {
  const keys = Object.values(questionKeyMapping);
  const uniqueKeys = new Set(keys);

  if (keys.length !== uniqueKeys.size) {
    const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
    throw new Error(`Duplicate questionKeys found: ${duplicates.join(', ')}`);
  }

  return true;
}

// Validate on load
validateUniqueKeys();

module.exports = {
  questionKeyMapping,
  getQuestionKey,
  getQuestionId,
  validateUniqueKeys,
};
