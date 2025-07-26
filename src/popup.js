// popup.js
/*
This js file analyzes the text and shows human-written advice
*/

// Function to detect emotion (can be expanded to use fetched keywords)
function detectEmotion(text, keywordsData) {
  text = text.toLowerCase();
  for (const entry of keywordsData) {
    if (entry.keywords.some((word) => text.includes(word))) {
      return entry.emotion;
    }
  }
  return 'neutral';
}

// Function to get human rewrite from fetched data
function getRewriteSuggestion(emotion, suggestionsData) {
  const suggestionEntry = suggestionsData.find((s) => s.emotion === emotion);
  return suggestionEntry ? suggestionEntry.suggestion : 'Sounds good to send!';
}

// When the "Check Emotional Tone" button is clicked:
document.getElementById('checkText').addEventListener('click', () => {
  // Get the currently active Gmail/Outlook/etc. tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // Inject a script to get the selected text from the page
    chrome.scripting.executeScript(
      {
        // Target the active tab
        target: { tabId: tabs[0].id },
        func: () => window.getSelection().toString().trim(),
      },
      (results) => {
        const selectedText = results[0].result;

        if (selectedText) {
          // Request rewrite suggestions from the background script
          chrome.runtime.sendMessage(
            { action: 'getRewriteSuggestions' },
            (response) => {
              if (response.success) {
                const suggestionsData = response.data;
                // Assuming your Firebase data has 'emotion' and 'suggestion' fields
                const emotion = detectEmotion(selectedText, suggestionsData); // Pass suggestionsData to detectEmotion
                const suggestion = getRewriteSuggestion(
                  emotion,
                  suggestionsData
                );
                document.getElementById('suggestion').textContent = suggestion;
              } else {
                console.error(
                  'Failed to fetch rewrite suggestions:',
                  response.error
                );
                document.getElementById('suggestion').textContent =
                  'Error fetching suggestions.';
              }
            }
          );
        } else {
          document.getElementById('suggestion').textContent =
            'Please select some text to check.';
        }
      }
    );
  });
});

// --- NEW CODE FOR TOGGLE FUNCTIONALITY (Keep as is) ---

const toggleSwitch = document.getElementById('toggle');

async function loadToggleState() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'getSetting',
      key: 'vibeCheckEnabled',
    });
    if (response.success && response.value !== undefined) {
      toggleSwitch.checked = response.value;
      console.log('Loaded toggle state:', response.value);
    } else {
      toggleSwitch.checked = true;
      console.log('No saved toggle state found, defaulting to enabled.');
    }
  } catch (error) {
    console.error('Error loading toggle state:', error);
    toggleSwitch.checked = true;
  }
}

async function saveToggleState(isEnabled) {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'saveSetting',
      key: 'vibeCheckEnabled',
      value: isEnabled,
    });
    if (response.success) {
      console.log('Saved toggle state:', isEnabled);
    } else {
      console.error('Error saving toggle state:', response.error);
    }
  } catch (error) {
    console.error('Error saving toggle state (communication issue):', error);
  }
}

toggleSwitch.addEventListener('change', (event) => {
  saveToggleState(event.target.checked);
});

document.addEventListener('DOMContentLoaded', loadToggleState);
