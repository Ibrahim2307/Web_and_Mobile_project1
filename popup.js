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
      document.getElementById("certificateLink").value =
        userData["certificateLink"];
      document.getElementById("portfolioLinks").value =
        userData["portfolioLinks"];
      document.getElementById("personalSummary").value =
        userData["personalSummary"];
    }
  });
});
document.getElementById("savebtn").addEventListener("click", (e) => {
  e.preventDefault();

  const userData = {
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    experience: document.getElementById("experience").value,
    skills: document.getElementById("skills").value,
    education: document.getElementById("education").value,
    email: document.getElementById("email").value,
    languages: document.getElementById("languages").value,
    certificateLink: document.getElementById("certificateLink").value,
    portfolioLinks: document.getElementById("portfolioLinks").value,
    personalSummary: document.getElementById("personalSummary").value,
  };

  console.log("Predefined Fields Collected:", userData);

  const customFields = {};
  const customFieldsContainer = document.getElementById(
    "customFieldsContainer"
  );
  const customFieldGroups =
    customFieldsContainer.querySelectorAll(".field-group");
  console.log(customFieldGroups);
  customFieldGroups.forEach((group) => {
    console.log(group);
    const fieldName = group.querySelector(".field-label-input").value;
    const fieldValue = group.querySelector(".field-input").value;

    userData[fieldName] = fieldValue;
    console.log(fieldName);
    console.log(fieldValue);
  });

  chrome.storage.sync.set({ userData }, () => {
    console.log("Data Saved to Storage:", { userData });
    alert("Details saved!");
  });
});

document.getElementById("addFieldButton").addEventListener("click", () => {
  const customFieldsContainer = document.getElementById(
    "customFieldsContainer"
  );

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
    fieldLabel.textContent =
      fieldLabelInput.value.trim() || "Custom Field Value";
    console.log(`Field Name Updated: ${fieldLabel.textContent}`);
  });
});

document.getElementById("autofillButton").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "autofill" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(
          "Error Sending Message:",
          chrome.runtime.lastError.message
        );
        alert(
          "Failed to send autofill message. Ensure the webpage is supported."
        );
      } else if (response?.status === "success") {
        alert(
          `Form autofilled successfully! Total Fields Filled: ${response.filledFields}`
        );
      } else {
        console.error("Autofill Failed:", response?.message);
        alert(`Autofill failed: ${response?.message}`);
      }
    });
  });
});

document
  .getElementById("exportDataButton")
  .addEventListener("click", async () => {
    const data = await chrome.storage.local.get();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
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

document
  .getElementById("sendEmailButton")
  .addEventListener("click", async () => {
    const data = await chrome.storage.local.get();
    const emailBody = encodeURIComponent(JSON.stringify(data, null, 2));

    const mailtoLink = `mailto:?subject=Exported Autofill Data&body=${emailBody}`;
    window.location.href = mailtoLink;
  });

document
  .getElementById("saveFormButton")
  .addEventListener("click", async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "getFormData" },
        async (response) => {
          if (chrome.runtime.lastError) {
            console.error(
              "Error saving form data:",
              chrome.runtime.lastError.message
            );
            alert(
              "Failed to save form data. Ensure the webpage supports this feature."
            );
          } else if (response?.formData) {
            const savedForms =
              (await chrome.storage.local.get("savedForms")).savedForms || [];
            const formName = prompt(
              "Enter a name for this saved form:",
              `Form ${savedForms.length + 1}`
            );
            if (!formName) return;

            savedForms.push({ name: formName, data: response.formData });
            await chrome.storage.local.set({ savedForms });

            alert(`Form "${formName}" saved successfully!`);
            updateSavedFormsList();
          }
        }
      );
    });
  });

async function updateSavedFormsList() {
  const savedFormsList = document.getElementById("savedFormsList");
  savedFormsList.innerHTML = "";

  const savedForms =
    (await chrome.storage.local.get("savedForms")).savedForms || [];
  savedForms.forEach((form, index) => {
    const li = document.createElement("li");
    li.textContent = form.name;

    const restoreButton = document.createElement("button");
    restoreButton.textContent = "Restore";
    restoreButton.style.marginLeft = "10px";
    restoreButton.addEventListener("click", () => restoreForm(form.data));

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.style.marginLeft = "10px";
    deleteButton.addEventListener("click", async () => {
      savedForms.splice(index, 1);
      await chrome.storage.local.set({ savedForms });
      updateSavedFormsList();
    });

    li.appendChild(restoreButton);
    li.appendChild(deleteButton);
    savedFormsList.appendChild(li);
  });
}

function restoreForm(formData) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "restoreFormData", formData },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            "Error restoring form data:",
            chrome.runtime.lastError.message
          );
          alert(
            "Failed to restore form data. Ensure the webpage supports this feature."
          );
        } else {
          alert("Form data restored successfully!");
        }
      }
    );
  });
}