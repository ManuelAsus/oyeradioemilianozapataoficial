// js/public.js
import { db } from '../services/firebase.js';
import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  arrayUnion
} from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js';

// ============================================================
// CONFIGURACIÓN DE REDES SOCIALES
// ============================================================
const SOCIAL_NETWORKS = [
  { key: 'facebook', label: 'Facebook', icon: 'ri-facebook-fill', baseUrl: 'https://facebook.com/' },
  { key: 'instagram', label: 'Instagram', icon: 'ri-instagram-fill', baseUrl: 'https://instagram.com/' },
  { key: 'twitter', label: 'X', icon: 'ri-twitter-x-fill', baseUrl: 'https://x.com/' },
  { key: 'tiktok', label: 'TikTok', icon: 'ri-tiktok-fill', baseUrl: 'https://tiktok.com/@' },
  { key: 'whatsapp', label: 'WhatsApp', icon: 'ri-whatsapp-fill', baseUrl: 'https://wa.me/' },
  { key: 'youtube', label: 'YouTube', icon: 'ri-youtube-fill', baseUrl: '' }
];

// ============================================================
// ELEMENTOS DEL DOM
// ============================================================
const currentShowTitle = document.getElementById('currentShow');
const nowPlayingTime = document.querySelector('.hero__now-playing-time');
const liveBadge = document.getElementById('liveBadge');
const liveDot = document.querySelector('.hero__live-dot');
const timelineTrack = document.getElementById('timelineTrack');
const newsGrid = document.getElementById('newsGrid');
const hostsGrid = document.querySelector('.hosts__grid');
const directoryGrid = document.querySelector('.directory__grid'); // NUEVO

// ============================================================
// VARIABLES DE ESTADO
// ============================================================
let streamingData = null;
let scheduleData = [];
let activeScheduleId = null;

// ============================================================
// 1. ESCUCHAR STREAMING
// ============================================================
const streamingDocRef = doc(db, 'streaming', 'config');
let streamingUnsubscribe = onSnapshot(streamingDocRef, (docSnap) => {
  if (docSnap.exists()) {
    streamingData = docSnap.data();
    console.log('📡 Streaming actualizado:', streamingData);
    actualizarStreamingUI();
  } else {
    console.warn('⚠️ No hay documento de streaming, usando valores por defecto');
    streamingData = {
      active: false,
      title: 'Sin programa',
      host: '',
      startTime: '00:00',
      endTime: '00:00',
      manual: false
    };
    actualizarStreamingUI();
  }
}, (error) => {
  console.error('❌ Error en snapshot streaming:', error);
});

// ============================================================
// 2. ESCUCHAR SCHEDULE
// ============================================================
const scheduleQuery = query(collection(db, 'schedule'), orderBy('time', 'asc'));
let scheduleUnsubscribe = onSnapshot(scheduleQuery, (snapshot) => {
  scheduleData = [];
  snapshot.forEach(doc => {
    scheduleData.push({ id: doc.id, ...doc.data() });
  });
  console.log('📅 Programación actualizada:', scheduleData.length, 'programas');
  renderTimeline();
  if (streamingData && !streamingData.manual) {
    actualizarProgramaAutomatico();
  }
}, (error) => {
  console.error('❌ Error en snapshot schedule:', error);
});

// ============================================================
// 3. ESCUCHAR NOTICIAS
// ============================================================
const newsQuery = query(collection(db, 'news'), orderBy('date', 'desc'));
let newsUnsubscribe = onSnapshot(newsQuery, (snapshot) => {
  const noticias = [];
  snapshot.forEach(doc => {
    noticias.push({ id: doc.id, ...doc.data() });
  });
  console.log('📰 Noticias actualizadas:', noticias.length);
  renderNews(noticias);
}, (error) => {
  console.error('❌ Error en snapshot news:', error);
  if (newsGrid) newsGrid.innerHTML = `<p style="color: var(--gray-500); text-align:center; padding:2rem;">Error al cargar noticias.</p>`;
});

// ============================================================
// 4. ESCUCHAR LOCUTORES
// ============================================================
const locutorQuery = query(collection(db, 'announcers'), orderBy('name', 'asc'));
let locutorUnsubscribe = onSnapshot(locutorQuery, (snapshot) => {
  const locutores = [];
  snapshot.forEach(doc => {
    locutores.push({ id: doc.id, ...doc.data() });
  });
  console.log('🎙️ Locutores actualizados:', locutores.length);
  renderLocutores(locutores);
}, (error) => {
  console.error('❌ Error en snapshot locutores:', error);
  if (hostsGrid) hostsGrid.innerHTML = `<p style="color: var(--gray-500); text-align:center; padding:2rem;">Error al cargar locutores.</p>`;
});

