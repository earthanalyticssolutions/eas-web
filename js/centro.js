/* ════════════════════════════════════════════════════════════
   EAS · centro.js
   Página del Centro de Investigación: video, apariciones y registro
   ════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // Webhook de n8n que recibe los registros. Vacío = el formulario ofrece
    // enviar el registro por correo o WhatsApp (funciona sin servidor).
    const WEBHOOK_URL = '';
    const CORREO = 'gerencia@earthas.co';
    const WHATSAPP = '573137531833';

    const reduceMov = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── 1. APARICIONES AL HACER SCROLL ─────────────────────────
    const revs = document.querySelectorAll('.c-rev');
    if ('IntersectionObserver' in window && !reduceMov) {
        const obs = new IntersectionObserver((entradas) => {
            entradas.forEach((e) => {
                if (!e.isIntersecting) return;
                e.target.classList.add('is-visible');
                obs.unobserve(e.target);
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        revs.forEach((el, i) => {
            // escalonado suave entre tarjetas hermanas
            const hermanos = el.parentElement ? Array.from(el.parentElement.children).filter((h) => h.classList.contains('c-rev')) : [];
            const k = hermanos.indexOf(el);
            if (k > 0) el.style.transitionDelay = Math.min(k * 0.07, 0.35) + 's';
            obs.observe(el);
        });
    } else {
        revs.forEach((el) => el.classList.add('is-visible'));
    }

    // ── 2. VIDEO DE PORTADA ────────────────────────────────────
    const portada = document.getElementById('video-portada');
    if (portada) {
        if (reduceMov) {
            portada.removeAttribute('autoplay');
            portada.pause();
        } else if ('IntersectionObserver' in window) {
            // solo reproduce mientras está a la vista (ahorra batería y datos)
            new IntersectionObserver((entradas) => {
                entradas.forEach((e) => {
                    if (e.isIntersecting) portada.play().catch(() => {});
                    else portada.pause();
                });
            }, { threshold: 0.15 }).observe(portada);
        }
    }

    // ── 3. VIDEO COMPLETO (modal) ──────────────────────────────
    const modal = document.getElementById('modal-video');
    const completo = document.getElementById('video-completo');

    function abrirVideo() {
        if (!modal || !completo) return;
        if (typeof modal.showModal === 'function') modal.showModal();
        else modal.setAttribute('open', '');
        if (portada) portada.pause();
        completo.currentTime = 0;
        completo.play().catch(() => {});
    }

    function cerrarVideo() {
        if (!modal || !completo) return;
        completo.pause();
        if (modal.open && typeof modal.close === 'function') modal.close();
        else modal.removeAttribute('open');
    }

    document.querySelectorAll('[data-abrir-video]').forEach((b) => b.addEventListener('click', abrirVideo));
    document.querySelectorAll('[data-cerrar-video]').forEach((b) => b.addEventListener('click', cerrarVideo));

    if (modal) {
        // clic en el fondo oscuro = cerrar
        modal.addEventListener('click', (e) => { if (e.target === modal) cerrarVideo(); });
        modal.addEventListener('close', () => {
            if (completo) completo.pause();
            if (portada && !reduceMov) portada.play().catch(() => {});
        });
    }

    // ── 4. AVISO DE PRIVACIDAD ─────────────────────────────────
    const privacidad = document.getElementById('privacidad');
    document.querySelectorAll('[data-abrir-privacidad]').forEach((a) => {
        a.addEventListener('click', () => { if (privacidad) privacidad.open = true; });
    });

    // ── 5. FORMULARIO DE REGISTRO ──────────────────────────────
    const form = document.getElementById('form-centro');
    if (!form) return;

    const estado = form.querySelector('.c-estado');
    const boton = form.querySelector('button[type="submit"]');

    // Enlaces que llegan al formulario con opciones ya marcadas
    document.querySelectorAll('a[href="#registro"][data-perfil], a[href="#registro"][data-participar]').forEach((a) => {
        a.addEventListener('click', () => {
            const perfil = a.dataset.perfil;
            const participar = a.dataset.participar;
            if (perfil) {
                const sel = form.querySelector('#c-perfil');
                const op = Array.from(sel.options).find((o) => o.text === perfil);
                if (op) sel.value = op.value || op.text;
            }
            if (participar) {
                const chk = Array.from(form.querySelectorAll('input[name="participar"]')).find((c) => c.value === participar);
                if (chk) chk.checked = true;
            }
        });
    });

    function mostrar(tipo, html) {
        estado.className = 'c-estado is-' + tipo;
        estado.innerHTML = html;
        estado.scrollIntoView({ behavior: reduceMov ? 'auto' : 'smooth', block: 'nearest' });
    }

    function marcados(nombre) {
        return Array.from(form.querySelectorAll('input[name="' + nombre + '"]:checked')).map((c) => c.value);
    }

    function escapar(t) {
        return String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    function reunir() {
        const v = (n) => (form.elements[n] && form.elements[n].value ? form.elements[n].value.trim() : '');
        return {
            fuente: 'web-centro-registro',
            timestamp: new Date().toISOString(),
            nombre: v('nombre'),
            correo: v('correo'),
            telefono: v('telefono'),
            ciudad: v('ciudad'),
            perfil: v('perfil'),
            formacion: v('formacion'),
            institucion: v('institucion'),
            temas: marcados('temas'),
            otro_tema: v('otro_tema'),
            participar: marcados('participar'),
            enlace: v('enlace'),
            mensaje: v('mensaje'),
            autoriza_datos: true,
            referrer: document.referrer || '',
            user_agent: navigator.userAgent
        };
    }

    function comoTexto(d) {
        const lineas = [
            'REGISTRO · Centro de Investigación en Ingeniería y Ciencias Planetarias',
            '',
            'Nombre: ' + d.nombre,
            'Correo: ' + d.correo,
            d.telefono ? 'Teléfono: ' + d.telefono : '',
            d.ciudad ? 'Ciudad: ' + d.ciudad : '',
            'Perfil: ' + d.perfil,
            d.formacion ? 'Formación: ' + d.formacion : '',
            d.institucion ? 'Institución: ' + d.institucion : '',
            'Temas: ' + d.temas.concat(d.otro_tema ? [d.otro_tema] : []).join(', '),
            'Quiero: ' + d.participar.join(', '),
            d.enlace ? 'Perfil en línea: ' + d.enlace : '',
            d.mensaje ? 'Mensaje: ' + d.mensaje : '',
            '',
            'Autorizo el tratamiento de mis datos personales (Ley 1581 de 2012).'
        ];
        return lineas.filter((l, i) => l !== '' || i === 1 || i === lineas.length - 2).join('\n');
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // señuelo: si viene lleno, es un envío automático
        if (form.elements['sitio_web'] && form.elements['sitio_web'].value) return;

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const d = reunir();

        if (!d.temas.length && !d.otro_tema) {
            mostrar('error', 'Marca al menos un tema de investigación, o escribe el tuyo.');
            form.querySelector('[data-grupo="temas"]').scrollIntoView({ behavior: reduceMov ? 'auto' : 'smooth', block: 'center' });
            return;
        }
        if (!d.participar.length) {
            mostrar('error', 'Cuéntanos cómo quieres participar: marca al menos una opción.');
            form.querySelector('[data-grupo="participar"]').scrollIntoView({ behavior: reduceMov ? 'auto' : 'smooth', block: 'center' });
            return;
        }

        const texto = comoTexto(d);
        const enlaceCorreo = 'mailto:' + CORREO + '?subject=' + encodeURIComponent('Registro en el Centro de Investigación · ' + d.nombre) + '&body=' + encodeURIComponent(texto);
        const enlaceWA = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto);
        const acciones =
            '<div class="c-estado__acciones">' +
            '<a class="btn c-btn-cian" href="' + enlaceCorreo + '">Enviar por correo</a>' +
            '<a class="btn btn--ghost" href="' + enlaceWA + '" target="_blank" rel="noopener">Enviar por WhatsApp</a>' +
            '</div>';

        if (!WEBHOOK_URL) {
            mostrar('info', 'Tu registro está listo, ' + escapar(d.nombre.split(' ')[0]) + '. Elige por dónde enviarlo:' + acciones);
            return;
        }

        const textoBoton = boton.innerHTML;
        boton.disabled = true;
        boton.innerHTML = 'Enviando…';

        try {
            const res = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(d)
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            form.reset();
            mostrar('ok', 'Recibimos tu registro, ' + escapar(d.nombre.split(' ')[0]) + '. Te escribiremos al correo que dejaste.');
        } catch (err) {
            console.error('[centro] No se pudo enviar el registro:', err);
            mostrar('error', 'No pudimos enviar el registro desde aquí. Puedes enviarlo por estos medios:' + acciones);
        } finally {
            boton.disabled = false;
            boton.innerHTML = textoBoton;
        }
    });

})();
