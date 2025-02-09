document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get("userData", ({ userData }) => {
    if (userData) {
      document.getElementById("firstName").value = userData["firstName"];
      document.getElementById("lastName").value = userData["lastName"];
      document.getElementById("experience").value = userData["experience"];
      document.getElementById("skills").value = userData["skills"];
      document.getElementById("education").value = userData["education"];
      document.getElementById("email").value = userData["email"];
      document.getElementById("languages").value = userData["languages"];
      document.getElementById("certificateLinks").value = userData["certificateLink"];
      document.getElementById("portfolioLinks").value = userData["portfolioLinks"];
      document.getElementById("personalSummary").value = userData["personalSummary"];
    }
  });
});

document.getElementById("getInfoProfileButton").addEventListener("click", (e) => {

if(document.getElementById("getProfileInfo").value!=''){
  const data = null;

const xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener('readystatechange', function () {
	if (this.readyState === this.DONE) {
    const getData = JSON.parse(this.responseText);

		if(typeof(getData['firstName'])!=='undefined')
    {
      document.getElementById("firstName").value = getData["firstName"];
      document.getElementById("lastName").value = getData["lastName"];
      if(typeof(getData['position'][0])!=='undefined'){
        document.getElementById("experience").value = getData['position'][0]["title"];
      }
      if(typeof(getData['skills'][0])!=='undefined'){
        document.getElementById("skills").value = getData['skills'][0]["name"];
      }
      if(typeof(getData['educations'][0])!=='undefined'){
        document.getElementById("education").value = getData['educations'][0]["schoolName"];
      }
      document.getElementById("personalSummary").value = getData["summary"];
    }
	}
});

xhr.open('GET', 'https://linkedin-data-api.p.rapidapi.com/?username='+document.getElementById("getProfileInfo").value);
xhr.setRequestHeader('x-rapidapi-key', '09a7323ed4msh82ff902e953be64p1728d2jsn1809a8db9423');
xhr.setRequestHeader('x-rapidapi-host', 'linkedin-data-api.p.rapidapi.com');

xhr.send(data);
}
});

document.getElementById("saveFormButton").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.storage.sync.get("userData", ({ userData }) => {
userData[localStorage.getItem("activeProfile")] = {
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    experience: document.getElementById("experience").value,
    skills: document.getElementById("skills").value,
    education: document.getElementById("education").value,
    email: document.getElementById("email").value,
    languages: document.getElementById("languages").value,
    certificateLink: document.getElementById("certificateLinks").value,
    portfolioLinks: document.getElementById("portfolioLinks").value,
    personalSummary: document.getElementById("personalSummary").value,
};


  
  console.log("Predefined Fields Collected:", userData);

  const customFields = {};
  const customFieldsContainer = document.getElementById("customFieldsContainer");
  const customFieldGroups = customFieldsContainer.querySelectorAll(".field-group");
  console.log(customFieldGroups);
  customFieldGroups.forEach((group) => {
  console.log(group);
  const fieldName = group.querySelector(".field-label-input").value;
  const fieldValue = group.querySelector(".field-input").value;
  userData[localStorage.getItem("activeProfile")][fieldName] = fieldValue;
  console.log(fieldName);
  console.log(fieldValue);
  });
console.log(userData);
  chrome.storage.sync.set({ userData }, () => {
    console.log("Data Saved to Storage:", { userData });
    alert("Details saved!");
  });
});
});

document.getElementById("addFieldButton").addEventListener("click", () => {
  const customFieldsContainer = document.getElementById("customFieldsContainer");

  const fieldGroup = document.createElement("div");
  fieldGroup.classList.add("field-group");

  const fieldLabelInput = document.createElement("input");
  fieldLabelInput.type = "text";
  fieldLabelInput.placeholder = "Field Name";
  fieldLabelInput.classList.add("field-label-input");

  const fieldLabel = document.createElement("label");
  fieldLabel.textContent = "Custom Field Value";
  fieldLabel.classList.add("field-label");

  const fieldInput = document.createElement("input");
  fieldInput.type = "text";
  fieldInput.classList.add("field-input");

  fieldGroup.appendChild(fieldLabelInput);
  fieldGroup.appendChild(fieldInput);

  customFieldsContainer.appendChild(fieldGroup);

  console.log("Custom Field Group Added.");

  fieldLabelInput.addEventListener("input", () => {
    fieldLabel.textContent = fieldLabelInput.value.trim() || "Custom Field Value";
    console.log(`Field Name Updated: ${fieldLabel.textContent}`);
  });
});

