/**
 * Script para funcionalidades interativas do site Agência Moderna
 *
 * 1. Cabeçalho Inteligente: Oculta ao rolar para baixo, mostra ao rolar para cima.
 * 2. Animação de Entrada: Adiciona a classe 'visible' em elementos quando eles entram na tela.
 * 3. Navegação Ativa: Atualiza o link ativo no menu de acordo com a página atual.
 * 4. Formulário de Contato para WhatsApp: Redireciona o formulário de contato para o WhatsApp.
 * 5. Sistema de Tradução: Altera o idioma do site e salva a preferência do usuário.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CABEÇALHO INTELIGENTE ---
    const header = document.getElementById('main-header');
    let lastScrollTop = 0;

    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop && scrollTop > header.offsetHeight) {
            header.classList.add('header-hidden');
        } else {
            header.classList.remove('header-hidden');
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });


    // --- 2. ANIMAÇÃO DE ENTRADA ---
    const animatedElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    animatedElements.forEach(el => observer.observe(el));


    // --- 3. NAVEGAÇÃO ATIVA ---
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        link.classList.toggle('active', linkPage === currentPage);
    });

    // Fecha menu mobile ao clicar em link
    const navToggler = document.querySelector('.navbar-toggler');
    const navCollapse = document.querySelector('.navbar-collapse');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navToggler.offsetParent !== null) {
                const bsCollapse = new bootstrap.Collapse(navCollapse);
                bsCollapse.hide();
            }
        });
    });

    // Tabs das categorias
    const catTabs = document.querySelectorAll('.category-tabs .nav-link');
    if (catTabs.length) {
        const sections = document.querySelectorAll('.category-section');
        const activate = (hash) => {
            catTabs.forEach(x => x.classList.toggle('active', x.getAttribute('href') === hash));
            sections.forEach(sec => sec.classList.toggle('active', `#${sec.id}` === hash));
            history.replaceState(null, '', hash);
        };
        catTabs.forEach(l => l.addEventListener('click', e => {
            e.preventDefault();
            activate(l.getAttribute('href'));
        }));
        const hash = location.hash === '#fazendas-section' ? '#fazendas-section' : '#imoveis-section';
        activate(hash);
    }


    // --- 4. BOTÃO "VER DETALHES" → WHATSAPP ---
    const detailButtons = document.querySelectorAll('.property-details-btn');
    if (detailButtons.length) {
        detailButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();

                const card = btn.closest('.card');
                if (!card) return;

                const title = card.querySelector('.card-title')?.innerText || 'Imóvel';
                const locationText = card.querySelector('.card-text small, .card-text .small, .card-text .text-muted.small span')?.innerText
                    || card.querySelector('.card-text .text-muted.small')?.innerText
                    || card.querySelector('.card-text .small')?.innerText
                    || card.querySelector('.card-text span')?.innerText
                    || 'localização não informada';
                const price = card.querySelector('.card-text.fw-semibold span')?.innerText || 'preço sob consulta';

                // Seu número de WhatsApp (sem +, sem espaços)
                const phone = "595973877007"; 

                // Mensagem automática
                const message = `Olá! Tenho interesse no imóvel "${title}" localizado em ${locationText}. O preço indicado é ${price}. Poderia me enviar mais detalhes?`;

                // Abre WhatsApp
                const whatsappURL = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
                window.open(whatsappURL, '_blank');
            });
        });
    }


    // --- 5. FORMULÁRIO DE CONTATO PARA WHATSAPP ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const lang = getLanguage();
            const t = translations[lang];
            const whatsappNumber = "595973877007";

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const message = document.getElementById('message').value;

            let fullMessage = `${t.whatsapp_greeting}\n\n`;
            fullMessage += `*${t.form_name}:* ${name}\n`;
            fullMessage += `*${t.form_email}:* ${email}\n`;
            if (phone) fullMessage += `*${t.form_phone}:* ${phone}\n`;
            fullMessage += `\n*${t.form_message}:*\n${message}`;

            const encodedMessage = encodeURIComponent(fullMessage);
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
            window.open(whatsappUrl, '_blank');
        });
    }


    // --- 6. SISTEMA DE TRADUÇÃO ---
    const langSwitchers = document.querySelectorAll('.lang-switcher');
    const flagElement = document.getElementById('current-lang-flag');
    const flags = {
        'pt-BR': '🇧🇷',
        'en': '🇬🇧',
        'es': '🇵🇾'
    };

    const getLanguage = () => localStorage.getItem('language') || 'pt-BR';
    const setLanguage = (lang) => {
        localStorage.setItem('language', lang);
        translatePage(lang);
    };

    const translatePage = (lang) => {
        const elements = document.querySelectorAll('[data-translate]');
        const translationSet = translations[lang];
        if (!translationSet) return;

        elements.forEach(el => {
            const key = el.getAttribute('data-translate');
            if (translationSet[key]) el.innerHTML = translationSet[key];
        });

        document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
            const key = el.getAttribute('data-translate-placeholder');
            if (translationSet[key]) el.placeholder = translationSet[key];
        });

        if (flagElement) flagElement.innerText = flags[lang];
        document.documentElement.lang = lang;
    };

    langSwitchers.forEach(switcher => {
        switcher.addEventListener('click', (event) => {
            event.preventDefault();
            setLanguage(switcher.getAttribute('data-lang'));
        });
    });

    translatePage(getLanguage());
});