// ============================================================
// 5. NUEVO: ESCUCHAR DIRECTORIO
// ============================================================
const directoryQuery = query(collection(db, 'directory'), orderBy('name', 'asc'));
let directoryUnsubscribe = onSnapshot(directoryQuery, (snapshot) => {
  const negocios = [];
  snapshot.forEach(doc => {
    negocios.push({ id: doc.id, ...doc.data() });
  });
  console.log('🏢 Directorio actualizado:', negocios.length);
  renderDirectorio(negocios);
}, (error) => {
  console.error('❌ Error en snapshot directorio:', error);
  if (directoryGrid) directoryGrid.innerHTML = `<p style="color: var(--gray-500); text-align:center; padding:2rem;">Error al cargar directorio.</p>`;
});

// ============================================================
// 6. FUNCIÓN PARA ACTUALIZAR LA UI DEL STREAMING
// ============================================================
function actualizarStreamingUI() {
  if (!streamingData) return;

  const { active, title, host, startTime, endTime, manual } = streamingData;

  if (title && host) {
    currentShowTitle.textContent = `${title} con ${host}`;
  } else {
    currentShowTitle.textContent = 'Sin programa en vivo';
  }

  if (startTime && endTime) {
    nowPlayingTime.textContent = `${startTime} - ${endTime}`;
  } else {
    nowPlayingTime.textContent = 'Horario no disponible';
  }

  if (active) {
    liveBadge.style.display = 'flex';
    liveDot.style.background = '#ff3b3b';
    liveDot.style.boxShadow = '0 0 12px #ff3b3b';
  } else {
    liveBadge.style.display = 'none';
  }

  if (!manual) {
    actualizarProgramaAutomatico();
  }
}

// ============================================================
// 7. FUNCIÓN PARA CALCULAR PROGRAMA AUTOMÁTICO
// ============================================================
function actualizarProgramaAutomatico() {
  if (!scheduleData.length) return;

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;

  let programas = scheduleData.map(prog => {
    const [h, m] = prog.time.split(':').map(Number);
    const minutes = h * 60 + m;
    return { ...prog, minutes };
  });

  programas.sort((a, b) => a.minutes - b.minutes);

  let programaActual = null;
  for (let i = programas.length - 1; i >= 0; i--) {
    if (programas[i].minutes <= currentTimeMinutes) {
      programaActual = programas[i];
      break;
    }
  }
  if (!programaActual && programas.length) {
    programaActual = programas[programas.length - 1];
  }

  if (programaActual) {
    const { title, host, time, id } = programaActual;
    currentShowTitle.textContent = `${title} con ${host}`;
    const idx = programas.indexOf(programaActual);
    const nextProgram = programas[idx + 1] || programas[0];
    const endTime = nextProgram ? nextProgram.time : '...';
    nowPlayingTime.textContent = `${time} - ${endTime}`;

    liveBadge.style.display = 'flex';
    liveDot.style.background = '#ff3b3b';
    liveDot.style.boxShadow = '0 0 12px #ff3b3b';

    resaltarProgramaActivo(id);
  }
}

// ============================================================
// 8. RENDERIZAR TIMELINE
// ============================================================
function renderTimeline() {
  if (!timelineTrack) return;
  if (!scheduleData.length) {
    timelineTrack.innerHTML = '<p style="color: #737373; text-align: center; padding: 1rem;">Sin programación aún</p>';
    return;
  }

  let html = '';
  scheduleData.forEach((prog) => {
    const isActive = (streamingData && !streamingData.manual && prog.id === activeScheduleId) ||
                     (streamingData && streamingData.manual && streamingData.title === prog.title && streamingData.host === prog.host);
    const activeClass = isActive ? 'timeline__item--active' : '';
    const badgeHTML = prog.badge ? `<span class="timeline__card-badge">${prog.badge}</span>` : '';
    html += `
      <div class="timeline__item ${activeClass}" data-id="${prog.id}">
        <div class="timeline__time">${prog.time}</div>
        <div class="timeline__card">
          <div class="timeline__card-dot"></div>
          <h4 class="timeline__card-title">${prog.title}</h4>
          <p class="timeline__card-host">${prog.host}</p>
          ${badgeHTML}
        </div>
      </div>
    `;
  });

  timelineTrack.innerHTML = html;

  document.querySelectorAll('.timeline__item').forEach(item => {
    item.addEventListener('click', function() {
      document.querySelectorAll('.timeline__item').forEach(i => i.classList.remove('timeline__item--active'));
      this.classList.add('timeline__item--active');
      const id = this.dataset.id;
      const prog = scheduleData.find(p => p.id === id);
      if (prog) {
        currentShowTitle.textContent = `${prog.title} con ${prog.host}`;
        const idx = scheduleData.indexOf(prog);
        const next = scheduleData[idx + 1] || scheduleData[0];
        nowPlayingTime.textContent = `${prog.time} - ${next.time}`;
        liveBadge.style.display = 'flex';
        liveDot.style.background = '#ff3b3b';
        liveDot.style.boxShadow = '0 0 12px #ff3b3b';
      }
    });
  });
}