document.getElementById("autofillButton").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "autofill" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error Sending Message:",chrome.runtime.lastError.message);
        alert("Failed to send autofill message. Ensure the webpage is supported.");
      } else if (response?.status === "success") {
        alert(`Form autofilled successfully! Total Fields Filled: ${response.filledFields}`);
      } else {
        console.error("Autofill Failed:", response?.message);
        alert(`Autofill failed: ${response?.message}`);
      }
    });
  });
});

document.getElementById("exportDataButton").addEventListener("click", async () => {
    const data = await chrome.storage.local.get();
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json",});
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "autofill_data.json";
    a.click();

    URL.revokeObjectURL(url);
    alert("Data exported successfully!");
  });

document.getElementById("importDataButton").addEventListener("click", () => {
  const fileInput = document.getElementById("importFileInput");
  fileInput.click();

  fileInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          await chrome.storage.local.set(importedData);
          alert("Data imported successfully!");
          location.reload();
        } catch (err) {
          console.error("Error importing data:", err);
          alert("Failed to import data. Please check the file format.");
        }
      };
      reader.readAsText(file);
    }
  });
});

document.getElementById("sendEmailButton").addEventListener("click", async () => {
    const data = await chrome.storage.local.get();
    const emailBody = encodeURIComponent(JSON.stringify(data, null, 2));

    const mailtoLink = `mailto:?subject=Exported Autofill Data&body=${emailBody}`;
    window.location.href = mailtoLink;
  });

document.getElementById("GenerateCoverLetter").addEventListener("click", () => {
  console.log("Started generating")
  alert("Generatig...");
  const data = JSON.stringify({
    model: "gemma-2-27b",
    messages: [
      {
        role: "user",
        content:"Generate me a cover letter using this information: " + document.getElementById("firstName").value + "!" + document.getElementById("experience").value + "!" + document.getElementById("skills").value + "!" + document.getElementById("languages").value + "!" + document.getElementById("education").value + "!",
      },
    ],
  });

  const xhr = new XMLHttpRequest();
  xhr.withCredentials = true;

  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === this.DONE) {
      var jsonparse = JSON.parse(this.responseText);
      document.getElementById("personalSummary").value = jsonparse["choices"][0]["message"]["content"];
      alert("Generated");
    }
  });

  xhr.open("POST", "https://google-gemma-2.p.rapidapi.com/");
  xhr.setRequestHeader( "x-rapidapi-key", "09a7323ed4msh82ff902e953be64p1728d2jsn1809a8db9423");
  xhr.setRequestHeader("x-rapidapi-host", "google-gemma-2.p.rapidapi.com");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(data);
});

document.addEventListener("DOMContentLoaded", () => {
  const profiles = JSON.parse(localStorage.getItem("profiles")) || {
    Default: {},
  };
  const activeProfile = localStorage.getItem("activeProfile") || "Default";

  if (!profiles[activeProfile]) {
    profiles[activeProfile] = {};
    localStorage.setItem("profiles", JSON.stringify(profiles));
    localStorage.setItem("activeProfile", activeProfile);
  }

  populateProfileSelector(profiles, activeProfile, true);
  loadProfileData(activeProfile);
});

