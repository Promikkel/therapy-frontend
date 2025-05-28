document.addEventListener("DOMContentLoaded", function() {
  const API_URL = 'https://therapy-backend-l5u7.onrender.com';

 // Functie om deelnemerslijst bij te werken voor 1 activiteit
  async function updateParticipants(activityId) {
    try {
      // DEBUG: Controleer welke activiteit we opvragen
      console.log(`Bezig met ophalen van deelnemers voor: ${activityId}`);

      const response = await fetch(`${API_URL}/participants/${activityId}`);
      if (!response.ok) {
        throw new Error(`Serverfout (status: ${response.status})`);
      }

      const participants = await response.json();

      // DEBUG: Controleer wat de server precies terugstuurt
      console.log(`Deelnemers ontvangen voor ${activityId}:`, participants);

      const container = document.querySelector(`.participants-list[data-activity="${activityId}"]`);
      if (!container) {
        console.error(`Kon de container .participants-list niet vinden voor ${activityId}`);
        return;
      }

      // Maak de lijst ALTIJD eerst leeg
      container.innerHTML = "";

      // Vul de lijst met de ontvangen data
      if (Array.isArray(participants) && participants.length > 0) {
        participants.forEach(p => {
          const div = document.createElement("div");
          // De server moet een object sturen met een 'name' property, bv: { name: 'Jan' }
          div.textContent = p.name;
          container.appendChild(div);
        });
      }
    } catch (error) {
      console.error(`Fout bij laden van deelnemers voor ${activityId}:`, error);
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
      
      try {
        // Stuur de nieuwe deelnemer naar de server
        const res = await fetch(`${API_URL}/join/${activityId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });

        if (!res.ok) {
           throw new Error("Server kon de naam niet opslaan.");
        }
        
        // Maak inputveld leeg en geef een seintje
        nameInput.value = "";
        alert("Je bent toegevoegd!");

        // Roep de verbeterde updateParticipants aan.
        // Deze haalt de HELE lijst (inclusief jouw nieuwe naam) opnieuw op 
        // van de server en toont deze correct.
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

  // Init: deelnemerslijst per activiteit ophalen
  document.querySelectorAll(".participants-list").forEach(container => {
    const activityId = container.dataset.activity;
    updateParticipants(activityId);
  });

  updateTopActivities();
});
