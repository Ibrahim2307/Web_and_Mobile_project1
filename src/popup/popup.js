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
const hiddenFileInput = document.createElement("input"); // Hidden file input element
const generateCoverLetterBtn = document.getElementById("generate-cover-letter");
hiddenFileInput.type = "file";
hiddenFileInput.accept = "application/json";
document.addEventListener("DOMContentLoaded", async () => {
  const data = await chrome.storage.local.get(["profiles", "activeProfile", "fieldMappings", "jobApplications", "savedForms"]);
  const profiles = data.profiles || {};
  const activeProfile = data.activeProfile || "Default";
  const fieldMappings = data.fieldMappings || {};
  const jobApplications = data.jobApplications || [];
  const savedForms = data.savedForms || [];
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

deleteProfileBtn.addEventListener("click", async () => {
  const data = await chrome.storage.local.get(["profiles", "activeProfile"]);
  const profiles = data.profiles || {};
  const activeProfile = data.activeProfile;

  if (Object.keys(profiles).length === 1) {
    alert("You must have at least one profile.");
    return;
  }

  delete profiles[activeProfile];
  const newActiveProfile = Object.keys(profiles)[0];
  await chrome.storage.local.set({ profiles, activeProfile: newActiveProfile });
  updateProfileSelector(profiles, newActiveProfile);
  updateFieldList(profiles[newActiveProfile]);
});

profileSelector.addEventListener("change", async (e) => {
  const selectedProfile = e.target.value;
  const data = await chrome.storage.local.get("profiles");
  const profiles = data.profiles || {};
  await chrome.storage.local.set({ activeProfile: selectedProfile });
  updateFieldList(profiles[selectedProfile]);
});
fetchLinkedInDataBtn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.runtime.sendMessage({ action: "extractLinkedInData", tab }, (response) => {
    console.log(response);
    if (response?.success) {
      alert("LinkedIn data extracted and stored successfully!");
    } else {
      alert("Failed to extract LinkedIn data.");
    }
  });
});
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fieldName = fieldNameInput.value.trim();
  const fieldValue = fieldValueInput.value.trim();
  if (!fieldName || !fieldValue) return;

  const data = await chrome.storage.local.get(["profiles", "activeProfile"]);
  const profiles = data.profiles || {};
  const activeProfile = data.activeProfile;

  profiles[activeProfile][fieldName] = fieldValue;
  await chrome.storage.local.set({ profiles });
  fieldNameInput.value = "";
  fieldValueInput.value = "";
  updateFieldList(profiles[activeProfile]);
});

function updateFieldList(fields) {
  fieldList.innerHTML = "";
  for (const [name, value] of Object.entries(fields)) {
    const listItem = document.createElement("li");
    listItem.textContent = `${name}: ${value}`;
    fieldList.appendChild(listItem);
  }
}
mappingForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const linkedinField = linkedinFieldSelect.value;
  const formFieldName = formFieldNameInput.value.trim();
  if (!linkedinField || !formFieldName) return;

  const data = await chrome.storage.local.get("fieldMappings");
  const fieldMappings = data.fieldMappings || {};
  fieldMappings[formFieldName] = linkedinField;
  await chrome.storage.local.set({ fieldMappings });
  formFieldNameInput.value = "";
  updateMappingList(fieldMappings);
});

function updateMappingList(mappings) {
  mappingList.innerHTML = "";
  for (const [formField, linkedinField] of Object.entries(mappings)) {
    const listItem = document.createElement("li");
    listItem.textContent = `Form Field: ${formField} -> LinkedIn Field: ${linkedinField}`;
    mappingList.appendChild(listItem);
  }
}
jobTrackingForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const companyName = companyNameInput.value.trim();
  const jobTitle = jobTitleInput.value.trim();
  const applicationDate = applicationDateInput.value;
  const applicationStatus = applicationStatusInput.value;

  if (!companyName || !jobTitle || !applicationDate || !applicationStatus) return;

  const data = await chrome.storage.local.get("jobApplications");
  const jobApplications = data.jobApplications || [];
  jobApplications.push({
    companyName,
    jobTitle,
    applicationDate,
    applicationStatus
  });

  await chrome.storage.local.set({ jobApplications });
  companyNameInput.value = "";
  jobTitleInput.value = "";
  applicationDateInput.value = "";
  applicationStatusInput.value = "Applied";
  updateJobTrackingList(jobApplications);
});

if (toggle) {
  const isDarkMode = localStorage.getItem("dark-mode") === "true";
  if (isDarkMode) {
    document.body.classList.add("dark-mode");
    toggle.checked = true;
  }
  toggle.addEventListener("change", () => {
    if (toggle.checked) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("dark-mode", "true");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("dark-mode", "false");
    }
  });
}