const express = require('express'); // Lager server
const sqlite3 = require('sqlite3').verbose(); // Database
const bodyParser = require('body-parser'); // Leser data
const bcrypt = require('bcrypt'); // For kryptering
const saltRounds = 10; // Krypteringsnivå

const app = express(); // Starter appen
const cors = require('cors');
app.use(cors()); // Tillat frontend
const port = 3000; // Port

app.use(express.json()); // Bruk JSON
app.use(express.urlencoded({ extended: true })); // Bruk skjema

// Skriv ut alt som skjer
app.use((req, res, next) => {
    console.log(`Mottatt ${req.method} forespørsel til ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
});

// Koble til Skogvika-databasen
let db = new sqlite3.Database('./Skogvika.db', (err) => {
    if (err) {
        console.error('Feil ved tilkobling til databasen:', err.message);
    } else {
        console.log('Tilkoblet til Skogvika.db database.');
        
        // Opprett brukertabell hvis den ikke eksisterer
        db.run(`CREATE TABLE IF NOT EXISTS brukere (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brukernavn TEXT UNIQUE NOT NULL,
            passord TEXT NOT NULL,
            rolle TEXT NOT NULL CHECK (rolle IN ('elev', 'ansatt')),
            opprettet DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Feil ved opprettelse av brukertabell:', err.message);
            } else {
                console.log('Brukertabell er klar.');
            }
        });

        // Opprett søknadstabell
        db.run(`CREATE TABLE IF NOT EXISTS soknader (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            firstName TEXT NOT NULL,
            lastName TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            birthDate TEXT,
            address TEXT,
            postalCode TEXT,
            city TEXT,
            program TEXT NOT NULL,
            motivation TEXT NOT NULL,
            interests TEXT,
            futureGoals TEXT,
            referenceName TEXT,
            referencePhone TEXT,
            referenceEmail TEXT,
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
            comment TEXT,
            submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            processedAt DATETIME,
            processedBy TEXT
        )`, (err) => {
            if (err) {
                console.error('Feil ved opprettelse av søknadstabell:', err.message);
            } else {
                console.log('Søknadstabell er klar.');
                // Legg til testbrukere
                opprettTestbrukere();
            }
        });
    }
});

// Funksjon for å opprette testbrukere
async function opprettTestbrukere() {
    const testBrukere = [
        { brukernavn: 'test', passord: 'test', rolle: 'elev' },
        { brukernavn: 'ole.nordmann', passord: 'passord123', rolle: 'elev' },
        { brukernavn: 'kari.hansen', passord: 'elev2024', rolle: 'elev' },
        { brukernavn: 'admin', passord: 'admin', rolle: 'ansatt' },
        { brukernavn: 'lars.larsen', passord: 'sikker123', rolle: 'ansatt' },
        { brukernavn: 'anne.berg', passord: 'lærer2024', rolle: 'ansatt' }
    ];

    for (const bruker of testBrukere) {
        try {
            const hashedPassword = await bcrypt.hash(bruker.passord, saltRounds);
            
            db.run(`INSERT OR IGNORE INTO brukere (brukernavn, passord, rolle) VALUES (?, ?, ?)`,
                [bruker.brukernavn, hashedPassword, bruker.rolle],
                function(err) {
                    if (err) {
                        console.log(`Bruker ${bruker.brukernavn} eksisterer allerede eller feil:`, err.message);
                    } else if (this.changes > 0) {
                        console.log(`Opprettet testbruker: ${bruker.brukernavn} (${bruker.rolle})`);
                    }
                }
            );
        } catch (error) {
            console.error(`Feil ved kryptering for ${bruker.brukernavn}:`, error);
        }
    }
}

// Hovedside
app.get('/', (req, res) => {
    res.send('Velkommen til Skogvika VGS API!');
});

