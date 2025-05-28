document.addEventListener("DOMContentLoaded", function() {
  const API_URL = 'https://therapy-backend-l5u7.onrender.com';

  // Functie om deelnemerslijst bij te werken voor 1 activiteit
  async function updateParticipants(activityId) {
    try {
      const response = await fetch(`${API_URL}/participants/${activityId}`);
      if (!response.ok) throw new Error("Kon deelnemers niet ophalen");
      const participants = await response.json();
      const container = document.querySelector(`.participants-list[data-activity="${activityId}"]`);
      if (!container) return;
      container.innerHTML = "";
      participants.forEach(p => {
        const div = document.createElement("div");
        div.textContent = p.name;
        container.appendChild(div);
      });
    } catch (error) {
      console.error("Fout bij laden deelnemers:", error);
    }
  }

  // Likes click handler
  document.querySelectorAll(".like-button").forEach((button) => {
    button.addEventListener("click", async () => {
      const activityId = button.dataset.activity;
      try {
        const res = await fetch(`${API_URL}/like/${activityId}`, { method: "POST" });
        if (!res.ok) throw new Error("Like kon niet worden verwerkt");
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

      // VIND DE JUISTE LIJST OP DE PAGINA
      const container = document.querySelector(`.participants-list[data-activity="${activityId}"]`);

      // MAAK ALVAST HET NIEUWE NAAM-ELEMENT AAN
      const participantDiv = document.createElement("div");
      participantDiv.textContent = name;
      
      // VOEG DE NAAM DIRECT ZICHTBAAR TOE AAN DE LIJST
      if (container) {
        container.appendChild(participantDiv);
      }
      
      // Maak het inputveld leeg
      nameInput.value = "";

      try {
        // Stuur de data nog steeds naar de server op de achtergrond
        const res = await fetch(`${API_URL}/join/${activityId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });

        if (!res.ok) {
           // Als de server een fout geeft, halen we de naam die we net toevoegden weer weg.
           console.error("Server kon de naam niet opslaan.");
           if (container) {
             container.removeChild(participantDiv); // Haal de naam weer weg bij een fout
           }
           throw new Error("Kon deelnemer niet aan server toevoegen");
        }
        
        // De naam is nu ook op de server opgeslagen.
        // We hoeven de lijst niet per se opnieuw op te halen, want we hebben de naam al toegevoegd.
        // await updateParticipants(activityId); // Deze regel kan eventueel uit.

      } catch (error) {
        alert("Fout bij synchroniseren met server: " + error.message);
      }
    });
  });

  // Dag schakelen
  document.querySelectorAll(".day-button").forEach(button => {
    button.addEventListener("click", () => {
      const selectedDay = button.dataset.day;
      // Buttons actief zetten
      document.querySelectorAll(".day-button").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.day === selectedDay);
      });
      // Secties tonen/verbergen
      document.querySelectorAll(".day-section").forEach(section => {
        section.classList.toggle("active", section.id === selectedDay);
      });
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

  // Init: deelnemerslijst per activiteit ophalen
  document.querySelectorAll(".participants-list").forEach(container => {
    const activityId = container.dataset.activity;
    updateParticipants(activityId);
  });

  updateTopActivities();
});
