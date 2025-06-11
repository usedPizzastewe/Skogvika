document.addEventListener("DOMContentLoaded", function() {
    console.log("Velkommen til Skogvika VGS!");
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Active navigation highlight
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('section[id]');

    function highlightNavigation() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', highlightNavigation);

    // Add interactive elements for program cards
    const programCards = document.querySelectorAll('.program-card');
    programCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-10px) scale(1)';
        });
    });

    // Simple form validation function (for future use)
    function validateForm(formElement) {
        const inputs = formElement.querySelectorAll('input[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = '#dc3545';
                isValid = false;
            } else {
                input.style.borderColor = '#28a745';
            }
        });
        
        return isValid;
    }

    // Loading animation function (for future dynamic content)
    function showLoading(element) {
        element.innerHTML = '<div style="text-align: center; padding: 2rem;"><div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #28a745; border-radius: 50%; animation: spin 1s linear infinite;"></div></div>';
    }

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation on scroll
    document.querySelectorAll('.program-card, .info-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Future functionality - Contact form handling
    function handleContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                if (validateForm(this)) {
                    // Simulate form submission
                    showLoading(document.getElementById('form-message'));
                    
                    setTimeout(() => {
                        document.getElementById('form-message').innerHTML = 
                            '<div style="color: #28a745; text-align: center; padding: 1rem;">Takk for din henvendelse! Vi tar kontakt snart.</div>';
                        contactForm.reset();
                    }, 2000);
                } else {
                    document.getElementById('form-message').innerHTML = 
                        '<div style="color: #dc3545; text-align: center; padding: 1rem;">Vennligst fyll ut alle påkrevde felt.</div>';
                }
            });
        }
    }

    // Future functionality - Application form handling
    function handleApplicationForm() {
        const applicationForm = document.getElementById('applicationForm');
        if (applicationForm) {
            applicationForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                const applicationData = {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    program: formData.get('program'),
                    message: formData.get('message')
                };
                
                console.log('Søknad innsendt:', applicationData);
                
                // Simulate submission
                showLoading(document.getElementById('application-message'));
                
                setTimeout(() => {
                    document.getElementById('application-message').innerHTML = 
                        '<div style="color: #28a745; text-align: center; padding: 1rem;">Søknaden er mottatt! Du vil få svar innen 2 uker.</div>';
                    applicationForm.reset();
                }, 2000);
            });
        }
    }

    // Initialize form handlers
    handleContactForm();
    handleApplicationForm();

    // Future functionality - News/events loading
    function loadSchoolNews() {
        // This would typically fetch from an API
        const newsContainer = document.getElementById('news-container');
        if (newsContainer) {
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

    // Initialize news loading
    loadSchoolNews();

    // Add keyboard navigation support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.addEventListener('mousedown', function(e) {
        document.body.classList.remove('keyboard-navigation');
    });
});