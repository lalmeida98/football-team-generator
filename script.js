const playerForm = document.getElementById("playerForm");
const playerNameInput = document.getElementById("playerName");
const playerRatingInput = document.getElementById("playerRating");
const playerList = document.getElementById("playerList");

let players = [];
let selectedMatchType = "5v5"; // Default match type

// Load players from localStorage
function loadPlayers() {
  const storedPlayers = localStorage.getItem("players");
  if (storedPlayers) {
    players = JSON.parse(storedPlayers);
    renderPlayers();
  }
}

document.getElementById("clearPlayers").addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all players?")) {
    players = [];
    savePlayers();
    renderPlayers();
    document.getElementById("teamResult").innerHTML = "";
  }
});

// Save players to localStorage
function savePlayers() {
  localStorage.setItem("players", JSON.stringify(players));
}

// Show player list on the page
function renderPlayers() {
  playerList.innerHTML = "";
  
  const filter = document.getElementById("filterSelect").value;
  const filteredPlayers = filter === "available"
  ? players.filter(p => p.available)
  : players;
  
	// Count values
	const totalCount = players.length;
	const availableCount = players.filter(p => p.available).length;

	// Update counter display
	document.getElementById("totalCount").textContent = totalCount;
	document.getElementById("availableCount").textContent = availableCount;

  filteredPlayers.forEach((player, index) => {
    const li = document.createElement("li");

    // Container for display mode
    const displayDiv = document.createElement("div");
    displayDiv.style.display = "flex";
    displayDiv.style.alignItems = "center";
    displayDiv.style.gap = "10px";

    // Container for edit mode (hidden by default)
    const editDiv = document.createElement("div");
    editDiv.style.display = "none";
    editDiv.style.alignItems = "center";
    editDiv.style.gap = "10px";

    // Display mode elements
    const nameSpan = document.createElement("span");
	nameSpan.className = "player-info";
    nameSpan.textContent = player.name;

    const ratingSpan = document.createElement("span");
	ratingSpan.className = "player-info";
	ratingSpan.textContent = `Rating: ${player.rating.toFixed(1)}`

    const availableSpan = document.createElement("span");
	availableSpan.className = "player-info";
	//availableSpan.textContent = player.available ? "Available" : "Not Available";
	availableSpan.textContent = player.available ? "Joga ✔️" : "Não joga ❌";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "❌";
    removeBtn.onclick = () => {
		const confirmDelete = confirm(`Are you sure you want to remove ${player.name} from the squad?`);
		if (confirmDelete) {
			players.splice(index, 1);
			savePlayers();
			renderPlayers();
		}
};

    displayDiv.appendChild(nameSpan);
    displayDiv.appendChild(ratingSpan);
    displayDiv.appendChild(availableSpan);
    displayDiv.appendChild(editBtn);
    displayDiv.appendChild(removeBtn);

    // Edit mode elements
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = player.name;
    nameInput.style.width = "100px";

    const ratingInput = document.createElement("input");
    ratingInput.type = "number";
    ratingInput.min = 1;
    ratingInput.max = 10;
	ratingInput.step = 0.5;
    ratingInput.value = player.rating;
    ratingInput.style.width = "50px";

    const availableCheckbox = document.createElement("input");
    availableCheckbox.type = "checkbox";
    availableCheckbox.checked = player.available;
    availableCheckbox.title = "Available";

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";

    editDiv.appendChild(nameInput);
    editDiv.appendChild(ratingInput);
    editDiv.appendChild(availableCheckbox);
    editDiv.appendChild(saveBtn);
    editDiv.appendChild(cancelBtn);

    // Edit button behavior
    editBtn.onclick = () => {
      displayDiv.style.display = "none";
      editDiv.style.display = "flex";
    };

    // Cancel button behavior
    cancelBtn.onclick = () => {
      editDiv.style.display = "none";
      displayDiv.style.display = "flex";
      // Reset inputs to original values
      nameInput.value = player.name;
      ratingInput.value = player.rating;
      availableCheckbox.checked = player.available;
    };

    // Save button behavior
    saveBtn.onclick = () => {
      const newName = nameInput.value.trim();
      const newRating = parseFloat(ratingInput.value);
      if (!newName) {
        alert("Name cannot be empty.");
        return;
      }
      if (!(newRating >= 1 && newRating <= 10)) {
        alert("Rating must be between 1 and 10.");
        return;
      }
      player.name = newName;
      player.rating = newRating;
      player.available = availableCheckbox.checked;
      savePlayers();
      renderPlayers();
    };

    li.appendChild(displayDiv);
    li.appendChild(editDiv);
    playerList.appendChild(li);
  });
}


// Handle form submission
playerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = playerNameInput.value.trim();
  const rating = parseInt(playerRatingInput.value);
  
  // Check for duplicate names (case-insensitive)
  const isDuplicate = players.some(p => p.name.toLowerCase() === name.toLowerCase());
  if (isDuplicate) {
    alert("A player with this name already exists.");
    return;
  }

  if (name && rating >= 1 && rating <= 10) {
    const available = document.getElementById("playerAvailable").checked;
	players.push({ name, rating, available });
    savePlayers();
    renderPlayers();
    playerForm.reset();
  }
});

// Initial load
loadPlayers();

// Dark Mode
const toggleDarkModeButton = document.getElementById("toggleDarkMode");

