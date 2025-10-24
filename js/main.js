// ---- Máscaras ----
function maskCPF(v) {
  v = v.replace(/\D/g, '');
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  return v;
}

function maskPhone(v) {
  v = v.replace(/\D/g, '');
  if (v.length <= 2) return v;
  if (v.length <= 6) return v.replace(/(\d{2})(\d+)/, '($1) $2');
  if (v.length <= 10) return v.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
  return v.replace(/(\d{2})(\d{5})(\d+)/, '($1) $2-$3');
}

function maskCEP(v) {
  v = v.replace(/\D/g, '');
  v = v.replace(/(\d{5})(\d+)/, '$1-$2');
  return v;
}

// ---- Função global de mensagem ----
function showMessage(el, text, type = 'sucesso', duration = 4000) {
  el.textContent = text;
  el.className = `msg ${type}`;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', duration);
}

// ---- Função para lidar com formulários ----
function handleForm(formId, msgId, successText, storageKeyPrefix) {
  const form = document.getElementById(formId);
  const msgEl = document.getElementById(msgId);
  if (!form || !msgEl) return;

  msgEl.setAttribute('role', 'alert');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    let isValid = true;

    form.querySelectorAll('input, textarea, select').forEach(input => {
      if (!input.checkValidity()) {
        input.setAttribute('aria-invalid', 'true');
        isValid = false;
      } else input.removeAttribute('aria-invalid');
    });

    if (!isValid) {
      showMessage(msgEl, '❌ Por favor, preencha todos os campos obrigatórios corretamente.', 'erro');
      msgEl.focus();
      return;
    }

    const nomeInput = form.querySelector('input[name="nome"]') || form.querySelector('input[type="text"]');
    const emailInput = form.querySelector('input[type="email"]');
    if (nomeInput && emailInput) {
      localStorage.setItem(storageKeyPrefix + '_nome', nomeInput.value);
      localStorage.setItem(storageKeyPrefix + '_email', emailInput.value);
    }

    showMessage(msgEl, successText, 'sucesso');
    msgEl.focus();
    form.reset();
  });
}

