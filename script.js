// Køyr når heile sida er ferdig lasta
document.addEventListener("DOMContentLoaded", function() {
    console.log("Velkommen til Skogvika VGS!");
    
    // Sjekk om brukar er innlogga og vis det i navigasjonen
    checkLoggedInUser();
    
    // Legg til smooth scrolling for navigasjonslenkjer som startar med #
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault(); // Stopp normal link-oppførsel
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                // Scroll mjukt til målet
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Aktiv navigasjonsmarkering - markerer kva seksjon som er synleg
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('section[id]');

    // Funksjon som oppdaterer kva navigasjonslenke som er aktiv
    function highlightNavigation() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        // Fjern aktiv klasse frå alle lenkjer
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active'); // Legg til aktiv klasse på riktig lenke
            }
        });
    }

    // Køyr highlight-funksjonen når brukar skrollar
    window.addEventListener('scroll', highlightNavigation);

    // Legg til interaktive element for programkort
    const programCards = document.querySelectorAll('.program-card');
    programCards.forEach(card => {
        // Når musa går over kortet
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.02)';
        });
        
        // Når musa går vekk frå kortet
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-10px) scale(1)';
        });
    });

    // Intersection Observer for scroll-animasjonar
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    // Observer som køyrer når element kjem inn i synsfeltet
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Vis elementet når det kjem i synsfeltet
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observer element for animasjon på scroll
    document.querySelectorAll('.program-card, .info-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Start andre funksjonar
    handleContactForm();
    handleApplicationForm();
    loadSchoolNews();
});

// Sjekk om brukar er innlogga
function checkLoggedInUser() {
    const loggedInUser = sessionStorage.getItem('loggedInUser');
    const loginLink = document.querySelector('a[href="login.html"]');
    
    if (loggedInUser && loginLink) {
        try {
            const user = JSON.parse(loggedInUser);
            
            // Endre "Logg inn" til brukarinfo
            loginLink.textContent = `${user.username} (${user.userType})`;
            loginLink.href = '#';
            loginLink.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
            loginLink.style.color = 'white';
            
            // Legg til dropdown-meny ved klikk
            loginLink.addEventListener('click', function(e) {
                e.preventDefault();
                showUserMenu(user);
            });
            
            console.log(`Innlogget som: ${user.username} (${user.userType})`);
        } catch (e) {
            console.error('Feil ved lesing av innlogget bruker:', e);
            sessionStorage.removeItem('loggedInUser');
        }
    }
}

// Vis brukarmeny med dropdown
function showUserMenu(user) {
    // Fjern eksisterande meny
    const existingMenu = document.getElementById('userMenu');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }
    
    // Opprett ny meny
    const menu = document.createElement('div');
    menu.id = 'userMenu';
    menu.style.cssText = `
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border: 1px solid #ddd;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        padding: 1rem;
        min-width: 200px;
        z-index: 1000;
        margin-top: 0.5rem;
    `;
    
    // HTML for menyen
    menu.innerHTML = `
        <div style="margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #eee;">
            <strong>${user.username}</strong><br>
            <small style="color: #666;">${user.userType === 'elev' ? 'Elev' : 'Ansatt'}</small>
        </div>
        <a href="404.html" style="display: block; padding: 0.5rem; text-decoration: none; color: #333; border-radius: 5px; margin-bottom: 0.5rem; transition: background 0.3s ease;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='transparent'" onclick="window.location.href='404.html'">
            📚 Min profil
        </a>
        <a href="404.html" style="display: block; padding: 0.5rem; text-decoration: none; color: #333; border-radius: 5px; margin-bottom: 0.5rem; transition: background 0.3s ease;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='transparent'" onclick="window.location.href='404.html'">
            ⚙️ Innstillinger
        </a>
        <button onclick="logOut()" style="width: 100%; padding: 0.5rem; background: linear-gradient(45deg, #dc3545, #c82333); color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 0.5rem; transition: transform 0.2s ease;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
            Logg ut
        </button>
    `;
    
    // Fest meny til login-lenka
    const loginLink = document.querySelector('a[href="#"]');
    loginLink.style.position = 'relative';
    loginLink.appendChild(menu);
    
    // Lukk meny ved klikk utanfor
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target) && e.target !== loginLink) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 100);
}

// Logg ut funksjon
function logOut() {
    sessionStorage.removeItem('loggedInUser');
    window.location.reload(); // Last sida på nytt
}

// Utility-funksjon for å validere skjema
function validateForm(formElement) {
    const inputs = formElement.querySelectorAll('input[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#dc3545'; // Raud kant viss tomt
            isValid = false;
        } else {
            input.style.borderColor = '#28a745'; // Grøn kant viss utfylt
        }
    });
    
    return isValid;
}

// Vis lasting-animasjon
function showLoading(element) {
    element.innerHTML = '<div style="text-align: center; padding: 2rem;"><div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #28a745; border-radius: 50%; animation: spin 1s linear infinite;"></div></div>';
}

// Handter kontaktskjema
function handleContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Stopp vanleg skjemainnsending
            
            if (validateForm(this)) {
                showLoading(document.getElementById('form-message'));
                
                // Simuler sending med timeout
                setTimeout(() => {
                    document.getElementById('form-message').innerHTML = 
                        '<div style="color: #28a745; text-align: center; padding: 1rem;">Takk for din henvendelse! Vi tar kontakt snart.</div>';
                    contactForm.reset(); // Tøm skjemaet
                }, 2000);
            } else {
                document.getElementById('form-message').innerHTML = 
                    '<div style="color: #dc3545; text-align: center; padding: 1rem;">Vennligst fyll ut alle påkrevde felt.</div>';
            }
        });
    }
}

// Handter søknadsskjema
function handleApplicationForm() {
    const applicationForm = document.getElementById('applicationForm');
    if (applicationForm) {
        applicationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Hent data frå skjemaet
            const formData = new FormData(this);
            const applicationData = {
                name: formData.get('name'),
                email: formData.get('email'),
                program: formData.get('program'),
                message: formData.get('message')
            };
            
            console.log('Søknad innsendt:', applicationData);
            
            showLoading(document.getElementById('application-message'));
            
            // Simuler behandling
            setTimeout(() => {
                document.getElementById('application-message').innerHTML = 
                    '<div style="color: #28a745; text-align: center; padding: 1rem;">Søknaden er mottatt! Du vil få svar innen 2 uker.</div>';
                applicationForm.reset();
            }, 2000);
        });
    }
}

// Last skulenyheter (mock data)
function loadSchoolNews() {
    const newsContainer = document.getElementById('news-container');
    if (newsContainer) {
        // Simulerte nyheter
        const mockNews = [
            {
                title: "Nye IT-laboratorier åpnet",
                date: "15. juni 2025",
                summary: "Vi har åpnet splitter nye IT-laboratorier med det nyeste utstyret..."
            },
            {
                title: "Eksamen våren 2025",
                date: "10. juni 2025", 
                summary: "Viktig informasjon om eksamensperioden for våre elever..."
            },
            {
                title: "Sommerfest for nye elever",
                date: "5. juni 2025",
                summary: "Vi inviterer alle nye elever til sommerfest 20. august..."
            }
        ];

        // Bygg HTML for nyhetene
        const newsHTML = mockNews.map(news => `
            <div class="news-item">
                <h4>${news.title}</h4>
                <p class="news-date">${news.date}</p>
                <p>${news.summary}</p>
            </div>
        `).join('');

        newsContainer.innerHTML = newsHTML;
    }
}

// Tastaturnavigasjon support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', function(e) {
    document.body.classList.remove('keyboard-navigation');
});