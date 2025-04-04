const sqlite3 = require('sqlite3').verbose();

// Åpne en SQLite database (den blir opprettet hvis den ikke finnes)
let db = new sqlite3.Database('./helgomega.db');

// Opprette tabellene
db.serialize(() => {
    // Opprette tabell for biler
    db.run(`CREATE TABLE IF NOT EXISTS biler (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        merke TEXT NOT NULL,
        modell TEXT NOT NULL,
        år INTEGER NOT NULL,
        pris INTEGER NOT NULL
    )`);

    // Opprette tabell for båter
    db.run(`CREATE TABLE IF NOT EXISTS bater (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        merke TEXT NOT NULL,
        modell TEXT NOT NULL,
        lengde INTEGER NOT NULL,
        motor TEXT NOT NULL,
        pris INTEGER NOT NULL
    )`);

    // Opprette tabell for PC-er
    db.run(`CREATE TABLE IF NOT EXISTS pcer (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        merke TEXT NOT NULL,
        modell TEXT NOT NULL,
        prosessor TEXT NOT NULL,
        ram INTEGER NOT NULL,
        lagring INTEGER NOT NULL,
        pris INTEGER NOT NULL
    )`);

    // Opprette tabell for brukere
    db.run(`CREATE TABLE IF NOT EXISTS brukere (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        brukernavn TEXT NOT NULL UNIQUE,
        passord TEXT NOT NULL,
        email TEXT NOT NULL
    )`);

    // Opprette tabell for kjøp
    db.run(`CREATE TABLE IF NOT EXISTS kjop (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bruker_id INTEGER NOT NULL,
        produkt_type TEXT NOT NULL CHECK (produkt_type IN ('bil', 'båt', 'pc')),
        produkt_id INTEGER NOT NULL,
        dato TEXT NOT NULL,
        FOREIGN KEY (bruker_id) REFERENCES brukere(id),
        FOREIGN KEY (produkt_id) REFERENCES biler(id) ON DELETE CASCADE,
        FOREIGN KEY (produkt_id) REFERENCES bater(id) ON DELETE CASCADE,
        FOREIGN KEY (produkt_id) REFERENCES pcer(id) ON DELETE CASCADE
    )`);
});

// Lukker databasen
db.close((err) => {
    if (err) {
        console.error("Feil ved lukking av database:", err);
    } else {
        console.log("Databaseoppsett er fullført.");
    }
});