function populateProfileSelector(profiles, activeProfile, gstatus) {
  const profileSelector = document.getElementById("profileSelector");
  profileSelector.innerHTML = "";

  Object.keys(profiles).forEach((profileName) => {
    const option = document.createElement("option");
    option.value = profileName;
    option.textContent = profileName;
    if (profileName === activeProfile) {
      option.selected = true;
    }
    profileSelector.appendChild(option);
  });

  profileSelector.addEventListener("change", (event) => {
    const selectedProfile = event.target.value;
    localStorage.setItem("activeProfile", selectedProfile);
    loadProfileData(selectedProfile);
    const customProfile = {};
    customProfile['activeprofile'] = selectedProfile;
    chrome.storage.sync.set({ customProfile }, () => {
      console.log("Data Saved to Storage:", { customProfile });

    });
  });
  if(gstatus==true){
    const selectedProfile = document.getElementById("profileSelector").value;
    localStorage.setItem("activeProfile", selectedProfile);
    loadProfileData(selectedProfile);
    const customProfile = {};
    customProfile['activeprofile'] = selectedProfile;
    chrome.storage.sync.set({ customProfile }, () => {
      console.log("Data Saved to Storage:", { customProfile });

    });
    
  }
}

document.getElementById("createProfileButton").addEventListener("click", () => {
  const profileName = prompt("Enter a name for the new profile:");
  if (!profileName) return;

  const profiles = JSON.parse(localStorage.getItem("profiles")) || {};

  if (profiles[profileName]) {
    alert("A profile with this name already exists.");
    return;
  }

  profiles[profileName] = {};
  localStorage.setItem("profiles", JSON.stringify(profiles));
  localStorage.setItem("activeProfile", profileName);

  populateProfileSelector(profiles, profileName, false);
  loadProfileData(profileName);
});

function loadProfileData(profile) {
  chrome.storage.sync.get("userData", ({ userData }) => {
if(typeof(userData[profile])!=='undefined'){
  var profileData = userData[profile];
  document.getElementById("firstName").value = profileData.firstName || "";
  document.getElementById("lastName").value = profileData.lastName || "";
  document.getElementById("email").value = profileData.email || "";
  document.getElementById("experience").value = profileData.experience || "";
  document.getElementById("skills").value = profileData.skills || "";
  document.getElementById("education").value = profileData.education || "";
  document.getElementById("languages").value = profileData.languages || "";
  document.getElementById("certificateLinks").value = profileData.certificateLink || "";
  document.getElementById("portfolioLinks").value = profileData.portfolioLinks || "";
  document.getElementById("personalSummary").value = profileData.personalSummary || "";
}
  });
}

document.getElementById("userForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const profiles = JSON.parse(localStorage.getItem("profiles")) || {};
  const activeProfile = localStorage.getItem("activeProfile") || "Default";

  const profileData = {
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    position: document.getElementById("position").value,
    startDate: document.getElementById("startDate").value,
    experience: document.getElementById("experience").value,
    skills: document.getElementById("skills").value,
    education: document.getElementById("education").value,
    languages: document.getElementById("languages").value,
    certificateLink: document.getElementById("certificateLink").value,
    portfolioLinks: document.getElementById("portfolioLinks").value,
    personalSummary: document.getElementById("personalSummary").value,
  };

  profiles[activeProfile] = profileData;
  localStorage.setItem("profiles", JSON.stringify(profiles));

  alert(`Data saved to profile "${activeProfile}"!`);
});

document.getElementById("loadProfileButton").addEventListener("click", () => {
  const profiles = JSON.parse(localStorage.getItem("profiles")) || {};
  const activeProfile = localStorage.getItem("activeProfile");

  if (!profiles[activeProfile]) {
    alert(`No data found for the active profile: ${activeProfile}`);
    return;
  }

  const profileData = profiles[activeProfile];
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "autofillProfile", profileData },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error Sending Message:",chrome.runtime.lastError.message);
          alert("Failed to send profile data for autofill. Ensure the webpage supports this feature.");
        } else if (response?.status === "success") {
          alert(`Profile "${activeProfile}" data loaded and autofilled successfully!`);
        } else {
          console.error("Autofill failed:", response?.message);
          alert(`Autofill failed: ${response?.message}`);
        }
      }
    );
  });
});

