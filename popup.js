/*
This js file analyzes the text and shows human-written advice
*/

// Database of keywords (TO EXPAND!!)
const emotionKeywords = {
  angry: ['horrible', 'hate', 'angry', 'despicable', 'annoying'],
  happy: ['happy', 'fun', 'excited', 'love'],
  sad: ['sad', 'depressed', 'cry', 'alone', 'isolated'],
};

// This function categorises the tone of the highlighted text
// by detecting the emotion of certain words - we use the emotionKeywords database here
// to figure out the emotion
function detectEmotion(text) {
  // Converting the text to lowercase for easier looping and detecting
  text = text.toLowerCase();

  // Loop through each emotion (angry, sad, happy)
  for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
    // Check if any keyword exists in the highlighted text
    if (keywords.some((word) => text.includes(word))) {
      return emotion;
    }
  }
  // This is the default if no keywords match to any word in the highlighted text
  return 'neutral';
}

// Mock database of human suggestions (NEED TO BE REPLACED BY Firebase!!)
function humanRewrite(emotion) {
  const suggestions = {
    angry: [
      "Try: 'I feel frustrated because...'",
      "Reword: 'Let's find a solution together.'",
    ],
    sad: ["It's okay to say: 'I've been feeling down about...'"],
  };
  // Return the first suggestion for the detected emotion (or a default)
  return suggestions[emotion]?.[0] || 'Sounds good to send!';
}

// When the "Check Emotional Tone" button is clicked:
document.getElementById('checkText').addEventListener('click', () => {
  // Get the currently active Gmail/Outlook/etc. tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // Inject a script to get the selected text from the page
    chrome.scripting.executeScript(
      {
        // Target the active tab
        // tabs[0] refers to the first and only active tab
        target: { tabId: tabs[0].id },

        // Function to run in the tab
        func: () => window.getSelection().toString().trim(),

        // Analysis taking place
      },
      (results) => {
        // Get the selected text
        const text = results[0].result;

        // Detect emotion (e.g., "angry")
        const emotion = detectEmotion(text);

        // Get human rewrite
        const suggestion = humanRewrite(emotion);
        // Display the suggestion in the popup
        document.getElementById('suggestion').textContent = suggestion;
      }
    );
  });
});
