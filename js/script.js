document.addEventListener("DOMContentLoaded", function() {

const API_URL = "https://therapy-backend.onrender.com";

// Join button logic
document.querySelectorAll(".join-button").forEach((button) => {
  button.addEventListener("click", async () => {
    const activityId = button.dataset.activity;
    const nameInput = document.querySelector(
      `.name-input[data-activity="\${activityId}"]`
    );
    const name = nameInput.value.trim();
    if (!name) return alert("Vul je naam in.");
    await fetch(`\${API_URL}/join/\${activityId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    nameInput.value = "";
    alert("Je bent toegevoegd!");
  });
});

// Like button logic
document.querySelectorAll(".like-button").forEach((button) => {
  button.addEventListener("click", async () => {
    const activityId = button.dataset.activity;
    await fetch(`\${API_URL}/like/\${activityId}`, { method: "POST" });
    const likeDisplay = document.querySelector(
      `.like-display[data-activity="\${activityId}"]`
    );
    if (likeDisplay) {
      likeDisplay.textContent = parseInt(likeDisplay.textContent || "0") + 1;
    }
    updateTopActivities(); // Refresh top 5
  });
});

// Day switching
document.querySelectorAll(".day-button").forEach((button) => {
  button.addEventListener("click", () => {
    const selectedDay = button.dataset.day;
    document
      .querySelectorAll(".activities-day")
      .forEach((daySection) =>
        daySection.classList.toggle(
          "hidden",
          daySection.dataset.day !== selectedDay
        )
      );
  });
});

// Top 5 logica
async function updateTopActivities() {
  try {
    const response = await fetch(`${API_URL}/data`);
    const data = await response.json();
    const sorted = data.sort((a, b) => b.likes - a.likes).slice(0, 5);
    const container = document.querySelector("#top-activities .progress-container");
    container.innerHTML = "";
    sorted.forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "progress-item";
      div.textContent = `❤️ ${item.activity_name} — ${item.likes} likes`;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Top 5 ophalen mislukt:", err);
  }
}

// Init
updateTopActivities();

});