const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;


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
app.post('/bruker', async (req, res) => {
    const { brukernavn, passord, email } = req.body;

    if (!brukernavn || !passord || !email) {
        return res.status(400).json({ error: "Alle felt må fylles ut" });
    }

    try {
        const hashedPassword = await bcrypt.hash(passord, saltRounds);
        const sql = `INSERT INTO brukere (brukernavn, passord, email) VALUES (?, ?, ?)`;
        db.run(sql, [brukernavn, hashedPassword, email], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ id: this.lastID });
        });
    } catch (error) {
        res.status(500).json({ error: "Noe gikk galt med kryptering" });
    }
});

// Start serveren
app.listen(port, () => {
    console.log(`Serveren kjører på http://localhost:${port}`);
});

// POST: Logg inn bruker
app.post('/login', (req, res) => {
    const { brukernavn, passord } = req.body;

    if (!brukernavn || !passord) {
        return res.status(400).json({ error: "Brukernavn og passord må fylles ut" });
    }

    const sql = `SELECT * FROM brukere WHERE brukernavn = ?`;
    db.get(sql, [brukernavn], async (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!row) {
            return res.status(401).json({ error: "Hei1, Feil brukernavn eller passord" });
        }

        try {
            const match = await bcrypt.compare(passord, row.passord);
            if (match) {
                res.json({ success: true, brukernavn: row.brukernavn });
            } else {
                res.status(401).json({ error: "Hei2, Feil brukernavn eller passord" });
            }
        } catch (error) {
            res.status(500).json({ error: "Noe gikk galt ved sjekking av passord" });
        }
    });
});
