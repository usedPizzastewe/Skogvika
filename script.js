document.addEventListener("DOMContentLoaded", function() {
    // Logg en velkommen melding når dokumentet er lastet
    console.log("Velkommen til Helgomega!");
});

// Hent biler fra API-et og vis dem
fetch("http://localhost:3000/kjop/biler")
.then(response => {
    // Hvis svaret ikke er OK, kast en feil
    if (!response.ok) {
        throw new Error("Nettverksfeil");
    }
    // Returner JSON-data hvis forespørselen er vellykket
    return response.json();
})
.then(data => {
    // Vis bilene ved å bruke visBiler-funksjonen
    visBiler(data);
})
.catch(error => {
    // Logg feilen hvis det oppstår en feil ved henting av biler
    console.error("Feil under henting av biler:", error);
});

// Funksjon for å vise biler på siden
function visBiler(biler) {
    const container = document.getElementById("bil-container");

    // Sjekk om containeren finnes i HTML
    if (!container) {
        console.warn("Fant ikke bil-container i HTML");
        return;
    }

    // Gå gjennom hver bil og legg dem til i containeren
    biler.forEach(bil => {
        const div = document.createElement("div");
        div.classList.add("bil");
        console.log("Hei");

        // Generer HTML for hver bil
        div.innerHTML = `
            <h3>${bil.modell}</h3>
            <img src=${bil.bilde} alt="${bil.modell}" class="bil-bilde" />
            <p>Pris: ${bil.pris} kr</p>
            <p>Merke: ${bil.merke}</p>
            <p>Årsmodell: ${bil.år}</p>
            <p>Giring: ${bil.gir}</p>
        `;

        // Legg til bilen i containeren
        container.appendChild(div);
    });
}

// Når dokumentet er lastet, vis brukernavn hvis innlogget
document.addEventListener("DOMContentLoaded", function () {
    const brukerDiv = document.getElementById("brukernavn-visning");
    const lagretBruker = localStorage.getItem("innloggetBruker");

    // Sjekk om det er en lagret bruker
    if (brukerDiv) {
        if (lagretBruker) {
            try {
                const bruker = JSON.parse(lagretBruker);
                // Vis brukernavnet til den som er logget inn
                brukerDiv.textContent = `Logget inn som: ${bruker.brukernavn}`;
            } catch (e) {
                // Hvis det oppstår en feil, vis "Ingen konto"
                console.error("Kunne ikke lese bruker fra localStorage");
                brukerDiv.textContent = "Ingen konto";
            }
        } else {
            // Hvis ingen bruker er lagret, vis "Ingen konto"
            brukerDiv.textContent = "Ingen konto";
        }
    }
});

// innlogging via skjema
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        // Hent brukernavn og passord fra skjemaet
        const brukernavn = document.getElementById("username").value;
        const passord = document.getElementById("password").value;

        // Send innloggingsforespørsel til serveren
        fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ brukernavn, passord })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Hvis innlogging funker, lagre brukernavn i localStorage og gå/naviger til hovedsiden
                localStorage.setItem("innloggetBruker", data.brukernavn);
                window.location.href = "index.html"; // Gå til hovedsiden
            } else {
                // Vis feilmelding hvis innlogging feilet
                document.getElementById("loginError").textContent = data.error || "Innlogging feilet";
            }
        })
        .catch(err => {
            // Logg feilen hvis/når det oppstår en feil ved innlogging
            console.error("Innloggingsfeil:", err);
            document.getElementById("loginError").textContent = "En feil oppsto ved innlogging";
        });
    });
}

// Når dokumentet er lastet, vis innlogget bruker og logg ut knapp
document.addEventListener("DOMContentLoaded", function () {
    const visning = document.getElementById("brukernavn-visning");
    const logoutButton = document.getElementById("logoutButton");
    const bruker = localStorage.getItem("innloggetBruker");

    // Sjekk om man er logget inn, og vis brukernavn
    if (visning) {
        visning.textContent = bruker ? `Logget inn som: ${bruker}` : "Ingen konto";
    }

    // Vis logg ut knapp når man er logget inn
    if (logoutButton) {
        logoutButton.style.display = bruker ? "block" : "none";

        // klikk på logg ut knapp
        logoutButton.addEventListener("click", () => {
            localStorage.removeItem("innloggetBruker");
            window.location.href = "login.html";
        });
    }
});

// Hente dine kjøpte biler
function hentKjopteBiler() {
    const lagretBruker = localStorage.getItem("innloggetBruker");
    if (!lagretBruker) {
        console.warn("Ingen bruker er logget inn.");
        return;
    }

    const brukernavn = lagretBruker.replace(/"/g, ""); // Fjerner eventuelle anførselstegn fra brukernavnet (copilots forslag til kommentar)

    // Hent kjøpte biler for den innlogga brukeren
    fetch(`http://localhost:3000/minside/${brukernavn}`)
        .then(response => response.json())
        .then(data => {
            visKjopteBiler(data);
        })
        .catch(error => {
            // Logg feilen hvis det kommer en feil i henting av kjøpte biler
            console.error("Feil ved henting av kjøpte biler:", error);
        });
}

// Vis kjøpte biler på min side
function visKjopteBiler(biler) {
    const container = document.getElementById("solgte-biler");
    if (!container) {
        console.warn("Fant ikke 'solgte-biler' container");
        return;
    }

    container.innerHTML = "";

    if (biler.length === 0) {
        container.innerHTML = "<p>Du har ikke kjøpt noen biler ennå.</p>";
        return;
    }

    // Vis biler som brukeren har kjøpt
    biler.forEach(bil => {
        const div = document.createElement("div");
        div.classList.add("bil");
        div.innerHTML = `
            <h3>${bil.modell}</h3>
            <img src="${bil.bilde}" alt="${bil.modell}" class="bil-bilde" />
            <p>Pris: ${bil.pris} kr</p>
            <p>Merke: ${bil.merke}</p>
            <p>Årsmodell: ${bil.år}</p>
            <p>Giring: ${bil.gir}</p>
        `;
        container.appendChild(div);
    });
}

// Hvis vi er på minside.html, hent kjøpte biler
if (window.location.pathname.includes("minside.html")) {
    hentKjopteBiler();
}

// copilot har gidt meg forslag for resten av setningane imens eg skriver dei, så han hjolpe meg med å gjere det litt meir ryddig og raskere. 
// han kommer typisk midt inni ei setning og foreslår det som eg har tenkt å skrive, så eg kan bare trykke enter for å godta det han foreslår.