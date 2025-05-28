
const API_URL = 'https://therapy-backend-l5u7.onrender.com';

const likeButtons = document.querySelectorAll(".like-button");
const likeDisplays = document.querySelectorAll(".like-display");
const joinButtons = document.querySelectorAll(".join-button");
const nameInputs = document.querySelectorAll(".name-input");
const participantLists = document.querySelectorAll(".participants-list");

likeButtons.forEach((button, index) => {
    button.addEventListener("click", async () => {
        const activityId = button.dataset.activity;
        await fetch(\`\${API_URL}/like/\${activityId}\`, { method: "POST" });
        loadData();
    });
});

joinButtons.forEach((button, index) => {
    button.addEventListener("click", async () => {
        const input = nameInputs[index];
        const name = input.value.trim();
        const activityId = button.dataset.activity;

        if (name) {
            await fetch(\`\${API_URL}/signup/\${activityId}\`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name })
            });
            input.value = "";
            loadData();
        }
    });
});

async function loadData() {
    try {
        const res = await fetch(\`\${API_URL}/data\`);
        const data = await res.json();
        console.log("🔄 Opgehaalde data:", data);

        data.forEach(entry => {
            const { activityId, likes, participants } = entry;

            const likeDisplay = document.querySelector(\`.like-display[data-activity="\${activityId}"]\`);
            if (likeDisplay) likeDisplay.textContent = likes;

            const list = document.querySelector(\`.participants-list[data-activity="\${activityId}"]\`);
            if (list) {
                list.innerHTML = "";

                const names = Array.isArray(participants)
                    ? participants
                    : typeof participants === "string"
                    ? participants.split(",").map(p => p.trim())
                    : [];

                names.forEach(name => {
                    const li = document.createElement("li");
                    li.textContent = name;
                    list.appendChild(li);
                });
            }
        });
    } catch (err) {
        console.error("Fout bij ophalen data:", err);
    }
}

loadData();
