document.addEventListener("DOMContentLoaded", function () {
  const snippetInput = document.getElementById("snippetInput");
  const snippetNameInput = document.getElementById("snippetName");
  const saveSnippetButton = document.getElementById("saveSnippet");
  const languageDropdown = document.getElementById("languageDropdown");
  const snippetList = document.getElementById("snippetList");
  const darkModeToggle = document.getElementById("darkModeToggle");

  // Load existing languages and snippets from storage
  chrome.storage.sync.get(["languages", "snippets"], function (data) {
    const languages = data.languages || [
      "javascript",
      "TypeScript",
      "CSS",
      "Java",
      "C++",
      "Python",
      "C#",
      "PHP",
      "C",
      "Rust",
      "Kotlin",
      "Ruby",
      "Perl",
      "Golang",
      "XML",
      "JSON",
      "Bash",
      "SQL",
      "Other",
    ];
    const snippets = data.snippets || [];

    // Update the language dropdown
    updateLanguageDropdown(languages);

    // Display snippets in the popup
    displaySnippets(snippets, languageDropdown.value); // Display all snippets initially
  });

  // Save a new snippet
  saveSnippetButton.addEventListener("click", function () {
    const snippetText = snippetInput.value.trim();
    const snippetName = snippetNameInput.value.trim();
    const selectedLanguage = languageDropdown.value;

    if (snippetText !== "" && snippetName !== "") {
      // Retrieve existing snippets
      chrome.storage.sync.get("snippets", function (data) {
        const snippets = data.snippets || [];

        // Add the new snippet with language, name, and created date
        const newSnippet = {
          name: snippetName,
          text: snippetText,
          language: selectedLanguage,
          created: new Date().toISOString(), // Set the creation date
        };

        snippets.push(newSnippet);

        // Save the updated snippets
        chrome.storage.sync.set({ snippets: snippets }, function () {
          // Update the displayed snippets with the selected language
          displaySnippets(snippets, languageDropdown.value);
          snippetInput.value = ""; // Clear input after saving
          snippetNameInput.value = ""; // Clear input after saving
        });
      });
    }
  });

  // Language dropdown change event
  languageDropdown.addEventListener("change", function () {
    const selectedLanguage = languageDropdown.value;
    // Retrieve existing snippets
    chrome.storage.sync.get("snippets", function (data) {
      const snippets = data.snippets || [];
      // Update the displayed snippets with the selected language
      displaySnippets(snippets, selectedLanguage);
    });
  });

  // Display snippets in the popup
  function displaySnippets(snippets, selectedLanguage) {
    snippetList.innerHTML = "";
    snippets.forEach(function (snippet, index) {
      // Check if the snippet matches the selected language or show all if "All" is selected
      if (selectedLanguage === "all" || snippet.language === selectedLanguage) {
        const snippetDiv = document.createElement("div");
        snippetDiv.classList.add("snippet");

        const snippetPreview = snippet.text.substring(0, 30); // Show only the first 30 characters as a preview
        snippetDiv.innerHTML = `
          <span>${snippet.name}</span>
          <pre>${formatSnippet(snippet.language, snippetPreview)}</pre>
          <div class="snippet-options">
            <button class="loadBtn" data-index="${index}">Load</button>
            <button class="editBtn" data-index="${index}">Edit</button>
            <button class="deleteBtn" data-index="${index}">Delete</button>
          </div>
          <div class="snippet-date">${formatDate(snippet.created)}</div>
        `;

        snippetList.appendChild(snippetDiv);

        // Attach event listeners to the buttons
        snippetDiv
          .querySelector(".loadBtn")
          .addEventListener("click", function (event) {
            loadSnippet(event, index);
          });

        snippetDiv
          .querySelector(".editBtn")
          .addEventListener("click", function (event) {
            editSnippet(event, index);
          });

        snippetDiv
          .querySelector(".deleteBtn")
          .addEventListener("click", function (event) {
            deleteSnippet(event, index);
          });
      }
    });
  }

  // Sort snippets based on the selected criterion
  function sortSnippets() {
    chrome.storage.sync.get("snippets", function (data) {
      const snippets = data.snippets || [];
      const selectedCriterion = document.getElementById("sortDropdown").value;

      snippets.sort(function (a, b) {
        if (selectedCriterion === "title") {
          return a.name.localeCompare(b.name);
        } else if (selectedCriterion === "date") {
          return new Date(b.datetime) - new Date(a.datetime);
        } else if (selectedCriterion === "size") {
          return a.text.length - b.text.length;
        }
      });

      displaySnippets(snippets, languageDropdown.value);
    });
  }

  // Attach the sortSnippets function to the sortDropdown change event
  document
    .getElementById("sortDropdown")
    .addEventListener("change", sortSnippets);

  // Update the language dropdown
  function updateLanguageDropdown(languages) {
    languageDropdown.innerHTML = "";
    // Add an option for displaying all snippets
    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All";
    languageDropdown.appendChild(allOption);

    languages.forEach(function (language) {
      const option = document.createElement("option");
      option.value = language;
      option.textContent = language.charAt(0).toUpperCase() + language.slice(1); // Capitalize first letter
      languageDropdown.appendChild(option);
    });
  }

  // Format the snippet based on the selected language
  function formatSnippet(language, text) {
    // Yet to be implemented
    return text;
  }

  // Format the date
  function formatDate(dateString) {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, options);
  }

  // Edit a snippet
  function editSnippet(event, index) {
    event.stopPropagation(); // Prevent the click event from triggering the loadSnippet function
    chrome.storage.sync.get("snippets", function (data) {
      const snippets = data.snippets || [];
      const snippet = snippets[index];

      if (snippet) {
        snippetInput.value = snippet.text;
        snippetNameInput.value = snippet.name;

        // Remove the edited snippet from the list
        snippets.splice(index, 1);

        // Save the updated snippets
        chrome.storage.sync.set({ snippets: snippets }, function () {
          // Update the displayed snippets with the selected language
          displaySnippets(snippets, languageDropdown.value);
        });
      }
    });
  }

  // Delete a snippet
  function deleteSnippet(event, index) {
    event.stopPropagation(); // Prevent the click event from triggering the loadSnippet function
    chrome.storage.sync.get("snippets", function (data) {
      const snippets = data.snippets || [];

      // Remove the deleted snippet from the list
      snippets.splice(index, 1);

      // Save the updated snippets
      chrome.storage.sync.set({ snippets: snippets }, function () {
        // Update the displayed snippets with the selected language
        displaySnippets(snippets, languageDropdown.value);
      });
    });
  }

  // Load a snippet into the text area
  function loadSnippet(event, index) {
    event.stopPropagation(); // Prevent the click event from bubbling up and triggering the document click event
    chrome.storage.sync.get("snippets", function (data) {
      const snippets = data.snippets || [];
      const snippet = snippets[index];

      if (snippet) {
        snippetInput.value = snippet.text;
        snippetNameInput.value = snippet.name;
      }
    });
  }

  // Load dark mode state from storage
  chrome.storage.sync.get("darkMode", function (data) {
    const isDarkMode = data.darkMode || false;
    setDarkMode(isDarkMode);
    darkModeToggle.checked = isDarkMode;
  });

  // Save dark mode state to storage
  darkModeToggle.addEventListener("change", function () {
    const isDarkMode = darkModeToggle.checked;
    setDarkMode(isDarkMode);
    chrome.storage.sync.set({ darkMode: isDarkMode });
  });

  // Toggle dark mode
  function setDarkMode(isDarkMode) {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }
});
