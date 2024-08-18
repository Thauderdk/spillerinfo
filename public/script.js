document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search');
    const playerList = document.getElementById('player-list');
    let playersData = []; // To store player data globally
    let openCard = null; // Track currently open card

    // Fetch and display players
    fetchPlayers();

    // Event listener for search input
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        filterPlayers(searchTerm);
    });

    // Fetch players from API
    async function fetchPlayers() {
        try {
            const response = await fetch('/api/players');
            if (!response.ok) throw new Error('Network response was not ok');
            playersData = await response.json();
            displayPlayers(playersData);
        } catch (error) {
            console.error('Error fetching players:', error);
            playerList.innerHTML = '<p>Error fetching player data. Please try again later.</p>';
        }
    }

    // Display players in the DOM
    function displayPlayers(players) {
        playerList.innerHTML = ''; // Clear existing content
        if (players.length === 0) {
            playerList.innerHTML = '<p>No players found.</p>';
            return;
        }

        players.forEach(player => {
            const playerCard = createPlayerCard(player);
            playerList.appendChild(playerCard);
        });
    }

    // Create player card element
    function createPlayerCard(player) {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-card';

        playerCard.innerHTML = `
            <h2>${player.name}</h2>
            <p>ID: ${player.id}</p>
        `;

        playerCard.addEventListener('click', () => toggleDetails(playerCard, player));

        return playerCard;
    }

    // Toggle player details visibility
    async function toggleDetails(card, player) {
        if (openCard && openCard !== card) {
            openCard.querySelector('.player-details').style.display = 'none';
        }

        let details = card.querySelector('.player-details');
        if (!details) {
            details = document.createElement('div');
            details.className = 'player-details';

            details.innerHTML = await generateDetailsHTML(player); // Fetch details asynchronously
            card.appendChild(details);
        }

        details.style.display = details.style.display === 'none' || details.style.display === '' ? 'block' : 'none';
        openCard = details.style.display === 'block' ? card : null;
    }

    // Generate HTML for player details
    async function generateDetailsHTML(player) {
        const steamName = player.identifiers.find(id => id.startsWith('steam:')) ? await fetchSteamName(getDetail(player.identifiers, 'steam')) : 'N/A';

        return `
            ${getDetailHTML(player.identifiers, 'discord', 'Discord')}
            ${getDetailHTML(player.identifiers, 'license', 'License')}
            ${steamName !== 'N/A' ? `<div class="detail-box"><p><strong>Steam:</strong> ${steamName}</p></div>` : ''}
            ${getDetailHTML(player.identifiers, 'fivem', 'FiveM')}
            ${getDetailHTML(player.identifiers, 'xbox', 'Xbox')}
            ${getDetailHTML(player.identifiers, 'hwid', 'HWID')}
            ${player.ping ? `<div class="detail-box"><p><strong>Ping:</strong> ${player.ping} ms</p></div>` : ''}
        `;
    }

    // Fetch Steam name using Steam ID
    async function fetchSteamName(steamID) {
        const apiKey = 'YOUR_STEAM_API_KEY'; // Replace with your Steam API key
        const steamID64 = convertToSteamID64(steamID); // Convert Steam ID to Steam ID64
        try {
            const response = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamID64}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            return data.response.players[0]?.personaname || 'N/A';
        } catch (error) {
            console.error('Error fetching Steam name:', error);
            return 'N/A';
        }
    }

    // Convert Steam ID to Steam ID64
    function convertToSteamID64(steamID) {
        // Replace with actual conversion logic if needed
        return steamID; // Assuming steamID is already in Steam ID64 format
    }

    // Helper function to get identifier detail
    function getDetail(identifiers, type) {
        const identifier = identifiers.find(id => id.startsWith(`${type}:`));
        return identifier ? identifier.split(':')[1] : 'N/A';
    }

    // Helper function to create detail HTML
    function getDetailHTML(identifiers, type, label) {
        const detail = getDetail(identifiers, type);
        if (detail !== 'N/A') {
            return `<div class="detail-box"><p><strong>${label}:</strong> <a href="${getLink(type, detail)}" target="_blank" rel="noopener noreferrer">${detail}</a></p></div>`;
        }
        return '';
    }

    // Helper function to get link based on type
    function getLink(type, detail) {
        switch (type) {
            case 'discord':
                return `https://discordlookup.com/user/${detail}`;
            case 'steam':
                return `https://steamid.io/lookup/${detail}`;
            // Add other cases if needed
            default:
                return '#';
        }
    }

    // Filter players based on search term
    function filterPlayers(searchTerm) {
        const filteredPlayers = playersData.filter(player =>
            player.name.toLowerCase().includes(searchTerm) || player.id.toString().includes(searchTerm)
        );
        displayPlayers(filteredPlayers);
    }
});