function resaltarProgramaActivo(programaId) {
  activeScheduleId = programaId;
  document.querySelectorAll('.timeline__item').forEach(item => {
    item.classList.toggle('timeline__item--active', item.dataset.id === programaId);
  });
}

// ============================================================
// 9. RENDERIZAR NOTICIAS
// ============================================================
function renderNews(noticias) {
  if (!newsGrid) return;

  if (!noticias || noticias.length === 0) {
    newsGrid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; color: var(--gray-500); padding:2rem;">
        <p>No hay noticias disponibles en este momento.</p>
      </div>
    `;
    return;
  }

  let html = '';
  noticias.forEach((nota, index) => {
    let imgHtml = '';
    if (nota.imageChunks && nota.imageChunks.length > 0 && nota.imageType) {
      const base64 = nota.imageChunks.join('');
      imgHtml = `<img src="data:${nota.imageType};base64,${base64}" alt="${nota.title}" loading="lazy" />`;
    } else {
      imgHtml = `<div style="background: var(--gray-800); width:100%; height:100%; display:flex; align-items:center; justify-content:center; color: var(--gray-500);"><i class="ri-image-line" style="font-size:2rem;"></i></div>`;
    }

    const isFeatured = index === 0 ? 'news-card--featured' : '';
    const cardClass = `news-card glass-card ${isFeatured}`;

    html += `
      <article class="${cardClass}">
        <div class="news-card__image">
          ${imgHtml}
          <span class="news-card__category">${nota.category || 'Noticia'}</span>
        </div>
        <div class="news-card__body">
          <time class="news-card__date">${nota.date || ''}</time>
          <h3 class="news-card__title">${nota.title}</h3>
          <p class="news-card__excerpt">${nota.description || ''}</p>
          <a href="${nota.facebookLink || '#'}" target="_blank" rel="noopener" class="news-card__link">
            <i class="ri-facebook-fill"></i> Leer más <i class="ri-arrow-right-line"></i>
          </a>
        </div>
      </article>
    `;
  });

  newsGrid.innerHTML = html;
}

// ============================================================
// 10. RENDERIZAR LOCUTORES
// ============================================================
function renderLocutores(locutores) {
  if (!hostsGrid) return;

  if (!locutores || locutores.length === 0) {
    hostsGrid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; color: var(--gray-500); padding:2rem;">
        <p>Pronto conocerás a nuestro talento.</p>
      </div>
    `;
    return;
  }

  let html = '';
  locutores.forEach(loc => {
    let avatarHtml = '';
    if (loc.imageChunks && loc.imageChunks.length > 0 && loc.imageType) {
      const base64 = loc.imageChunks.join('');
      avatarHtml = `<img src="data:${loc.imageType};base64,${base64}" alt="${loc.name}" loading="lazy" />`;
    } else {
      avatarHtml = `<div style="width:100%;height:100%;background:var(--gray-800);border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--gray-500);font-size:3rem;"><i class="ri-user-3-fill"></i></div>`;
    }

    let socialHtml = '';
    if (loc.social && typeof loc.social === 'object') {
      SOCIAL_NETWORKS.forEach(net => {
        const value = loc.social[net.key];
        if (value) {
          let href = '#';
          if (net.key === 'youtube') {
            href = value;
          } else if (net.key === 'whatsapp') {
            href = net.baseUrl + value + '?text=Hola%20vengo%20del%20sitio%20de%20Oye99.9';
          } else {
            href = net.baseUrl + value;
          }
          socialHtml += `
            <a href="${href}" target="_blank" rel="noopener" aria-label="${net.label}">
              <i class="${net.icon}"></i>
            </a>
          `;
        }
      });
    }

    html += `
      <div class="host-card glass-card">
        <div class="host-card__avatar">
          ${avatarHtml}
          <div class="host-card__avatar-ring"></div>
        </div>
        <h3 class="host-card__name">${loc.name}</h3>
        <span class="host-card__role">${loc.role || ''}</span>
        <p class="host-card__bio">${loc.description || ''}</p>
        <div class="host-card__social">
          ${socialHtml || '<span style="color:var(--gray-500);font-size:0.8rem;">Sin redes</span>'}
        </div>
      </div>
    `;
  });

  hostsGrid.innerHTML = html;
}