// ---- DOMContentLoaded ----
document.addEventListener('DOMContentLoaded', () => {

  // ---- Aplicar máscaras ----
  document.querySelectorAll('input[data-mask]').forEach(input => {
    input.addEventListener('input', () => {
      const type = input.dataset.mask;
      if (type === 'cpf') input.value = maskCPF(input.value);
      if (type === 'phone') input.value = maskPhone(input.value);
      if (type === 'cep') input.value = maskCEP(input.value);
    });
  });

  // ---- Inicializar formulários ----
  handleForm('form_vol', 'msg_vol', '✅ Inscrição enviada com sucesso!', 'vol');
  handleForm('donForm', 'msg_don', '✅ Doação registrada com sucesso!', 'don');
  handleForm('contact_form', 'msg_contato', '✅ Mensagem enviada com sucesso!', 'cont');

  // ---- Menu hambúrguer ----
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  toggle?.addEventListener('click', () => {
    const isActive = toggle.classList.toggle('active');
    nav?.classList.toggle('active');
    toggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
  });
  toggle?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle.click();
    }
  });

  // ---- Carrossel ----
  const carousel = document.querySelector('.carousel');
  if (carousel) {
    const gallery = carousel.querySelector('.gallery');
    const slides = gallery.querySelectorAll('picture');
    const prev = carousel.querySelector('.prev');
    const next = carousel.querySelector('.next');
    let index = 0;
    function showSlide(i) {
      index = (i + slides.length) % slides.length;
      gallery.style.transform = `translateX(${-index * 100}%)`;
    }
    prev?.addEventListener('click', () => showSlide(index - 1));
    next?.addEventListener('click', () => showSlide(index + 1));
    setInterval(() => showSlide(index + 1), 5000);
  }

  // ---- Gráficos ----
  const pizza = document.getElementById('chart_pizza');
  const line = document.getElementById('chart_line');
  const bars = document.getElementById('chart_bars');
  function resizeCanvasAndDraw(canvas, drawFn, ...args) {
    if (!canvas) return;
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = 320;
    drawFn(canvas, ...args);
  }
  function resizeAllCharts() {
    resizeCanvasAndDraw(pizza, drawPie, [75, 25], ['#2b7a78', '#56c596'], ['CodeGirls', 'Inclusão Digital']);
    resizeCanvasAndDraw(line, drawLine, [2, 5, 8, 12, 20, 25, 30], '#2b7a78');
    resizeCanvasAndDraw(bars, drawBars, [5, 15, 10, 30, 0], ['Norte', 'Nordeste', 'Sul', 'Sudeste', 'Centro-Oeste'], '#2b7a78');
  }
  window.addEventListener('resize', resizeAllCharts);
  setTimeout(resizeAllCharts, 100);
  resizeAllCharts();

  // ---- PDF ----
  function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(18);
    doc.text("Relatório de Transparência 2024", 10, 20);

    let yOffset = 30;
    const maxPdfWidth = 140;
    const maxPdfHeight = 100;

    function addCanvasToPDF(canvas, title) {
      if (!canvas) return;
      const imgData = canvas.toDataURL('image/png');
      const ratio = canvas.width / canvas.height;
      let pdfWidth = maxPdfWidth;
      let pdfHeight = pdfWidth / ratio;
      if (pdfHeight > maxPdfHeight) { pdfHeight = maxPdfHeight; pdfWidth = pdfHeight * ratio; }
      const xPos = (doc.internal.pageSize.width - pdfWidth) / 2;
      if (yOffset + pdfHeight + 20 > pageHeight) { doc.addPage(); yOffset = 20; }
      if (title) {
        doc.setFontSize(14);
        if (yOffset + 10 > pageHeight) { doc.addPage(); yOffset = 20; }
        doc.text(title, (doc.internal.pageSize.width - doc.getTextWidth(title)) / 2, yOffset);
        yOffset += 8;
      }
      doc.addImage(imgData, 'PNG', xPos, yOffset, pdfWidth, pdfHeight);
      yOffset += pdfHeight + 10;
    }

    addCanvasToPDF(pizza, "Participação por Programa");
    addCanvasToPDF(line, "Engajamento ao Longo do Ano");
    addCanvasToPDF(bars, "Distribuição Regional");

    const texto = `
O projeto AI4Her impactou diversas regiões em 2024, promovendo inclusão digital e participação feminina em STEM.
- No gráfico de pizza, 75% das participantes estiveram no CodeGirls e 25% em Inclusão Digital.
- O gráfico de linhas mostra o crescimento do engajamento ao longo do ano.
- O gráfico de barras evidencia a distribuição regional, com maior presença no Sudeste e Nordeste.
    `;
    const splitText = doc.splitTextToSize(texto, maxPdfWidth);
    if (yOffset + splitText.length * 6 > pageHeight) { doc.addPage(); yOffset = 20; }
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(splitText, (doc.internal.pageSize.width - maxPdfWidth) / 2, yOffset);

    doc.save("relatorio_transparencia_2024.pdf");
  }

  document.querySelectorAll('ul li a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      generatePDF();
    });
  });

});

// ---- Funções de desenho de gráficos ----
function drawPie(canvas, values, colors, labels) {
  const ctx = canvas.getContext('2d');
  const total = values.reduce((a, b) => a + b, 0);
  const cx = canvas.width / 2, cy = canvas.height / 2, r = Math.min(cx, cy) - 30;
  let start = -0.5 * Math.PI;

  for (let i = 0; i < values.length; i++) {
    const slice = (values[i] / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, start + slice);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    start += slice;
  }
}

function drawLine(canvas, data, stroke) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height, max = Math.max(...data), pad = 40;
  ctx.clearRect(0, 0, w, h);

  ctx.strokeStyle = "#ccc";
  ctx.beginPath(); ctx.moveTo(pad, h - pad); ctx.lineTo(w - pad, h - pad); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(pad, h - pad); ctx.lineTo(pad, pad); ctx.stroke();

  ctx.fillStyle = "#000"; ctx.font = "12px sans-serif";

  const steps = 5;
  for (let i = 0; i <= steps; i++) {
    const y = h - pad - ((h - 2 * pad) * (i / steps));
    ctx.fillText(Math.round(max * (i / steps)), 5, y + 4);
    ctx.beginPath(); ctx.strokeStyle = "#eee"; ctx.moveTo(pad, y); ctx.lineTo(w - pad, y); ctx.stroke();
  }

  ctx.beginPath(); ctx.lineWidth = 2; ctx.strokeStyle = stroke;
  const spacing = (w - 2 * pad) / (data.length - 1);
  for (let i = 0; i < data.length; i++) {
    const x = pad + i * spacing;
    const y = h - pad - ((h - 2 * pad) * (data[i] / max));
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    ctx.beginPath(); ctx.arc(x, y, 4, 0, 2 * Math.PI); ctx.fillStyle = stroke; ctx.fill();
  }
  ctx.stroke();
}

