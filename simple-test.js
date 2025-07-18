// Simple BCP Test Script with Better Feedback
console.log("🧪 Starting Simple BCP Test...");

// Test if we can find form elements
const businessNameInput = document.querySelector('input[name="businessName"]');
const locationSelect = document.querySelector('select[name="location"]');

if (businessNameInput) {
  console.log("✅ Found business name input");
  businessNameInput.value = "Island Paradise Restaurant Ltd.";
  businessNameInput.dispatchEvent(new Event('input', { bubbles: true }));
  console.log("✅ Set business name to:", businessNameInput.value);
} else {
  console.log("❌ Could not find business name input");
}

if (locationSelect) {
  console.log("✅ Found location select");
  locationSelect.value = "caribbean";
  locationSelect.dispatchEvent(new Event('change', { bubbles: true }));
  console.log("✅ Set location to:", locationSelect.value);
} else {
  console.log("❌ Could not find location select");
}

// Check what step we're on
const currentStep = document.querySelector('[data-step]');
if (currentStep) {
  console.log("✅ Current step:", currentStep.getAttribute('data-step'));
} else {
  console.log("❌ Could not detect current step");
}

console.log("🎯 Simple test complete! Check if the fields above were filled."); 