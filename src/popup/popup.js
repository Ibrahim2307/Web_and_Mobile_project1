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
const importDataBtn = document.getElementById("import-data");
const emailDataBtn = document.getElementById("email-data");
const toggle = document.getElementById("darkModeToggle");
const hiddenFileInput = document.createElement("input");
hiddenFileInput.type = "file";
hiddenFileInput.accept = "application/json";

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

createProfileBtn.addEventListener("click", async () => {
  const profileName = prompt("Enter a name for the new profile:");
  if (!profileName) return;

  const data = await chrome.storage.local.get("profiles");
  const profiles = data.profiles || {};

  if (profiles[profileName]) {
    alert("Profile already exists!");
    return;
  }

  profiles[profileName] = {};
  await chrome.storage.local.set({ profiles });
  await chrome.storage.local.set({ activeProfile: profileName });
  updateProfileSelector(profiles, profileName);
  updateFieldList(profiles[profileName]);
});