function setDarkMode(enabled) {
  document.body.classList.toggle("dark", enabled);
  localStorage.setItem("darkMode", enabled ? "true" : "false");
}

toggleDarkModeButton.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", isDark ? "true" : "false");
});

// Load dark mode setting on page load
const savedDarkMode = localStorage.getItem("darkMode") === "true";
setDarkMode(savedDarkMode);

// Handle match type buttons
document.querySelectorAll(".matchTypeBtn").forEach(button => {
  button.addEventListener("click", () => {
    selectedMatchType = button.dataset.mode;

	// Remove 'selected' class from all buttons
    document.querySelectorAll(".matchTypeBtn").forEach(btn => {
      btn.classList.remove("selected");
    });

    // Add it to the clicked one
    button.classList.add("selected");
	
  });
});

const makeTeamsButton = document.getElementById("makeTeams");


makeTeamsButton.addEventListener("click", () => {
  const availablePlayers = players.filter(p => p.available);
  
  let requiredPlayers = 10;
  if (selectedMatchType === "6v6") requiredPlayers = 12;
  else if (selectedMatchType === "5v5v5") requiredPlayers = 15;

  if (availablePlayers.length < requiredPlayers) {
    alert(`Not enough players! You need ${requiredPlayers} available players to play a ${selectedMatchType} but you only have ${availablePlayers.length}.`);
    return;
  }
  else if(availablePlayers.length > requiredPlayers) {
	  alert(`You have too many players. To play a ${selectedMatchType} you need exactly ${requiredPlayers} available players, and right now you have ${availablePlayers.length}.`);
    return;
  }

  let teams;
  if (selectedMatchType === "5v5v5") {
    teams = getBalancedThreeTeams(availablePlayers.slice(0, 15));
  } else {
    teams = getBalancedTeams(availablePlayers.slice(0, requiredPlayers));
  }

  const avg = (team) => (
    (team.reduce((sum, p) => sum + p.rating, 0) / team.length).toFixed(2)
  );

  const teamResultDiv = document.getElementById("teamResult");

  if (selectedMatchType === "5v5v5") {
    teamResultDiv.innerHTML = `
      <div>
        <h3>Team A (Avg score: ${avg(teams.teamA)})</h3>
        <ul>${teams.teamA.map(p => `<li>${p.name} (${p.rating})</li>`).join("")}</ul>
      </div>
      <div>
        <h3>Team B (Avg score: ${avg(teams.teamB)})</h3>
        <ul>${teams.teamB.map(p => `<li>${p.name} (${p.rating})</li>`).join("")}</ul>
      </div>
      <div>
        <h3>Team C (Avg score: ${avg(teams.teamC)})</h3>
        <ul>${teams.teamC.map(p => `<li>${p.name} (${p.rating})</li>`).join("")}</ul>
      </div>
    `;
  } else {
    teamResultDiv.innerHTML = `
      <div>
        <h3>Team A (Avg score: ${avg(teams.teamA)})</h3>
        <ul>${teams.teamA.map(p => `<li>${p.name} (${p.rating})</li>`).join("")}</ul>
      </div>
      <div>
        <h3>Team B (Avg score: ${avg(teams.teamB)})</h3>
        <ul>${teams.teamB.map(p => `<li>${p.name} (${p.rating})</li>`).join("")}</ul>
      </div>
    `;
  }
});

// Core logic: Find the most balanced team split
function getBalancedTeams(playerList) {
	const maxAttempts = 1000;
	let bestCombo = null;
	let minDiff = Infinity;
    let requiredPlayers = 10;
	if (selectedMatchType === "6v6") requiredPlayers = 12;

	for (let i = 0; i < maxAttempts; i++) {
		const shuffled = [...playerList].sort(() => Math.random() - 0.5);
		const teamA = shuffled.slice(0, requiredPlayers/2);
		const teamB = shuffled.slice(requiredPlayers/2, requiredPlayers);

		const sumA = teamA.reduce((sum, p) => sum + p.rating, 0);
		const sumB = teamB.reduce((sum, p) => sum + p.rating, 0);
		const diff = Math.abs(sumA - sumB);

		if (diff < minDiff) {
		  minDiff = diff;
		  bestCombo = { teamA, teamB };
		}

		// If it's "good enough", stop early
		if (diff <= 1) break;
  }

  return bestCombo;
}

function getBalancedThreeTeams(playerList) {
  const maxAttempts = 1000;
  let bestCombo = null;
  let minDiff = Infinity;

  for (let i = 0; i < maxAttempts; i++) {
    const shuffled = [...playerList].sort(() => Math.random() - 0.5);
    const teamA = shuffled.slice(0, 5);
    const teamB = shuffled.slice(5, 10);
    const teamC = shuffled.slice(10, 15);

    const avg = (team) => team.reduce((sum, p) => sum + p.rating, 0) / team.length;
    const avgA = avg(teamA);
    const avgB = avg(teamB);
    const avgC = avg(teamC);

    const maxAvg = Math.max(avgA, avgB, avgC);
    const minAvg = Math.min(avgA, avgB, avgC);
    const diff = maxAvg - minAvg;

    if (diff < minDiff) {
      minDiff = diff;
      bestCombo = { teamA, teamB, teamC };
    }

    if (diff <= 1) break;
  }

  return bestCombo;
}

//refresh list of players (?)
document.getElementById("filterSelect").addEventListener("change", renderPlayers);