// Innlogging endpoint
app.post('/login', (req, res) => {
    const { brukernavn, passord, rolle } = req.body;

    if (!brukernavn || !passord || !rolle) {
        return res.status(400).json({ 
            success: false, 
            error: "Brukernavn, passord og rolle må fylles ut" 
        });
    }

    // Sjekk at rolle er gyldig
    if (rolle !== 'elev' && rolle !== 'ansatt') {
        return res.status(400).json({ 
            success: false, 
            error: "Ugyldig rolle" 
        });
    }

    console.log(`Innloggingsforsøk: ${brukernavn} som ${rolle}`);

    // Hent bruker fra database med riktig rolle
    const sql = `SELECT * FROM brukere WHERE brukernavn = ? AND rolle = ?`;
    db.get(sql, [brukernavn, rolle], async (err, row) => {
        if (err) {
            console.error('Database feil:', err.message);
            return res.status(500).json({ 
                success: false, 
                error: "Noe gikk galt på serveren" 
            });
        }

        if (!row) {
            console.log(`Fant ikke bruker: ${brukernavn} med rolle ${rolle}`);
            return res.status(401).json({ 
                success: false, 
                error: "Feil brukernavn, passord eller rolle" 
            });
        }

        try {
            const match = await bcrypt.compare(passord, row.passord);
            if (match) {
                console.log(`Vellykket innlogging: ${brukernavn} som ${rolle}`);
                res.json({ 
                    success: true, 
                    brukernavn: row.brukernavn,
                    rolle: row.rolle,
                    melding: `Velkommen, ${row.brukernavn}!`
                });
            } else {
                console.log(`Feil passord for: ${brukernavn}`);
                res.status(401).json({ 
                    success: false, 
                    error: "Feil brukernavn, passord eller rolle" 
                });
            }
        } catch (error) {
            console.error('Feil ved passordsjekking:', error);
            res.status(500).json({ 
                success: false, 
                error: "Noe gikk galt ved autentisering" 
            });
        }
    });
});

// Legg til ny bruker (registrering)
app.post('/registrer', async (req, res) => {
    const { brukernavn, passord, rolle } = req.body;

    if (!brukernavn || !passord || !rolle) {
        return res.status(400).json({ 
            success: false, 
            error: "Alle felt må fylles ut" 
        });
    }

    if (rolle !== 'elev' && rolle !== 'ansatt') {
        return res.status(400).json({ 
            success: false, 
            error: "Rolle må være 'elev' eller 'ansatt'" 
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(passord, saltRounds);
        const sql = `INSERT INTO brukere (brukernavn, passord, rolle) VALUES (?, ?, ?)`;
        
        db.run(sql, [brukernavn, hashedPassword, rolle], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(409).json({ 
                        success: false, 
                        error: "Brukernavnet er allerede i bruk" 
                    });
                }
                console.error('Database feil ved registrering:', err.message);
                return res.status(500).json({ 
                    success: false, 
                    error: "Kunne ikke opprette bruker" 
                });
            }
            
            console.log(`Ny bruker registrert: ${brukernavn} som ${rolle}`);
            res.json({ 
                success: true, 
                id: this.lastID,
                melding: "Bruker opprettet successfully!"
            });
        });
    } catch (error) {
        console.error('Feil ved kryptering:', error);
        res.status(500).json({ 
            success: false, 
            error: "Noe gikk galt med kryptering" 
        });
    }
});

