/*
This js file scans the text you highlight in your email software and sends it to the extension
*/

// Helper function to check if the text selection is in an email input field
function isEmailField() {
  // Gets the currently focused element (where the cursor is blinking -
  // in this case its going to be the Gmail compose box)
  const focusedEl = document.activeElement;

  return (
    // Checking whether the focusedEl it's a <textarea> (standard HTML input field) or
    // a <div> with role="textbox" (Gmail/Outlook uses these)
    // and returns the appropriate one
    focusedEl.tagName === 'TEXTAREA' ||
    focusedEl.getAttribute('role') === 'textbox'
  );
}

// Listening for mouse-up events (when you finish selecting text)
document.addEventListener('mouseup', () => {
  // Gets the selected text and remove extra spaces
  const selectedText = window.getSelection().toString().trim();

  // Checking if the text is selected AND is in an email field
  if (selectedText && isEmailField()) {
    // Sends the text to the extension's popup
    chrome.runtime.sendMessage({ text: selectedText });
  }
});
