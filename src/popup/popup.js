const profileSelector = document.getElementById("profile-selector");
const createProfileBtn = document.getElementById("create-profile");
const deleteProfileBtn = document.getElementById("delete-profile");
const fetchLinkedInDataBtn = document.getElementById("fetch-linkedin-data");
const form = document.getElementById("custom-field-form");
const fieldNameInput = document.getElementById("field-name");
const fieldValueInput = document.getElementById("field-value");
const fieldList = document.getElementById("field-list");
const mappingForm = document.getElementById("field-mapping-form");
const linkedinFieldSelect = document.getElementById("linkedin-field");
const formFieldNameInput = document.getElementById("form-field-name");
const mappingList = document.getElementById("mapping-list");
const jobTrackingForm = document.getElementById("job-tracking-form");
const companyNameInput = document.getElementById("company-name");
const jobTitleInput = document.getElementById("job-title");
const applicationDateInput = document.getElementById("application-date");
const applicationStatusInput = document.getElementById("application-status");
const jobTrackingList = document.getElementById("job-tracking-list");
const saveFormBtn = document.getElementById("save-form");
const savedFormsList = document.getElementById("saved-forms-list");
const exportDataBtn = document.getElementById("export-data");
const importDataInput = document.getElementById("import-data");
const emailDataBtn = document.getElementById("email-data");

// Initialize Data on Popup Load
document.addEventListener("DOMContentLoaded", async () => {
  const data = await chrome.storage.local.get(["profiles", "activeProfile", "fieldMappings", "jobApplications", "savedForms"]);
  const profiles = data.profiles || {};
  const activeProfile = data.activeProfile || "Default";
  const fieldMappings = data.fieldMappings || {};
  const jobApplications = data.jobApplications || [];
  const savedForms = data.savedForms || [];

  // Ensure at least one profile exists
  if (!profiles[activeProfile]) {
    profiles[activeProfile] = {};
    await chrome.storage.local.set({ profiles, activeProfile });
  }

  updateProfileSelector(profiles, activeProfile);
  updateFieldList(profiles[activeProfile]);
  updateMappingList(fieldMappings);
  updateJobTrackingList(jobApplications);
  updateSavedFormsList(savedForms);
});