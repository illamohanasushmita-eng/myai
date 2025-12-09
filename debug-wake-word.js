// Add this to browser console to test wake word detection
console.log("🎤 Testing Wake Word Detection...");

// Check browser support
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
console.log("Speech Recognition supported:", !!SpeechRecognition);

// Check microphone permissions
navigator.mediaDevices
  .getUserMedia({ audio: true })
  .then(() => console.log("✅ Microphone access granted"))
  .catch((err) => console.error("❌ Microphone access denied:", err));

// Test wake word manually
if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.language = "en-US";

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join("");
    console.log("🎤 Heard:", transcript);

    if (transcript.toLowerCase().includes("hey lara")) {
      console.log("✅ Wake word detected!");
    }
  };

  recognition.start();
  console.log('🎤 Say "Hey Lara" now...');
}