// ============================================================
// 11. NUEVO: RENDERIZAR DIRECTORIO
// ============================================================
function renderDirectorio(negocios) {
  if (!directoryGrid) return;

  if (!negocios || negocios.length === 0) {
    directoryGrid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; color: var(--gray-500); padding:2rem;">
        <p>Próximamente más negocios afiliados.</p>
      </div>
    `;
    return;
  }

  let html = '';
  negocios.forEach((item, index) => {
    // Imagen
    let imgHtml = '';
    if (item.imageChunks && item.imageChunks.length > 0 && item.imageType) {
      const base64 = item.imageChunks.join('');
      imgHtml = `<img src="data:${item.imageType};base64,${base64}" alt="${item.name}" loading="lazy" />`;
    } else {
      imgHtml = `<div style="background: var(--gray-800); width:100%; height:100%; display:flex; align-items:center; justify-content:center; color: var(--gray-500);"><i class="ri-store-3-line" style="font-size:2.5rem;"></i></div>`;
    }

    // Procesar contactos para los botones
    const phoneContacts = (item.contacts || []).filter(c => c.type === 'phone');
    const whatsappContacts = (item.contacts || []).filter(c => c.type === 'whatsapp');

    // Botón Llamar
    let callButtonHtml = '';
    if (phoneContacts.length === 1) {
      const number = phoneContacts[0].number;
      callButtonHtml = `
        <a href="tel:${number}" class="btn btn--primary btn--sm">
          <i class="ri-phone-fill"></i> Llamar
        </a>
      `;
    } else if (phoneContacts.length > 1) {
      // Varios números: mostrar un menú desplegable al hacer clic
      const options = phoneContacts.map(c => `'${c.number}'`).join(', ');
      callButtonHtml = `
        <button class="btn btn--primary btn--sm" onclick="mostrarOpcionesTelefono([${options}])">
          <i class="ri-phone-fill"></i> Llamar
        </button>
      `;
    } else {
      callButtonHtml = `<span style="color:var(--gray-500);font-size:0.8rem;">Sin teléfono</span>`;
    }

    // Botón WhatsApp
    let whatsappButtonHtml = '';
    if (whatsappContacts.length === 1) {
      const number = whatsappContacts[0].number;
      whatsappButtonHtml = `
        <a href="https://wa.me/${number}?text=Hola%20vengo%20del%20sitio%20de%20Oye99.9" target="_blank" rel="noopener" class="btn btn--glass btn--sm">
          <i class="ri-whatsapp-fill"></i> Pedir a domicilio
        </a>
      `;
    } else if (whatsappContacts.length > 1) {
      const options = whatsappContacts.map(c => `'${c.number}'`).join(', ');
      whatsappButtonHtml = `
        <button class="btn btn--glass btn--sm" onclick="mostrarOpcionesWhatsApp([${options}])">
          <i class="ri-whatsapp-fill"></i> Pedir a domicilio
        </button>
      `;
    } else {
      whatsappButtonHtml = `<span style="color:var(--gray-500);font-size:0.8rem;">Sin WhatsApp</span>`;
    }

    // Dirección y teléfonos para mostrar
    const displayPhone = phoneContacts.map(c => c.number).join(', ');
    const displayWhatsapp = whatsappContacts.map(c => c.number).join(', ');

    html += `
      <article class="directory-card glass-card" data-id="${item.id}">
        <div class="directory-card__image" style="cursor:pointer;" onclick="abrirLightbox('${item.id}')">
          ${imgHtml}
          <span class="directory-card__badge">${item.badge || 'Negocio'}</span>
        </div>
        <div class="directory-card__body">
          <h3 class="directory-card__title">${item.name}</h3>
          <p class="directory-card__desc">${item.description || ''}</p>
          <div class="directory-card__info">
            <div class="directory-card__info-item">
              <i class="ri-map-pin-line"></i>
              <span>${item.address || ''}</span>
            </div>
            ${displayPhone ? `<div class="directory-card__info-item"><i class="ri-phone-line"></i><span>${displayPhone}</span></div>` : ''}
            ${displayWhatsapp ? `<div class="directory-card__info-item"><i class="ri-whatsapp-line"></i><span>${displayWhatsapp}</span></div>` : ''}
          </div>
          <div class="directory-card__actions">
            ${callButtonHtml}
            ${whatsappButtonHtml}
          </div>
        </div>
      </article>
    `;
  });

  directoryGrid.innerHTML = html;

  // Almacenar los datos para el lightbox
  window.__directoryData = negocios;
}

// ============================================================
// 12. LIGHTBOX PARA IMÁGENES DEL DIRECTORIO
// ============================================================
// Función global para abrir lightbox
window.abrirLightbox = function(id) {
  const negocio = window.__directoryData?.find(n => n.id === id);
  if (!negocio) return;

  let imageSrc = '';
  if (negocio.imageChunks && negocio.imageChunks.length > 0 && negocio.imageType) {
    const base64 = negocio.imageChunks.join('');
    imageSrc = `data:${negocio.imageType};base64,${base64}`;
  } else {
    return; // sin imagen
  }

  // Crear overlay
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = `
    <div class="lightbox-content">
      <img src="${imageSrc}" alt="${negocio.name}" />
      <button class="lightbox-close">&times;</button>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.classList.contains('lightbox-close')) {
      overlay.remove();
    }
  });
};

