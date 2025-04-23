const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const cors = require('cors');
app.use(cors()); // 🔓 Tillat forespørsler fra andre domener (som frontend)
const port = 3000;

// 📌 Viktig! Middleware for å håndtere JSON
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Feilsøking: Logg innkommende forespørsler
app.use((req, res, next) => {
    console.log(`Mottatt ${req.method} forespørsel til ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
});

// Åpne databasen
let db = new sqlite3.Database('./helgomega.db', (err) => {
    if (err) {
        console.error('Feil ved tilkobling til databasen:', err.message);
    } else {
        console.log('Tilkoblet til SQLite-database.');
    }
});

app.get('/', (req, res) => {
    res.send('Velkommen til Helgomega API!');
});

app.get('/kjop/biler', (req, res) => {
    const sql = `SELECT * FROM biler`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// POST: Registrer bruker
app.post('/bruker', (req, res) => {
    console.log("Mottatt body:", req.body); // 📌 Feilsøking

    const { brukernavn, passord, email } = req.body;

    if (!brukernavn || !passord || !email) {
        return res.status(400).json({ error: "Alle felt må fylles ut" });
    }

    const sql = `INSERT INTO brukere (brukernavn, passord, email) VALUES (?, ?, ?)`;
    db.run(sql, [brukernavn, passord, email], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

// Start serveren
app.listen(port, () => {
    console.log(`Serveren kjører på http://localhost:${port}`);
});

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const brukernavn = document.getElementById("username").value;
            const passord = document.getElementById("password").value;

            fetch("http://localhost:5500/login.html", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ brukernavn, passord }),
            })
            .then(res => res.json())
            .then(data => {
                const loginError = document.getElementById("loginError");

                if (data.bruker) {
                    // Lagre innlogget bruker i localStorage
                    localStorage.setItem("innloggetBruker", JSON.stringify(data.bruker));
                    // Send bruker til min side
                    window.location.href = "minside.html";
                } else {
                    loginError.textContent = data.error || "Feil brukernavn eller passord";
                }
            })
            .catch(err => {
                console.error("Innloggingsfeil:", err);
                document.getElementById("loginError").textContent = "Innlogging feilet. Prøv igjen senere.";
            });
        });
    }
});
