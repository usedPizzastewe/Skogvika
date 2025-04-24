document.addEventListener("DOMContentLoaded", function() {
    
    console.log("Velkommen til Helgomega!");
});
// Hent biler fra API-et og vis dem
fetch("http://localhost:3000/kjop/biler")
.then(response => {
    if (!response.ok) {
        throw new Error("Nettverksfeil");
    }
    return response.json();
})
.then(data => {
    visBiler(data);
})
.catch(error => {
    console.error("Feil under henting av biler:", error);
});


function visBiler(biler) {
const container = document.getElementById("bil-container");

if (!container) {
console.warn("Fant ikke bil-container i HTML");
return;
}

biler.forEach(bil => {
const div = document.createElement("div");
div.classList.add("bil");
console.log("Hei");

div.innerHTML = `
    <h3>${bil.modell}</h3>
    <img src=${bil.bilde} alt="${bil.modell}" class="bil-bilde" />
    <p>Pris: ${bil.pris} kr</p>
    <p>Merke: ${bil.merke}</p>
    <p>Årsmodell: ${bil.år}</p>
    <p>Giring: ${bil.gir}</p>
`;

container.appendChild(div);
});
}

document.addEventListener("DOMContentLoaded", function () {
    const brukerDiv = document.getElementById("brukernavn-visning");
    const lagretBruker = localStorage.getItem("innloggetBruker");

    if (brukerDiv) {
        if (lagretBruker) {
            try {
                const bruker = JSON.parse(lagretBruker);
                brukerDiv.textContent = `Logget inn som: ${bruker.brukernavn}`;
            } catch (e) {
                console.error("Kunne ikke lese bruker fra localStorage");
                brukerDiv.textContent = "Ingen konto";
            }
        } else {
            brukerDiv.textContent = "Ingen konto";
        }
    }
});

const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const brukernavn = document.getElementById("username").value;
        const passord = document.getElementById("password").value;

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
                localStorage.setItem("innloggetBruker", data.brukernavn);
                window.location.href = "index.html"; // Gå til hovedsiden
            } else {
                document.getElementById("loginError").textContent = data.error || "Innlogging feilet";
            }
        })
        .catch(err => {
            console.error("Innloggingsfeil:", err);
            document.getElementById("loginError").textContent = "En feil oppsto ved innlogging";
        });
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const visning = document.getElementById("brukernavn-visning");
    const logoutButton = document.getElementById("logoutButton");
    const bruker = localStorage.getItem("innloggetBruker");

    if (visning) {
        visning.textContent = bruker ? `Logget inn som: ${bruker}` : "Ingen konto";
    }

    if (logoutButton) {
        logoutButton.style.display = bruker ? "block" : "none";

        logoutButton.addEventListener("click", () => {
            localStorage.removeItem("innloggetBruker");
            window.location.href = "login.html";
        });
    }
});