// ============================================================
// 13. FUNCIONES PARA MÚLTIPLES CONTACTOS (Teléfono / WhatsApp)
// ============================================================
window.mostrarOpcionesTelefono = function(numbers) {
  if (!numbers || numbers.length === 0) return;
  if (numbers.length === 1) {
    window.location.href = 'tel:' + numbers[0];
    return;
  }
  // Mostrar un selector simple (confirm con opciones numeradas)
  const opciones = numbers.map((num, i) => `${i+1}. ${num}`).join('\n');
  const seleccion = prompt(`Selecciona un número para llamar:\n${opciones}`);
  if (seleccion !== null) {
    const idx = parseInt(seleccion) - 1;
    if (idx >= 0 && idx < numbers.length) {
      window.location.href = 'tel:' + numbers[idx];
    } else {
      alert('Selección no válida.');
    }
  }
};

window.mostrarOpcionesWhatsApp = function(numbers) {
  if (!numbers || numbers.length === 0) return;
  if (numbers.length === 1) {
    window.open(`https://wa.me/${numbers[0]}?text=Hola%20vengo%20del%20sitio%20de%20Oye99.9`, '_blank');
    return;
  }
  const opciones = numbers.map((num, i) => `${i+1}. ${num}`).join('\n');
  const seleccion = prompt(`Selecciona un número para WhatsApp:\n${opciones}`);
  if (seleccion !== null) {
    const idx = parseInt(seleccion) - 1;
    if (idx >= 0 && idx < numbers.length) {
      window.open(`https://wa.me/${numbers[idx]}?text=Hola%20vengo%20del%20sitio%20de%20Oye99.9`, '_blank');
    } else {
      alert('Selección no válida.');
    }
  }
};

// ============================================================
// 14. INICIALIZAR
// ============================================================
// ============================================================
// 15. VISOR WEBRTC - Emisión en Vivo
// ============================================================
const VIEWER_ICE = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};
const BCAST_PATH_V = ['liveStream', 'broadcast'];

let viewerPc = null;
let viewerId = null;
let viewerConnected = false;

const broadcastConfigRef = doc(db, ...BCAST_PATH_V);

onSnapshot(broadcastConfigRef, async (docSnap) => {
  if (docSnap.exists()) {
    const data = docSnap.data();
    if (data.active && !viewerConnected) {
      viewerConnected = true;
      await conectarComoViewer(data);
    } else if (!data.active && viewerConnected) {
      viewerConnected = false;
      desconectarViewer();
    }
  } else if (viewerConnected) {
    viewerConnected = false;
    desconectarViewer();
  }
}, (err) => console.error('Error watching broadcast config:', err));

