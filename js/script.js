document.addEventListener("DOMContentLoaded", function() {
  const API_URL = 'https://therapy-backend-l5u7.onrender.com';

  // Functie om deelnemerslijst bij te werken voor 1 activiteit
  async function updateParticipants(activityId) {
    try {
      console.log(`Ophalen deelnemers voor: ${activityId}`);
      const response = await fetch(`${API_URL}/participants/${activityId}`);
      if (!response.ok) throw new Error(`Serverfout (status: ${response.status})`);
      const participants = await response.json();
      console.log(`Deelnemers voor ${activityId}:`, participants);

      const container = document.querySelector(`.participants-list[data-activity="${activityId}"]`);
      if (!container) {
        console.error(`Geen container gevonden voor deelnemers van ${activityId}`);
        return;
      }

      container.innerHTML = "";
      if (Array.isArray(participants) && participants.length > 0) {
        participants.forEach(p => {
          const div = document.createElement("div");
          div.textContent = p.name;
          container.appendChild(div);
        });
      }
    } catch (error) {
      console.error(`Fout bij laden deelnemers voor ${activityId}:`, error);
    }
  }

  // Likes click handler
  document.querySelectorAll(".like-button").forEach((button) => {
    button.addEventListener("click", async () => {
      const activityId = button.dataset.activity;
      try {
        const res = await fetch(`${API_URL}/like/${activityId}`, { method: "POST" });
        if (!res.ok) throw new Error("Like kon niet verwerkt worden");
        // Update UI likes
        const likeCountSpan = button.querySelector(".like-count");
        let count = parseInt(likeCountSpan.textContent) || 0;
        likeCountSpan.textContent = count + 1;
        updateTopActivities();
      } catch (error) {
        alert("Fout bij liken: " + error.message);
      }
    });
  });

  // Join button handler
  document.querySelectorAll(".join-button").forEach((button) => {
    button.addEventListener("click", async () => {
      const nameInput = button.previousElementSibling;
      const activityId = nameInput.dataset.activity;
      const name = nameInput.value.trim();

      if (!name) {
        alert("Vul je naam in.");
        return;
      }
      
      try {
        const res = await fetch(`${API_URL}/join/${activityId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });

        if (!res.ok) {
          throw new Error("Server kon naam niet opslaan.");
        }
        
        nameInput.value = "";
        alert("Je bent toegevoegd!");
        await updateParticipants(activityId);
      } catch (error) {
        alert("Fout bij toevoegen deelnemer: " + error.message);
        console.error("Fout in join-button handler:", error);
      }
    });
  });
  
  // Top 5 updaten
  async function updateTopActivities() {
    try {
      const response = await fetch(`${API_URL}/data`);
      if (!response.ok) throw new Error("Kon top 5 niet ophalen");
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Ongeldige data");
      const sorted = data.sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5);
      const container = document.querySelector("#top-activities .progress-container");
      if (!container) return;
      container.innerHTML = "";
      sorted.forEach(item => {
        const div = document.createElement("div");
        div.className = "progress-item";
        div.textContent = `❤️ ${item.activity_name} — ${item.likes || 0} likes`;
        container.appendChild(div);
      });
    } catch (err) {
      console.error("Top 5 ophalen mislukt:", err);
    }
  }

  // Dagknoppen wisselen
document.querySelectorAll(".day-button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const selectedDay = btn.dataset.day;

    // Active knop wisselen
    document.querySelectorAll(".day-button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    // Alle dagen verbergen behalve de gekozen
    document.querySelectorAll(".day-section").forEach(sec => {
      sec.classList.toggle("active", sec.id === selectedDay);
    });
  });
});

  // Bij paginalaad likes laden en deelnemerslijst updaten
  async function loadLikes() {
    try {
      const response = await fetch(`${API_URL}/data`);
      if (!response.ok) throw new Error("Likes konden niet geladen worden");
      const activities = await response.json();
      activities.forEach(activity => {
        const likeCountSpan = document.querySelector(`.like-count[data-activity="${activity.activity_id}"]`);
        if (likeCountSpan) {
          likeCountSpan.textContent = activity.likes;
        }
      });
    } catch (error) {
      console.error("Fout bij laden likes:", error);
    }
  }

  // Init
  loadLikes();
  updateTopActivities();

  // Voor elke deelnemerslijst bij paginalaad ophalen en tonen
  document.querySelectorAll(".participants-list").forEach(container => {
    const activityId = container.dataset.activity;
    updateParticipants(activityId);
  });
});
