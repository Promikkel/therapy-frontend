
document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM geladen, script start");

    const dayButtons = document.querySelectorAll('.day-button');
    const daySections = document.querySelectorAll('.day-section');
    const likeButtons = document.querySelectorAll('.like-button');
    const nameInputs = document.querySelectorAll('.name-input');
    const joinButtons = document.querySelectorAll('.join-button');
    const participantLists = document.querySelectorAll('.participants-list');

    // API endpoint
    const API_URL = 'https://your-backend-service.onrender.com';

    // Wisselen tussen dagen
    dayButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedDay = button.dataset.day;
            daySections.forEach(section => {
                section.style.display = section.dataset.day === selectedDay ? 'block' : 'none';
            });
        });
    });

    // Likes
    likeButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const activityId = button.dataset.activity;
            try {
                await fetch(`${API_URL}/like/${activityId}`, { method: 'POST' });
                loadData();
            } catch (err) {
                console.error('Fout bij liken:', err);
            }
        });
    });

    // Deelnemers
    joinButtons.forEach((button, index) => {
        button.addEventListener('click', async () => {
            const input = nameInputs[index];
            const name = input.value.trim();
            const activityId = button.dataset.activity;
            if (name) {
                try {
                    await fetch(`${API_URL}/signup/${activityId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name })
                    });
                    input.value = '';
                    loadData();
                } catch (err) {
                    console.error('Fout bij aanmelden:', err);
                }
            }
        });
    });

    // Data laden bij opstart
    async function loadData() {
        try {
            const res = await fetch(`${API_URL}/data`);
            const data = await res.json();
            data.forEach(entry => {
                const { activityId, likes, participants } = entry;

                const likeDisplay = document.querySelector(`.like-display[data-activity="${activityId}"]`);
                if (likeDisplay) likeDisplay.textContent = likes;

                const list = document.querySelector(`.participants-list[data-activity="${activityId}"]`);
                if (list) {
                    list.innerHTML = '';
                    participants.forEach(name => {
                        const li = document.createElement('li');
                        li.textContent = name;
                        list.appendChild(li);
                    });
                }
            });
        } catch (err) {
            console.error('Fout bij ophalen data:', err);
        }
    }

    loadData();
});