function drawBars(canvas, data, labels, color) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height, max = Math.max(...data), pad = 40;
  ctx.clearRect(0, 0, w, h);
  const barW = (w - 2 * pad) / data.length - 10;
  ctx.fillStyle = "#000"; ctx.font = "12px sans-serif";
  for (let i = 0; i < data.length; i++) {
    const x = pad + i * (barW + 10);
    const barH = (h - 2 * pad) * (data[i] / max);
    ctx.fillStyle = color; ctx.fillRect(x, h - pad - barH, barW, barH);
    ctx.fillStyle = "#111";
    ctx.fillText(data[i], x + 4, h - pad - barH - 6);
    ctx.fillText(labels[i], x + 2, h - 5);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const main = document.querySelector('main.container');
  if (!main) return;

  // ---- Inicialização de elementos ----
  function initCharts() {
    const pizza = document.getElementById('chart_pizza');
    const line = document.getElementById('chart_line');
    const bars = document.getElementById('chart_bars');

    function resizeCanvasAndDraw(canvas, drawFn, ...args) {
      if (!canvas) return;
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = 320;
      drawFn(canvas, ...args);
    }

    function resizeAllCharts() {
      resizeCanvasAndDraw(pizza, drawPie, [75, 25], ['#2b7a78', '#56c596'], ['CodeGirls', 'Inclusão Digital']);
      resizeCanvasAndDraw(line, drawLine, [2, 5, 8, 12, 20, 25, 30], '#2b7a78');
      resizeCanvasAndDraw(bars, drawBars, [5, 15, 10, 30, 0], ['Norte', 'Nordeste', 'Sul', 'Sudeste', 'Centro-Oeste'], '#2b7a78');
    }

    window.addEventListener('resize', resizeAllCharts);
    setTimeout(resizeAllCharts, 100);
    resizeAllCharts();
  }

  function initForms() {
    // Reaplica máscaras, formulários, mensagens, etc.
    document.querySelectorAll('input[data-mask]').forEach(input => {
      input.addEventListener('input', e => {
        const type = input.dataset.mask;
        if (type === 'cpf') input.value = maskCPF(input.value);
        if (type === 'phone') input.value = maskPhone(input.value);
        if (type === 'cep') input.value = maskCEP(input.value);
      });
    });

    // Formulários
    handleForm('form_vol', 'msg_vol', '✅ Obrigado! Sua inscrição como voluntário(a) foi enviada.');
    handleForm('donForm', 'msg_don', '✅ Obrigado! Sua doação foi enviada com sucesso.');
    handleForm('contact_form', 'msg_contato', '✅ Obrigado! Sua mensagem foi enviada com sucesso.');
  }

  function initCarousel() {
    const carousel = document.querySelector('.carousel');
    if (!carousel) return;

    const gallery = carousel.querySelector('.gallery');
    const slides = gallery.querySelectorAll('picture');
    const prev = carousel.querySelector('.prev');
    const next = carousel.querySelector('.next');
    let index = 0;

    function showSlide(i) {
      index = (i + slides.length) % slides.length;
      gallery.style.transform = `translateX(${-index * 100}%)`;
    }

    prev?.addEventListener('click', () => showSlide(index - 1));
    next?.addEventListener('click', () => showSlide(index + 1));
    setInterval(() => showSlide(index + 1), 5000);
  }

  function initMenu() {
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    toggle?.addEventListener('click', () => {
      nav?.classList.toggle('active');
      toggle.classList.toggle('active');
    });
  }

  function initAll() {
    initCharts();
    initForms();
    initCarousel();
    initMenu();
  }

  initAll(); // inicializa ao carregar a página

  // ---- Função para carregar SPA ----
  async function loadPage(href) {
    try {
      const response = await fetch(href);
      const text = await response.text();
      const parser = new DOMParser();
      const newDoc = parser.parseFromString(text, 'text/html');
      const newMain = newDoc.querySelector('main.container');

      if (newMain) {
        main.innerHTML = newMain.innerHTML;
        history.pushState(null, '', href);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Reinicializa scripts gerais
        initCarousel();
        initMenu();

        // Inicialização dos formulários
        if (href.includes('cadastros.html')) {
          initForms();
        }

        // Inicialização dos gráficos
        if (href.includes('transparencia.html')) {
          initCharts();
        }
      }
    } catch (err) {
      console.error('Erro ao carregar página SPA:', err);
    }
  }

  // ---- Links SPA ----
  document.body.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) return;

    e.preventDefault();
    loadPage(href);
  });

  // ---- Histórico SPA ----
  window.addEventListener('popstate', () => loadPage(location.href));
});
