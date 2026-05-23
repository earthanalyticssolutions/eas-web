/* ═══════════════════════════════════════════════════════════════
   EAS · main.js
   Nav, scroll reveals, menu móvil, submit del formulario
   ═══════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ── 1. MENU MÓVIL ──────────────────────────────────────────
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    const closeNav = () => {
        navLinks.classList.remove('is-open');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
    };

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('is-open');
            navToggle.classList.toggle('is-open', isOpen);
            navToggle.setAttribute('aria-expanded', String(isOpen));
            document.body.classList.toggle('nav-open', isOpen);
        });

        // Cerrar al click en un link del menú
        navLinks.addEventListener('click', (e) => {
            if (e.target.matches('a')) closeNav();
        });

        // Cerrar al click en el backdrop (fuera del menú)
        document.addEventListener('click', (e) => {
            if (!document.body.classList.contains('nav-open')) return;
            if (navLinks.contains(e.target) || navToggle.contains(e.target)) return;
            closeNav();
        });

        // Cerrar con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.body.classList.contains('nav-open')) closeNav();
        });

        // Cerrar al redimensionar a desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 900 && document.body.classList.contains('nav-open')) closeNav();
        });
    }

    // ── 2. SCROLL REVEALS ──────────────────────────────────────
    const revealTargets = [
        '.section-head',
        '.stat-item',
        '.problem-card',
        '.service-card',
        '.capability-item',
        '.sector-card',
        '.equip-card',
        '.case-card',
        '.diff-item',
        '.process-step',
        '.norm-card',
        '.solution-card',
        '.quote-banner',
        '.resource-card',
        '.faq-item',
        '.contact-channel'
    ];

    const revealEls = document.querySelectorAll(revealTargets.join(','));
    revealEls.forEach((el) => el.classList.add('reveal'));

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

        revealEls.forEach((el) => observer.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('is-visible'));
    }

    // ── 2.b SCROLL-BANDS · activan animación SVG al entrar viewport
    const scrollBands = document.querySelectorAll('.scroll-band');
    if (scrollBands.length && 'IntersectionObserver' in window) {
        const bandObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    bandObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.25, rootMargin: '0px 0px -40px 0px' });
        scrollBands.forEach((b) => bandObserver.observe(b));
    } else {
        scrollBands.forEach((b) => b.classList.add('is-visible'));
    }

    // ── 3. ACTIVE SECTION en nav ───────────────────────────────
    const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
    const sections = document.querySelectorAll('section[id]');

    if ('IntersectionObserver' in window && sections.length) {
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    navAnchors.forEach((a) => {
                        a.classList.toggle(
                            'is-active',
                            a.getAttribute('href') === '#' + id
                        );
                    });
                }
            });
        }, { threshold: 0.4 });

        sections.forEach((s) => navObserver.observe(s));
    }

    // ── 4. FORM SUBMIT ─────────────────────────────────────────
    const form = document.getElementById('lead-form');
    const status = form ? form.querySelector('.form-status') : null;

    // Sustituir por el webhook real cuando esté listo:
    // const WEBHOOK_URL = 'https://molina0922.app.n8n.cloud/webhook/leads-web';
    const WEBHOOK_URL = '';

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'ENVIANDO...';

            const data = Object.fromEntries(new FormData(form).entries());
            data.fuente = 'web-earthas-co';
            data.timestamp = new Date().toISOString();
            data.user_agent = navigator.userAgent;

            try {
                if (WEBHOOK_URL) {
                    const res = await fetch(WEBHOOK_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    if (!res.ok) throw new Error('HTTP ' + res.status);
                } else {
                    // Sin webhook configurado: simulamos éxito local
                    await new Promise((r) => setTimeout(r, 700));
                    console.info('[lead-form] Sin webhook configurado. Datos:', data);
                }

                showStatus('success', '✓ SOLICITUD ENVIADA. TE CONTACTAREMOS EN MENOS DE 24H HÁBILES.');
                form.reset();
            } catch (err) {
                console.error(err);
                showStatus('error', '✗ NO PUDIMOS ENVIAR LA SOLICITUD. ESCRÍBENOS A GERENCIA@EARTHAS.CO');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    function showStatus(type, message) {
        if (!status) return;
        status.className = 'form-status ' + type;
        status.textContent = message;
        status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // ── 4b. MONITOR TABS (Hero Command Center) ─────────────────
    const monitor = document.querySelector('[data-tabs="monitor"]');
    if (monitor) {
        const tabs = monitor.querySelectorAll('.monitor-tab');
        const panels = monitor.querySelectorAll('.monitor-panel');

        tabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;

                tabs.forEach((t) => {
                    const active = t === tab;
                    t.classList.toggle('is-active', active);
                    t.setAttribute('aria-selected', String(active));
                });

                panels.forEach((p) => {
                    const active = p.dataset.panel === target;
                    p.classList.toggle('is-active', active);
                    p.hidden = !active;
                });
            });
        });

        // Auto-rotate por 8s la primera vez (engancha al usuario)
        let autoIdx = 0;
        let autoTimer = null;
        let userInteracted = false;

        const stopAuto = () => {
            userInteracted = true;
            if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
        };

        tabs.forEach((tab) => tab.addEventListener('click', stopAuto));
        monitor.addEventListener('mouseenter', stopAuto);

        autoTimer = setInterval(() => {
            if (userInteracted) return;
            autoIdx = (autoIdx + 1) % tabs.length;
            tabs[autoIdx].click();
        }, 5000);

        // Detener tras 4 ciclos (20s)
        setTimeout(stopAuto, 21000);
    }

    // ── 4c. EXPRESS FORM (cotización 15min en hero) ────────────
    const expressForm = document.getElementById('express-form');
    if (expressForm) {
        const expressStatus = expressForm.querySelector('.mini-form-status');

        expressForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!expressForm.checkValidity()) {
                expressForm.reportValidity();
                return;
            }

            const submitBtn = expressForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'ENVIANDO...';

            const data = Object.fromEntries(new FormData(expressForm).entries());
            data.fuente = 'web-hero-express';
            data.timestamp = new Date().toISOString();

            try {
                if (typeof WEBHOOK_URL !== 'undefined' && WEBHOOK_URL) {
                    const res = await fetch(WEBHOOK_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    if (!res.ok) throw new Error('HTTP ' + res.status);
                } else {
                    await new Promise((r) => setTimeout(r, 600));
                    console.info('[express-form] Sin webhook. Datos:', data);
                }

                if (expressStatus) {
                    expressStatus.className = 'mini-form-status success';
                    expressStatus.textContent = '✓ SOLICITUD ENVIADA · TE LLEGARÁ ESTIMACIÓN EN <15 MIN';
                }
                expressForm.reset();
            } catch (err) {
                if (expressStatus) {
                    expressStatus.className = 'mini-form-status error';
                    expressStatus.textContent = '✗ ERROR · ESCRÍBENOS A GERENCIA@EARTHAS.CO';
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    // ── 5. SCROLL SUAVE para anchors (fallback) ────────────────
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href === '#' || href.length < 2) return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

})();
