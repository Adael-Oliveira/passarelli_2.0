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
            // Rolando para baixo
            header.classList.add('header-hidden');
        } else {
            // Rolando para cima
            header.classList.remove('header-hidden');
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // Para o caso de rolagem no topo ou com valores negativos
    });


    // --- 2. ANIMAÇÃO DE ENTRADA (FADE-IN ON SCROLL) ---
    const animatedElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Opcional: para animar apenas uma vez
            }
        });
    }, {
        threshold: 0.1 // Ativa quando 10% do elemento está visível
    });

    animatedElements.forEach(element => {
        observer.observe(element);
    });


    // --- 3. NAVEGAÇÃO ATIVA (HIGHLIGHT CURRENT PAGE) ---
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active'); // Garante que outros não fiquem ativos
        }
    });
    
    // Fecha o menu hamburguer ao clicar em um link (para mobile)
    const navToggler = document.querySelector('.navbar-toggler');
    const navCollapse = document.querySelector('.navbar-collapse');
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navToggler.offsetParent !== null) { // se o toggler está visível
                const bsCollapse = new bootstrap.Collapse(navCollapse);
                bsCollapse.hide();
            }
        });
    });

    const catTabs = document.querySelectorAll('.category-tabs .nav-link');
    if (catTabs.length) {
        const sections = document.querySelectorAll('.category-section');
        const activate = (hash) => {
            // tabs
            catTabs.forEach(x => x.classList.toggle('active', x.getAttribute('href') === hash));
            // sections
            sections.forEach(sec => sec.classList.toggle('active', `#${sec.id}` === hash));
            // update hash without jump
            history.replaceState(null, '', hash);
        };

        catTabs.forEach(l => l.addEventListener('click', e => {
            e.preventDefault();
            activate(l.getAttribute('href'));
        }));

        const hash = location.hash === '#fazendas-section' ? '#fazendas-section' : '#imoveis-section';
        activate(hash);
    }

    // Property details modal (Imóveis & Fazendas)
    const detailButtons = document.querySelectorAll('.property-details-btn');
    if (detailButtons.length) {
        const modalEl = document.getElementById('propertyModal');
        const modal = new bootstrap.Modal(modalEl);
        const titleEl = document.getElementById('propertyModalLabel');
        const locationEl = document.getElementById('propertyLocation');
        const descEl = document.getElementById('propertyDesc');
        const priceEl = document.getElementById('propertyPrice');
        const carouselInner = document.getElementById('propertyCarouselInner');

        const buildCarousel = (images) => {
            carouselInner.innerHTML = '';
            images.forEach((src, idx) => {
                const item = document.createElement('div');
                item.className = 'carousel-item' + (idx === 0 ? ' active' : '');
                const img = document.createElement('img');
                img.src = src.trim();
                img.className = 'd-block w-100';
                img.alt = 'Foto do imóvel';
                img.style.maxHeight = '420px';
                img.style.objectFit = 'cover';
                item.appendChild(img);
                carouselInner.appendChild(item);
            });
        };

        detailButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const card = btn.closest('.card');
                if (!card) return;

                const title = card.querySelector('.card-title')?.innerText || '';
                const location = card.querySelector('.card-text .text-muted, .card-text.small') ? '' : '';
                const locationText = card.querySelector('.card-text small, .card-text .small, .card-text .text-muted.small span')?.innerText
                    || card.querySelector('.card-text .text-muted.small span')?.innerText
                    || card.querySelector('.card-text .text-muted.small')?.innerText
                    || card.querySelector('.card-text .small')?.innerText
                    || card.querySelector('.card-text span')?.innerText
                    || '';
                const desc = card.querySelector('.card-text.flex-grow-1')?.innerText || '';
                const price = card.querySelector('.card-text.fw-semibold span')?.innerText || '';

                titleEl.innerText = title;
                locationEl.innerText = locationText;
                descEl.innerText = desc;
                priceEl.innerText = price;

                const imgsAttr = btn.getAttribute('data-images') || '';
                const images = imgsAttr.split(',').filter(Boolean);
                // fallback to card main image if needed
                if (!images.length) {
                    const mainImg = card.querySelector('img.card-img-top')?.src;
                    if (mainImg) images.push(mainImg);
                }
                buildCarousel(images);

                modal.show();
            });
        });
    }


    // --- 4. FORMULÁRIO DE CONTATO PARA WHATSAPP ---
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const lang = getLanguage();
            const t = translations[lang];

            const whatsappNumber = "595973877007"; // Número de telefone para contato

            // Captura os dados do formulário
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const message = document.getElementById('message').value;

            // Formata a mensagem para o WhatsApp
            let fullMessage = `${t.whatsapp_greeting}\n\n`;
            fullMessage += `*${t.form_name}:* ${name}\n`;
            fullMessage += `*${t.form_email}:* ${email}\n`;
            if (phone) {
                fullMessage += `*${t.form_phone}:* ${phone}\n`;
            }
            fullMessage += `\n*${t.form_message}:*\n${message}`;

            // Codifica a mensagem para a URL
            const encodedMessage = encodeURIComponent(fullMessage);
            
            // Cria a URL do WhatsApp e abre em uma nova aba
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
            window.open(whatsappUrl, '_blank');
        });
    }

    // --- 5. SISTEMA DE TRADUÇÃO ---
    const langSwitchers = document.querySelectorAll('.lang-switcher');
    const flagElement = document.getElementById('current-lang-flag');
    const flags = {
        'pt-BR': '🇧🇷',
        'en': '🇬🇧',
        'es': '🇵🇾'
    };

    const getLanguage = () => {
        return localStorage.getItem('language') || 'pt-BR';
    };
    
    const setLanguage = (lang) => {
        localStorage.setItem('language', lang);
        translatePage(lang);
    };

    const translatePage = (lang) => {
        const elements = document.querySelectorAll('[data-translate]');
        const translationSet = translations[lang];

        if (!translationSet) return; // Se a tradução não existir, não faz nada

        elements.forEach(el => {
            const key = el.getAttribute('data-translate');
            if (translationSet[key]) {
                el.innerHTML = translationSet[key];
            }
        });
        
        // Atualiza placeholders
        const placeholderElements = document.querySelectorAll('[data-translate-placeholder]');
        placeholderElements.forEach(el => {
             const key = el.getAttribute('data-translate-placeholder');
             if (translationSet[key]) {
                el.placeholder = translationSet[key];
            }
        });

        // Atualiza a bandeira no dropdown
        if (flagElement) {
            flagElement.innerText = flags[lang];
        }
        
        // Atualiza o atributo lang da tag html
        document.documentElement.lang = lang;
    };

    langSwitchers.forEach(switcher => {
        switcher.addEventListener('click', (event) => {
            event.preventDefault();
            const selectedLang = switcher.getAttribute('data-lang');
            setLanguage(selectedLang);
        });
    });

    // Traduz a página no carregamento inicial
    const initialLang = getLanguage();
    translatePage(initialLang);
});