async function conectarComoViewer(broadcastData) {
  try {
    viewerId = 'v_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
    viewerPc = new RTCPeerConnection(VIEWER_ICE);

    viewerPc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        mostrarVideoEnVivo(event.streams[0]);
      }
    };

    viewerPc.onconnectionstatechange = () => {
      if (viewerPc && (viewerPc.connectionState === 'disconnected' || viewerPc.connectionState === 'failed')) {
        ocultarVideoEnVivo();
      }
    };

    const viewerRef = doc(db, ...BCAST_PATH_V, 'viewers', viewerId);

    viewerPc.onicecandidate = async ({ candidate }) => {
      if (candidate) {
        try { await updateDoc(viewerRef, { viewerCandidates: arrayUnion(candidate.toJSON()) }); }
        catch (e) { console.warn('viewer ICE store error:', e); }
      }
    };

    await setDoc(viewerRef, {
      requesting: true,
      sessionId: broadcastData.sessionId,
      createdAt: new Date().toISOString(),
      bcCandidates: [],
      viewerCandidates: []
    });

    let lastBcCandCount = 0;
    let offerApplied = false;

    const unsubViewer = onSnapshot(viewerRef, async (snap) => {
      const data = snap.data();
      if (!data || !viewerPc) return;

      if (data.offerSDP && !offerApplied && viewerPc.signalingState === 'stable') {
        offerApplied = true;
        try {
          await viewerPc.setRemoteDescription({ sdp: data.offerSDP, type: data.offerType });
          const answer = await viewerPc.createAnswer();
          await viewerPc.setLocalDescription(answer);
          await updateDoc(viewerRef, { answerSDP: answer.sdp, answerType: answer.type });
        } catch (e) { console.error('Error creando answer:', e); }
      }

      const bcCands = data.bcCandidates || [];
      for (let i = lastBcCandCount; i < bcCands.length; i++) {
        try { await viewerPc.addIceCandidate(new RTCIceCandidate(bcCands[i])); }
        catch (e) { console.warn('addIceCandidate error:', e); }
      }
      lastBcCandCount = bcCands.length;
    });

    viewerPc._unsub = unsubViewer;

  } catch (err) {
    console.error('Error conectando como viewer:', err);
    viewerConnected = false;
  }
}

function desconectarViewer() {
  if (viewerPc) {
    if (viewerPc._unsub) viewerPc._unsub();
    viewerPc.close();
    viewerPc = null;
  }
  if (viewerId) {
    deleteDoc(doc(db, ...BCAST_PATH_V, 'viewers', viewerId)).catch(() => {});
    viewerId = null;
  }
  ocultarVideoEnVivo();
}

function mostrarVideoEnVivo(stream) {
  const video = document.getElementById('liveVideoElement');
  const placeholder = document.querySelector('.hero__player-placeholder');
  if (!video) return;
  video.srcObject = stream;
  video.muted = true;
  const hasVideoTrack = stream.getVideoTracks().length > 0;
  video.style.display = hasVideoTrack ? 'block' : 'none';
  if (placeholder) placeholder.style.display = hasVideoTrack ? 'none' : '';
  if (hasVideoTrack) {
    video.play().catch(() => {});
  }

  // Mostrar botón de activar sonido
  let btn = document.getElementById('liveUnmuteBtn');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'liveUnmuteBtn';
    btn.className = 'live-unmute-btn';
    btn.innerHTML = '<i class="ri-volume-mute-fill"></i> Activar sonido';
    btn.addEventListener('click', () => {
      video.muted = false;
      btn.remove();
    });
    video.parentElement.appendChild(btn);
  }
}

function ocultarVideoEnVivo() {
  const video = document.getElementById('liveVideoElement');
  const placeholder = document.querySelector('.hero__player-placeholder');
  const btn = document.getElementById('liveUnmuteBtn');
  if (video) { video.style.display = 'none'; video.srcObject = null; }
  if (placeholder) placeholder.style.display = '';
  if (btn) btn.remove();
}

window.addEventListener('beforeunload', () => {
  if (viewerId) deleteDoc(doc(db, ...BCAST_PATH_V, 'viewers', viewerId)).catch(() => {});
  if (viewerPc) { if (viewerPc._unsub) viewerPc._unsub(); viewerPc.close(); }
});

console.log('🎙️ Oye 99.9 - Frontend Público con Firebase');