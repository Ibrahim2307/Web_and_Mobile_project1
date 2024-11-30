chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "autofill") {
    console.log("Autofill message received.");

    chrome.storage.sync.get("userData", ({ userData }) => {
      if (!userData) {
        console.error("No user data found.");

        sendResponse({ status: "error", message: "No user data found." });

        return;
      }

      console.log("User data:", userData);

      const fieldMappings = {
        firstName: ["first name", "fname", "first"],

        lastName: ["last name", "lname", "last"],

        email: ["email", "email address", "e-mail"],

        phone: ["phone", "phone number", "contact"],

        position: ["applied position", "job title", "position"],

        startDate: ["start date", "earliest start date", "available date"],
      };

      const inputs = document.querySelectorAll("input, textarea");

      let filledFields = 0;

      inputs.forEach((input) => {
        const name = input.name?.toLowerCase() || input.id?.toLowerCase();

        const placeholder = input.placeholder?.toLowerCase();

        console.log(userData);

        for (const [key, value] of Object.entries(userData)) {
          if (typeof fieldMappings[key] !== "undefined") {
            var keywords = fieldMappings[key];

            if (
              keywords.some(
                (keyword) =>
                  name?.includes(keyword) || placeholder?.includes(keyword)
              )
            ) {
              console.log(`Filling ${key} with ${userData[key]}`);

              input.value = userData[key] || "";

              input.dispatchEvent(new Event("input", { bubbles: true }));

              filledFields++;
            }
          } else {
            if (name.indexOf(key) != -1 || placeholder.indexOf(key) != -1) {
              console.log(`Filling ${key} with ${userData[key]}`);

              input.value = userData[key] || "";

              input.dispatchEvent(new Event("input", { bubbles: true }));

              filledFields++;
            }
          }
        }
      });

      if (filledFields > 0) {
        console.log(`Successfully filled ${filledFields} fields.`);

        sendResponse({ status: "success" });
      } else {
        console.error("No fields matched for autofill.");

        sendResponse({ status: "error", message: "No fields matched." });
      }
    });

    return true;
  }
});