// Hent alle brukere (kun for testing/admin)
app.get('/brukere', (req, res) => {
    const sql = `SELECT id, brukernavn, rolle, opprettet FROM brukere ORDER BY rolle, brukernavn`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Feil ved henting av brukere:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Hent brukere etter rolle
app.get('/brukere/:rolle', (req, res) => {
    const rolle = req.params.rolle;
    
    if (rolle !== 'elev' && rolle !== 'ansatt') {
        return res.status(400).json({ error: "Rolle må være 'elev' eller 'ansatt'" });
    }

    const sql = `SELECT id, brukernavn, rolle, opprettet FROM brukere WHERE rolle = ? ORDER BY brukernavn`;
    db.all(sql, [rolle], (err, rows) => {
        if (err) {
            console.error('Feil ved henting av brukere:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Slett bruker (kun for testing)
app.delete('/bruker/:id', (req, res) => {
    const id = req.params.id;
    const sql = `DELETE FROM brukere WHERE id = ?`;
    
    db.run(sql, [id], function(err) {
        if (err) {
            console.error('Feil ved sletting:', err.message);
            return res.status(500).json({ error: err.message });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: "Bruker ikke funnet" });
        }
        
        res.json({ melding: "Bruker slettet", slettet: this.changes });
    });
});

// Søknad endpoints

// Send inn søknad
app.post('/soknad', (req, res) => {
    console.log('Mottatt søknad:', req.body);
    
    const {
        firstName, lastName, email, phone, birthDate, address, postalCode, city,
        program, motivation, interests, futureGoals, referenceName, referencePhone, referenceEmail
    } = req.body;

    if (!firstName || !lastName || !email || !phone || !program || !motivation) {
        console.log('Manglende påkrevde felt');
        return res.status(400).json({
            success: false,
            error: "Påkrevde felt mangler (navn, e-post, telefon, program, motivasjon)"
        });
    }

    const sql = `INSERT INTO soknader (
        firstName, lastName, email, phone, birthDate, address, postalCode, city,
        program, motivation, interests, futureGoals, referenceName, referencePhone, referenceEmail
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
        firstName, lastName, email, phone, birthDate, address, postalCode, city,
        program, motivation, interests, futureGoals, referenceName, referencePhone, referenceEmail
    ];

    db.run(sql, values, function(err) {
        if (err) {
            console.error('Feil ved lagring av søknad:', err.message);
            return res.status(500).json({
                success: false,
                error: "Kunne ikke lagre søknad: " + err.message
            });
        }

        const referenceNumber = `SKV-${new Date().getFullYear()}-${String(this.lastID).padStart(4, '0')}`;
        
        console.log(`✅ Ny søknad lagret: ${firstName} ${lastName} - ${program} (ID: ${this.lastID})`);
        
        res.json({
            success: true,
            id: this.lastID,
            referenceNumber: referenceNumber,
            melding: "Søknad mottatt og lagret!"
        });
    });
});

// Hent alle søknader (kun for ansatte)
app.get('/soknader', (req, res) => {
    console.log('Henter alle søknader...');
    const sql = `SELECT * FROM soknader ORDER BY submittedAt DESC`;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Feil ved henting av søknader:', err.message);
            return res.status(500).json({
                success: false,
                error: "Kunne ikke hente søknader"
            });
        }

        console.log(`📋 Fant ${rows.length} søknader i databasen`);
        rows.forEach(row => {
            console.log(`- ${row.firstName} ${row.lastName} (${row.program}) - ${row.status}`);
        });

        res.json({
            success: true,
            applications: rows
        });
    });
});

// Godkjenn søknad
app.post('/soknad/:id/godkjenn', (req, res) => {
    const id = req.params.id;
    const sql = `UPDATE soknader SET status = 'approved', processedAt = CURRENT_TIMESTAMP WHERE id = ?`;
    
    db.run(sql, [id], function(err) {
        if (err) {
            console.error('Feil ved godkjenning:', err.message);
            return res.status(500).json({
                success: false,
                error: "Kunne ikke godkjenne søknad"
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                success: false,
                error: "Søknad ikke funnet"
            });
        }

        console.log(`Søknad ${id} godkjent`);
        res.json({
            success: true,
            melding: "Søknad godkjent"
        });
    });
});

// Avslå søknad
app.post('/soknad/:id/avslag', (req, res) => {
    const id = req.params.id;
    const { comment } = req.body;
    
    const sql = `UPDATE soknader SET status = 'rejected', comment = ?, processedAt = CURRENT_TIMESTAMP WHERE id = ?`;
    
    db.run(sql, [comment, id], function(err) {
        if (err) {
            console.error('Feil ved avslag:', err.message);
            return res.status(500).json({
                success: false,
                error: "Kunne ikke avslå søknad"
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                success: false,
                error: "Søknad ikke funnet"
            });
        }

        console.log(`Søknad ${id} avslått: ${comment}`);
        res.json({
            success: true,
            melding: "Søknad avslått"
        });
    });
});

// Hent søknad etter ID
app.get('/soknad/:id', (req, res) => {
    const id = req.params.id;
    const sql = `SELECT * FROM soknader WHERE id = ?`;
    
    db.get(sql, [id], (err, row) => {
        if (err) {
            console.error('Feil ved henting av søknad:', err.message);
            return res.status(500).json({
                success: false,
                error: "Kunne ikke hente søknad"
            });
        }

        if (!row) {
            return res.status(404).json({
                success: false,
                error: "Søknad ikke funnet"
            });
        }

        res.json({
            success: true,
            application: row
        });
    });
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nLukker database tilkobling...');
    db.close((err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Database tilkobling lukket.');
        }
        process.exit(0);
    });
});

// Start server
app.listen(port, () => {
    console.log(`Skogvika VGS server kjører på http://localhost:${port}`);
    console.log('Tilgjengelige endpoints:');
    console.log('POST /login - Logg inn bruker');
    console.log('POST /registrer - Registrer ny bruker');
    console.log('GET /brukere - Hent alle brukere');
    console.log('GET /brukere/elev - Hent alle elever');
    console.log('GET /brukere/ansatt - Hent alle ansatte');
    console.log('POST /soknad - Send inn søknad');
    console.log('GET /soknader - Hent alle søknader (ansatte)');
    console.log('POST /soknad/:id/godkjenn - Godkjenn søknad');
    console.log('POST /soknad/:id/avslag - Avslå søknad');
    console.log('GET /soknad/:id - Hent spesifikk søknad');
    console.log('\nTestbrukere:');
    console.log('Elever: test/test, ole.nordmann/passord123, kari.hansen/elev2024');
    console.log('Ansatte: admin/admin, lars.larsen/sikker123, anne.berg/lærer2024');
});