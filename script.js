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