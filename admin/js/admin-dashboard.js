// admin/js/admin-dashboard.js
import { auth, db } from '../../services/firebase.js';
import {
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  arrayUnion
} from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js';

// ============================================================
// CONFIGURACIÓN DE REDES SOCIALES (para locutores)
// ============================================================
const SOCIAL_NETWORKS = [
  { key: 'facebook', label: 'Facebook', icon: 'ri-facebook-fill', placeholder: 'nombre_usuario', baseUrl: 'https://facebook.com/' },
  { key: 'instagram', label: 'Instagram', icon: 'ri-instagram-fill', placeholder: '@usuario', baseUrl: 'https://instagram.com/' },
  { key: 'twitter', label: 'X', icon: 'ri-twitter-x-fill', placeholder: '@usuario', baseUrl: 'https://x.com/' },
  { key: 'tiktok', label: 'TikTok', icon: 'ri-tiktok-fill', placeholder: '@usuario', baseUrl: 'https://tiktok.com/@' },
  { key: 'whatsapp', label: 'WhatsApp', icon: 'ri-whatsapp-fill', placeholder: 'número con código país', baseUrl: 'https://wa.me/' },
  { key: 'youtube', label: 'YouTube', icon: 'ri-youtube-fill', placeholder: 'URL completa del canal', baseUrl: '' }
];

// ============================================================
// ELEMENTOS DOM
// ============================================================
const sections = {
  inicio: document.getElementById('inicio'),
  programacion: document.getElementById('programacion'),
  noticias: document.getElementById('noticias'),
  locutores: document.getElementById('locutores'),
  directorio: document.getElementById('directorio')
};
const navLinks = document.querySelectorAll('.nav-link');
const sectionTitle = document.getElementById('sectionTitle');
const userEmailSpan = document.getElementById('adminUserEmail');
const logoutBtn = document.getElementById('logoutBtn');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('adminSidebar');

// Emisión WebRTC
const captureTypeCameraBtn = document.getElementById('captureTypeCamera');
const captureTypeScreenBtn = document.getElementById('captureTypeScreen');
const captureTypeAudioBtn = document.getElementById('captureTypeAudio');
const captureTypeSystemAudioBtn = document.getElementById('captureTypeSystemAudio');
const deviceSelectorsGroup = document.getElementById('deviceSelectorsGroup');
const cameraSelect = document.getElementById('cameraSelect');
const cameraSelectorWrapper = document.getElementById('cameraSelectorWrapper');
const micSelect = document.getElementById('micSelect');
const detectDevicesBtn = document.getElementById('detectDevicesBtn');
const localPreviewVideo = document.getElementById('localPreviewVideo');
const broadcastPreviewPlaceholder = document.getElementById('broadcastPreviewPlaceholder');
const broadcastPreviewWrapper = document.getElementById('broadcastPreviewWrapper');
const startBroadcastBtn = document.getElementById('startBroadcastBtn');
const stopBroadcastBtn = document.getElementById('stopBroadcastBtn');
const micLiveToggle = document.getElementById('micToggleWrap');
const micToggleWrap = micLiveToggle;
const broadcastLiveInfo = document.getElementById('broadcastLiveInfo');
const bcastViewerNum = document.getElementById('bcastViewerNum');
const broadcastMessage = document.getElementById('broadcastMessage');

// Streaming
const liveToggle = document.getElementById('liveToggle');
const liveStatusText = document.getElementById('liveStatusText');
const programTitle = document.getElementById('programTitle');
const programHost = document.getElementById('programHost');
const startTime = document.getElementById('startTime');
const endTime = document.getElementById('endTime');
const streamingForm = document.getElementById('streamingForm');
const streamingMessage = document.getElementById('streamingMessage');

// Programación
const scheduleList = document.getElementById('scheduleList');
const addScheduleBtn = document.getElementById('addScheduleBtn');
const scheduleModal = document.getElementById('scheduleModal');
const modalClose = document.getElementById('modalClose');
const modalTitle = document.getElementById('modalTitle');
const scheduleForm = document.getElementById('scheduleForm');
const scheduleEditId = document.getElementById('scheduleEditId');
const scheduleTime = document.getElementById('scheduleTime');
const scheduleTitle = document.getElementById('scheduleTitle');
const scheduleHost = document.getElementById('scheduleHost');
const scheduleBadge = document.getElementById('scheduleBadge');
const scheduleSubmitBtn = document.getElementById('scheduleSubmitBtn');
const scheduleCancelBtn = document.getElementById('scheduleCancelBtn');
const scheduleFormMessage = document.getElementById('scheduleFormMessage');

// Noticias
const newsList = document.getElementById('newsList');
const addNewsBtn = document.getElementById('addNewsBtn');
const newsModal = document.getElementById('newsModal');
const newsModalClose = document.getElementById('newsModalClose');
const newsModalTitle = document.getElementById('newsModalTitle');
const newsForm = document.getElementById('newsForm');
const newsEditId = document.getElementById('newsEditId');
const newsTitle = document.getElementById('newsTitle');
const newsDescription = document.getElementById('newsDescription');
const newsDate = document.getElementById('newsDate');
const newsFacebookLink = document.getElementById('newsFacebookLink');
const newsImage = document.getElementById('newsImage');
const newsImagePreview = document.getElementById('newsImagePreview');
const newsSubmitBtn = document.getElementById('newsSubmitBtn');
const newsCancelBtn = document.getElementById('newsCancelBtn');
const newsFormMessage = document.getElementById('newsFormMessage');

// Locutores
const locutorList = document.getElementById('locutorList');
const addLocutorBtn = document.getElementById('addLocutorBtn');
const locutorModal = document.getElementById('locutorModal');
const locutorModalClose = document.getElementById('locutorModalClose');
const locutorModalTitle = document.getElementById('locutorModalTitle');
const locutorForm = document.getElementById('locutorForm');
const locutorEditId = document.getElementById('locutorEditId');
const locutorName = document.getElementById('locutorName');
const locutorRole = document.getElementById('locutorRole');
const locutorDescription = document.getElementById('locutorDescription');
const locutorImage = document.getElementById('locutorImage');
const locutorImagePreview = document.getElementById('locutorImagePreview');
const locutorSubmitBtn = document.getElementById('locutorSubmitBtn');
const locutorCancelBtn = document.getElementById('locutorCancelBtn');
const locutorFormMessage = document.getElementById('locutorFormMessage');
const socialCheckboxes = document.getElementById('socialCheckboxes');

// Directorio
const directoryList = document.getElementById('directoryList');
const addDirectoryBtn = document.getElementById('addDirectoryBtn');
const directoryModal = document.getElementById('directoryModal');
const directoryModalClose = document.getElementById('directoryModalClose');
const directoryModalTitle = document.getElementById('directoryModalTitle');
const directoryForm = document.getElementById('directoryForm');
const directoryEditId = document.getElementById('directoryEditId');
const directoryBadge = document.getElementById('directoryBadge');
const directoryName = document.getElementById('directoryName');
const directoryDescription = document.getElementById('directoryDescription');
const directoryAddress = document.getElementById('directoryAddress');
const directoryImage = document.getElementById('directoryImage');
const directoryImagePreview = document.getElementById('directoryImagePreview');
const directorySubmitBtn = document.getElementById('directorySubmitBtn');
const directoryCancelBtn = document.getElementById('directoryCancelBtn');
const directoryFormMessage = document.getElementById('directoryFormMessage');
const contactsContainer = document.getElementById('contactsContainer');
const addContactBtn = document.getElementById('addContactBtn');

// ============================================================
// AUTENTICACIÓN
// ============================================================
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  userEmailSpan.textContent = user.email;
  cargarDatosIniciales();
});

logoutBtn.addEventListener('click', () => {
  signOut(auth).then(() => {
    window.location.href = 'index.html';
  });
});

// ============================================================
// NAVEGACIÓN (Sidebar)
// ============================================================
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const section = link.dataset.section;
    if (!section || link.style.pointerEvents === 'none') return;

    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    Object.keys(sections).forEach(key => {
      sections[key].classList.toggle('active', key === section);
    });

    sectionTitle.textContent = link.textContent.trim();
    closeSidebar();
  });
});

// ============================================================
// MENÚ MÓVIL
// ============================================================
menuToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  sidebar.classList.toggle('open');
  document.querySelector('.sidebar-overlay')?.classList.toggle('open');
});

document.addEventListener('click', (e) => {
  if (window.innerWidth <= 768) {
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay && overlay.classList.contains('open') && !sidebar.contains(e.target) && e.target !== menuToggle) {
      closeSidebar();
    }
  }
});

function closeSidebar() {
  sidebar.classList.remove('open');
  document.querySelector('.sidebar-overlay')?.classList.remove('open');
}

const overlay = document.createElement('div');
overlay.className = 'sidebar-overlay';
document.body.appendChild(overlay);
overlay.addEventListener('click', closeSidebar);

// ============================================================
// CARGAR DATOS INICIALES
// ============================================================
let streamingUnsubscribe = null;
let scheduleUnsubscribe = null;
let newsUnsubscribe = null;
let locutorUnsubscribe = null;
let directoryUnsubscribe = null;

async function cargarDatosIniciales() {
  // Streaming
  const streamingDocRef = doc(db, 'streaming', 'config');
  streamingUnsubscribe = onSnapshot(streamingDocRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      actualizarStreamingUI(data);
    } else {
      const defaultData = {
        active: false,
        title: 'Morning Vibes',
        host: 'Ale Moreno',
        startTime: '06:00',
        endTime: '10:00',
        manual: true,
        updatedAt: serverTimestamp()
      };
      setDoc(streamingDocRef, defaultData);
      actualizarStreamingUI(defaultData);
    }
  }, (error) => {
    console.error('Error en snapshot streaming:', error);
    mostrarMensaje(streamingMessage, 'Error al cargar transmisión: ' + error.message, 'error');
  });

  // Schedule
  const scheduleQuery = query(collection(db, 'schedule'), orderBy('time', 'asc'));
  scheduleUnsubscribe = onSnapshot(scheduleQuery, (snapshot) => {
    const programas = [];
    snapshot.forEach(doc => {
      programas.push({ id: doc.id, ...doc.data() });
    });
    renderSchedule(programas);
  }, (error) => {
    console.error('Error en snapshot schedule:', error);
    scheduleList.innerHTML = `<p class="empty-text">Error al cargar programación.</p>`;
  });

  // News
  const newsQuery = query(collection(db, 'news'), orderBy('date', 'desc'));
  newsUnsubscribe = onSnapshot(newsQuery, (snapshot) => {
    const noticias = [];
    snapshot.forEach(doc => {
      noticias.push({ id: doc.id, ...doc.data() });
    });
    renderNews(noticias);
  }, (error) => {
    console.error('Error en snapshot news:', error);
    newsList.innerHTML = `<p class="empty-text">Error al cargar noticias.</p>`;
  });

  // Locutores
  const locutorQuery = query(collection(db, 'announcers'), orderBy('name', 'asc'));
  locutorUnsubscribe = onSnapshot(locutorQuery, (snapshot) => {
    const locutores = [];
    snapshot.forEach(doc => {
      locutores.push({ id: doc.id, ...doc.data() });
    });
    renderLocutores(locutores);
  }, (error) => {
    console.error('Error en snapshot locutores:', error);
    locutorList.innerHTML = `<p class="empty-text">Error al cargar locutores.</p>`;
  });

  // Directorio
  const directoryQuery = query(collection(db, 'directory'), orderBy('name', 'asc'));
  directoryUnsubscribe = onSnapshot(directoryQuery, (snapshot) => {
    const negocios = [];
    snapshot.forEach(doc => {
      negocios.push({ id: doc.id, ...doc.data() });
    });
    renderDirectory(negocios);
  }, (error) => {
    console.error('Error en snapshot directorio:', error);
    directoryList.innerHTML = `<p class="empty-text">Error al cargar directorio.</p>`;
  });
}

// ============================================================
// STREAMING UI
// ============================================================
function actualizarStreamingUI(data) {
  liveToggle.checked = data.active || false;
  liveStatusText.textContent = data.active ? 'En vivo' : 'Inactivo';
  liveStatusText.className = 'status-text ' + (data.active ? 'active' : 'inactive');
  programTitle.value = data.title || '';
  programHost.value = data.host || '';
  startTime.value = data.startTime || '06:00';
  endTime.value = data.endTime || '10:00';
}

streamingForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const active = liveToggle.checked;
  const title = programTitle.value.trim();
  const host = programHost.value.trim();
  const start = startTime.value;
  const end = endTime.value;

  if (!title || !host || !start || !end) {
    mostrarMensaje(streamingMessage, 'Todos los campos son obligatorios.', 'error');
    return;
  }

  try {
    const docRef = doc(db, 'streaming', 'config');
    await setDoc(docRef, {
      active,
      title,
      host,
      startTime: start,
      endTime: end,
      manual: true,
      updatedAt: serverTimestamp()
    }, { merge: true });
    mostrarMensaje(streamingMessage, '✅ Cambios guardados correctamente.', 'success');
  } catch (error) {
    console.error('Error guardando streaming:', error);
    mostrarMensaje(streamingMessage, '❌ Error al guardar: ' + error.message, 'error');
  }
});

document.getElementById('autoRestoreBtn').addEventListener('click', async () => {
  if (!confirm('¿Restaurar el programa actual automáticamente según la programación?')) return;
  try {
    const docRef = doc(db, 'streaming', 'config');
    await setDoc(docRef, {
      manual: false,
      updatedAt: serverTimestamp()
    }, { merge: true });
    mostrarMensaje(streamingMessage, '✅ Modo automático activado.', 'success');
  } catch (error) {
    console.error('Error restaurando automático:', error);
    mostrarMensaje(streamingMessage, '❌ Error: ' + error.message, 'error');
  }
});

// ============================================================
// EMISIÓN EN VIVO (WebRTC)
// ============================================================
const BROADCAST_ICE = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};
const BCAST_PATH = ['liveStream', 'broadcast'];

let broadcastCaptureType = 'camera';
let broadcastLocalStream = null;
let broadcastPeerConnections = new Map();
let broadcastViewersUnsub = null;
let broadcastSessionId = null;
let isBroadcasting = false;
let liveMicStream = null;
let liveMicTrack = null;
let liveMicEnabled = true;
let broadcastAudioTracks = [];

function actualizarUICaptura() {
  const isCamera = broadcastCaptureType === 'camera';
  const isScreen = broadcastCaptureType === 'screen';
  const isAudio = broadcastCaptureType === 'audio';
  const isSystemAudio = broadcastCaptureType === 'system-audio';

  captureTypeCameraBtn.classList.toggle('active', isCamera);
  captureTypeScreenBtn.classList.toggle('active', isScreen);
  captureTypeAudioBtn.classList.toggle('active', isAudio);
  captureTypeSystemAudioBtn.classList.toggle('active', isSystemAudio);

  if (isScreen || isSystemAudio) {
    deviceSelectorsGroup.style.display = 'none';
  } else {
    deviceSelectorsGroup.style.display = '';
    if (cameraSelectorWrapper) {
      cameraSelectorWrapper.style.display = isAudio ? 'none' : '';
    }
  }
}

captureTypeCameraBtn.addEventListener('click', () => {
  broadcastCaptureType = 'camera';
  actualizarUICaptura();
});

captureTypeScreenBtn.addEventListener('click', () => {
  broadcastCaptureType = 'screen';
  actualizarUICaptura();
});

captureTypeAudioBtn.addEventListener('click', () => {
  broadcastCaptureType = 'audio';
  actualizarUICaptura();
});

captureTypeSystemAudioBtn.addEventListener('click', () => {
  broadcastCaptureType = 'system-audio';
  actualizarUICaptura();
});

function actualizarEstadoMicToggle() {
  if (!micLiveToggle) return;
  const isActive = Boolean(liveMicTrack && liveMicEnabled);
  micLiveToggle.classList.toggle('active', isActive);
  micLiveToggle.setAttribute('aria-checked', String(isActive));
  micLiveToggle.disabled = !Boolean(liveMicTrack);
}

micLiveToggle?.addEventListener('click', () => {
  if (!liveMicTrack) return;
  liveMicEnabled = !liveMicEnabled;
  liveMicTrack.enabled = liveMicEnabled;
  actualizarEstadoMicToggle();
});

actualizarUICaptura();

detectDevicesBtn.addEventListener('click', async () => {
  detectDevicesBtn.disabled = true;
  detectDevicesBtn.innerHTML = '<i class="ri-loader-line"></i> Detectando...';
  try {
    const constraints = broadcastCaptureType === 'camera'
      ? { audio: true, video: true }
      : { audio: true, video: false };
    const tmp = await navigator.mediaDevices.getUserMedia(constraints);
    tmp.getTracks().forEach(t => t.stop());
    const devices = await navigator.mediaDevices.enumerateDevices();
    cameraSelect.innerHTML = '';
    micSelect.innerHTML = '';
    let camN = 0, micN = 0;
    devices.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.deviceId;
      if (d.kind === 'videoinput') {
        opt.textContent = d.label || `Cámara ${++camN}`;
        cameraSelect.appendChild(opt);
      } else if (d.kind === 'audioinput') {
        opt.textContent = d.label || `Micrófono ${++micN}`;
        micSelect.appendChild(opt);
      }
    });
    if (!cameraSelect.options.length) cameraSelect.innerHTML = '<option value="">Sin cámara detectada</option>';
    if (!micSelect.options.length) micSelect.innerHTML = '<option value="">Sin micrófono detectado</option>';
    mostrarMensaje(broadcastMessage, '✅ Dispositivos detectados correctamente.', 'success');
  } catch (err) {
    const msg = err.name === 'NotAllowedError'
      ? '❌ Permiso denegado. Permite el acceso a cámara/micrófono en el navegador.'
      : '❌ Error detectando dispositivos: ' + err.message;
    mostrarMensaje(broadcastMessage, msg, 'error');
  } finally {
    detectDevicesBtn.disabled = false;
    detectDevicesBtn.innerHTML = '<i class="ri-refresh-line"></i> Detectar dispositivos';
  }
});

startBroadcastBtn.addEventListener('click', async () => {
  startBroadcastBtn.disabled = true;
  broadcastMessage.style.display = 'none';

  // PASO 1: Capturar medios
  try {
    if (broadcastCaptureType === 'camera') {
      const videoC = cameraSelect.value ? { deviceId: { exact: cameraSelect.value } } : true;
      const audioC = micSelect.value ? { deviceId: { exact: micSelect.value } } : true;
      broadcastLocalStream = await navigator.mediaDevices.getUserMedia({ video: videoC, audio: audioC });
      liveMicStream = broadcastLocalStream;
      liveMicTrack = broadcastLocalStream.getAudioTracks()[0] || null;
      broadcastAudioTracks = [...broadcastLocalStream.getAudioTracks()];
      liveMicEnabled = true;
      if (micLiveToggle) {
        actualizarEstadoMicToggle();
      }
    } else if (broadcastCaptureType === 'audio') {
      const audioC = micSelect.value ? { deviceId: { exact: micSelect.value } } : true;
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: audioC, video: false });

      let systemAudioStream = null;
      try {
        systemAudioStream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: false });
      } catch (audioErr) {
        console.warn('No se pudo capturar audio del sistema, se emitirá solo micrófono:', audioErr);
      }

      const audioTracks = [...micStream.getAudioTracks()];
      if (systemAudioStream?.getAudioTracks().length) {
        audioTracks.push(...systemAudioStream.getAudioTracks());
      }

      if (!audioTracks.length) {
        throw new Error('No se pudo obtener audio para la emisión.');
      }

      broadcastLocalStream = new MediaStream(audioTracks);
      liveMicStream = micStream;
      liveMicTrack = micStream.getAudioTracks()[0] || null;
      broadcastAudioTracks = [...broadcastLocalStream.getAudioTracks()];
      liveMicEnabled = true;
      if (micLiveToggle) {
        actualizarEstadoMicToggle();
      }
      if (systemAudioStream) {
        systemAudioStream.getTracks().forEach(track => track.addEventListener('ended', () => {
          if (isBroadcasting) detenerEmisionBroadcast();
        }));
      }
    } else if (broadcastCaptureType === 'system-audio') {
      const systemAudioStream = await obtenerStreamAudioSistema();
      const audioTracks = [...systemAudioStream.getAudioTracks()];
      if (!audioTracks.length) {
        throw new Error('No se pudo obtener audio del sistema desde la pestaña o ventana seleccionada.');
      }
      broadcastLocalStream = new MediaStream(audioTracks);
      liveMicStream = null;
      liveMicTrack = null;
      broadcastAudioTracks = [...broadcastLocalStream.getAudioTracks()];
      liveMicEnabled = false;
      if (micLiveToggle) {
        liveMicEnabled = false;
        actualizarEstadoMicToggle();
      }
      systemAudioStream.getTracks().forEach(track => track.addEventListener('ended', () => {
        if (isBroadcasting) detenerEmisionBroadcast();
      }));
    } else {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: 'always' }, audio: true });
      const micAudioTracks = [];
      let micStream = null;
      let micTrack = null;

      const micConstraint = micSelect.value
        ? { deviceId: { exact: micSelect.value } }
        : true;

      micStream = await navigator.mediaDevices.getUserMedia({ audio: micConstraint, video: false });
      micTrack = micStream.getAudioTracks()[0] || null;
      if (micTrack) {
        micAudioTracks.push(micTrack);
      }

      const combinedTracks = [
        ...displayStream.getVideoTracks(),
        ...displayStream.getAudioTracks(),
        ...micAudioTracks
      ];

      broadcastLocalStream = new MediaStream(combinedTracks);
      liveMicStream = micStream;
      liveMicTrack = micTrack;
      broadcastAudioTracks = [...broadcastLocalStream.getAudioTracks()];
      liveMicEnabled = Boolean(micTrack);
      if (micLiveToggle) {
        actualizarEstadoMicToggle();
      }
      if (liveMicTrack) {
        liveMicTrack.enabled = liveMicEnabled;
      }
      displayStream.getVideoTracks()[0].addEventListener('ended', () => {
        if (isBroadcasting) detenerEmisionBroadcast();
      });
    }
    actualizarPreviewLocal(broadcastLocalStream);
    broadcastPreviewWrapper.style.display = '';
  } catch (mediaErr) {
    startBroadcastBtn.disabled = false;
    const msg = mediaErr.name === 'NotAllowedError'
      ? (broadcastCaptureType === 'system-audio'
        ? '❌ Permiso de audio denegado. Selecciona la pestaña o ventana y acepta compartir el audio.'
        : '❌ Permiso de cámara/micrófono denegado en el navegador.')
      : mediaErr.name === 'NotFoundError'
      ? '❌ Dispositivo no encontrado. Detecta los dispositivos primero.'
      : mediaErr.name === 'NotSupportedError' || mediaErr.message?.includes('Not supported')
      ? '❌ Tu navegador no admite esta captura de audio del sistema en este contexto. Prueba en Chrome/Edge actualizados y acepta compartir una pestaña o ventana.'
      : '❌ Error de captura: ' + mediaErr.message;
    mostrarMensaje(broadcastMessage, msg, 'error');
    return;
  }

  // PASO 2: Registrar emisión en Firestore
  try {
    broadcastSessionId = Date.now().toString(36) + Math.random().toString(36).slice(2);
    const bcastRef = doc(db, ...BCAST_PATH);
    await setDoc(bcastRef, {
      active: true,
      sourceType: broadcastCaptureType,
      sessionId: broadcastSessionId,
      startedAt: serverTimestamp()
    });
  } catch (fsErr) {
    // La cámara sigue encendida; solo falla Firestore
    startBroadcastBtn.disabled = false;
    mostrarMensaje(broadcastMessage,
      '❌ Error de permisos en Firebase. Verifica las reglas de Firestore en la consola de Firebase y vuelve a intentarlo. (' + fsErr.message + ')',
      'error');
    return; // No detener la cámara; el usuario puede reintentar
  }

  // PASO 3: Escuchar espectadores
  const viewersCollRef = collection(db, ...BCAST_PATH, 'viewers');
  broadcastViewersUnsub = onSnapshot(viewersCollRef, async (snap) => {
    for (const change of snap.docChanges()) {
      if (change.type === 'added') {
        const vid = change.doc.id;
        const data = change.doc.data();
        if (data.sessionId === broadcastSessionId && !broadcastPeerConnections.has(vid)) {
          await crearConexionParaViewer(vid);
        }
      } else if (change.type === 'removed') {
        const vid = change.doc.id;
        if (broadcastPeerConnections.has(vid)) {
          const pc = broadcastPeerConnections.get(vid);
          if (pc._unsub) pc._unsub();
          pc.close();
          broadcastPeerConnections.delete(vid);
          actualizarContadorViewers();
        }
      }
    }
  }, (snapErr) => {
    console.error('Error escuchando espectadores:', snapErr);
  });

  isBroadcasting = true;
  startBroadcastBtn.style.display = 'none';
  stopBroadcastBtn.style.display = '';
  micToggleWrap.style.display = 'inline-flex';
  broadcastLiveInfo.style.display = 'flex';
  actualizarContadorViewers();
});

async function obtenerStreamAudioSistema() {
  const candidates = [
    { audio: true, video: false },
    { audio: true, video: { cursor: 'always' } },
    { audio: true, video: true }
  ];

  let lastError = null;
  for (const constraints of candidates) {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length) {
        stream.getVideoTracks().forEach(track => track.stop());
        return stream;
      }
      stream.getTracks().forEach(track => track.stop());
      lastError = new Error('No se obtuvo audio del sistema desde la fuente compartida.');
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('No se pudo capturar audio del sistema.');
}

function actualizarPreviewLocal(stream) {
  if (!stream) {
    localPreviewVideo.srcObject = null;
    localPreviewVideo.style.display = 'none';
    broadcastPreviewPlaceholder.style.display = 'none';
    return;
  }

  const hasVideo = stream.getVideoTracks().length > 0;
  if (hasVideo) {
    localPreviewVideo.srcObject = stream;
    localPreviewVideo.style.display = '';
    broadcastPreviewPlaceholder.style.display = 'none';
    localPreviewVideo.play().catch(() => {});
  } else {
    localPreviewVideo.srcObject = null;
    localPreviewVideo.style.display = 'none';
    broadcastPreviewPlaceholder.style.display = 'flex';
    const title = broadcastCaptureType === 'system-audio'
      ? 'Sonidos del sistema listos para transmitir'
      : broadcastCaptureType === 'audio'
        ? 'Audio listo para transmitir'
        : 'Pantalla lista para transmitir';
    broadcastPreviewPlaceholder.querySelector('h5').textContent = title;
  }
}

async function crearConexionParaViewer(viewerId) {
  const pc = new RTCPeerConnection(BROADCAST_ICE);
  broadcastPeerConnections.set(viewerId, pc);

  const viewerRef = doc(db, ...BCAST_PATH, 'viewers', viewerId);

  broadcastLocalStream.getTracks().forEach(track => pc.addTrack(track, broadcastLocalStream));
  if (liveMicTrack) {
    liveMicTrack.enabled = liveMicEnabled;
  }

  pc.onicecandidate = async ({ candidate }) => {
    if (candidate) {
      try { await updateDoc(viewerRef, { bcCandidates: arrayUnion(candidate.toJSON()) }); }
      catch (e) { console.warn('ICE store error:', e); }
    }
  };

  pc.onconnectionstatechange = () => {
    const state = pc.connectionState;
    if (state === 'disconnected' || state === 'failed' || state === 'closed') {
      if (pc._unsub) pc._unsub();
      pc.close();
      broadcastPeerConnections.delete(viewerId);
      actualizarContadorViewers();
    }
  };

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  await updateDoc(viewerRef, { offerSDP: offer.sdp, offerType: offer.type });

  let lastViewerCandCount = 0;
  const unsubViewer = onSnapshot(viewerRef, async (snap) => {
    const data = snap.data();
    if (!data) return;
    if (data.answerSDP && pc.signalingState === 'have-local-offer') {
      try { await pc.setRemoteDescription({ sdp: data.answerSDP, type: data.answerType }); }
      catch (e) { console.error('setRemoteDescription error:', e); }
    }
    const vcands = data.viewerCandidates || [];
    for (let i = lastViewerCandCount; i < vcands.length; i++) {
      try { await pc.addIceCandidate(new RTCIceCandidate(vcands[i])); }
      catch (e) { console.warn('addIceCandidate error:', e); }
    }
    lastViewerCandCount = vcands.length;
  });
  pc._unsub = unsubViewer;
  actualizarContadorViewers();
}

function actualizarContadorViewers() {
  if (bcastViewerNum) bcastViewerNum.textContent = broadcastPeerConnections.size;
}

stopBroadcastBtn.addEventListener('click', async () => {
  if (!confirm('¿Detener la emisión en vivo? Los espectadores perderán la señal.')) return;
  await detenerEmisionBroadcast();
});

async function detenerEmisionBroadcast() {
  isBroadcasting = false;
  broadcastPeerConnections.forEach(pc => {
    if (pc._unsub) pc._unsub();
    pc.close();
  });
  broadcastPeerConnections.clear();
  if (broadcastViewersUnsub) { broadcastViewersUnsub(); broadcastViewersUnsub = null; }
  if (broadcastLocalStream) { broadcastLocalStream.getTracks().forEach(t => t.stop()); broadcastLocalStream = null; }
  actualizarPreviewLocal(null);
  broadcastPreviewWrapper.style.display = 'none';
  try {
    const bcastRef = doc(db, ...BCAST_PATH);
    await setDoc(bcastRef, { active: false, stoppedAt: serverTimestamp() }, { merge: true });
    const viewersRef = collection(db, ...BCAST_PATH, 'viewers');
    const viewerSnap = await getDocs(viewersRef);
    if (!viewerSnap.empty) {
      const batch = writeBatch(db);
      viewerSnap.forEach(d => batch.delete(d.ref));
      await batch.commit();
    }
  } catch (err) { console.error('Error stopping broadcast:', err); }
  startBroadcastBtn.style.display = '';
  startBroadcastBtn.disabled = false;
  stopBroadcastBtn.style.display = 'none';
  micToggleWrap.style.display = 'none';
  broadcastLiveInfo.style.display = 'none';
  mostrarMensaje(broadcastMessage, '✅ Emisión detenida correctamente.', 'success');
}

// ============================================================
// PROGRAMACIÓN - RENDER
// ============================================================
function renderSchedule(programas) {
  if (!programas || programas.length === 0) {
    scheduleList.innerHTML = `<p class="empty-text">No hay programas agregados.</p>`;
    return;
  }

  let html = '';
  programas.forEach(prog => {
    const badgeHTML = prog.badge ? `<span class="schedule-badge">${prog.badge}</span>` : '';
    html += `
      <div class="schedule-item" data-id="${prog.id}">
        <div class="schedule-info">
          <span class="schedule-time">${prog.time}</span>
          <span class="schedule-title">${prog.title}</span>
          <span class="schedule-host">${prog.host}</span>
          ${badgeHTML}
        </div>
        <div class="schedule-actions">
          <button class="edit-btn" data-id="${prog.id}" title="Editar"><i class="ri-pencil-line"></i></button>
          <button class="delete-btn" data-id="${prog.id}" title="Eliminar"><i class="ri-delete-bin-line"></i></button>
        </div>
      </div>
    `;
  });

  scheduleList.innerHTML = html;

  scheduleList.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const programa = programas.find(p => p.id === id);
      if (programa) abrirModalEditarPrograma(programa);
    });
  });

  scheduleList.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      if (!confirm('¿Eliminar este programa?')) return;
      try {
        await deleteDoc(doc(db, 'schedule', id));
      } catch (error) {
        console.error('Error eliminando programa:', error);
        alert('❌ Error al eliminar.');
      }
    });
  });
}

// Modal Programación
addScheduleBtn.addEventListener('click', () => abrirModalNuevoPrograma());
modalClose.addEventListener('click', cerrarModalPrograma);
scheduleCancelBtn.addEventListener('click', cerrarModalPrograma);
scheduleModal.addEventListener('click', (e) => {
  if (e.target === scheduleModal) cerrarModalPrograma();
});

function abrirModalNuevoPrograma() {
  modalTitle.textContent = 'Agregar programa';
  scheduleEditId.value = '';
  scheduleForm.reset();
  scheduleFormMessage.className = 'form-message';
  scheduleFormMessage.style.display = 'none';
  scheduleSubmitBtn.textContent = 'Agregar';
  scheduleModal.classList.add('open');
}

function abrirModalEditarPrograma(programa) {
  modalTitle.textContent = 'Editar programa';
  scheduleEditId.value = programa.id;
  scheduleTime.value = programa.time || '';
  scheduleTitle.value = programa.title || '';
  scheduleHost.value = programa.host || '';
  scheduleBadge.value = programa.badge || '';
  scheduleFormMessage.className = 'form-message';
  scheduleFormMessage.style.display = 'none';
  scheduleSubmitBtn.textContent = 'Actualizar';
  scheduleModal.classList.add('open');
}

function cerrarModalPrograma() {
  scheduleModal.classList.remove('open');
}

scheduleForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = scheduleEditId.value;
  const time = scheduleTime.value;
  const title = scheduleTitle.value.trim();
  const host = scheduleHost.value.trim();
  const badge = scheduleBadge.value.trim();

  if (!time || !title || !host) {
    mostrarMensaje(scheduleFormMessage, 'Todos los campos son obligatorios.', 'error');
    return;
  }

  try {
    if (id) {
      await updateDoc(doc(db, 'schedule', id), {
        time,
        title,
        host,
        badge: badge || null,
        updatedAt: serverTimestamp()
      });
    } else {
      await addDoc(collection(db, 'schedule'), {
        time,
        title,
        host,
        badge: badge || null,
        createdAt: serverTimestamp()
      });
    }
    cerrarModalPrograma();
  } catch (error) {
    console.error('Error guardando programa:', error);
    mostrarMensaje(scheduleFormMessage, '❌ Error: ' + error.message, 'error');
  }
});

// ============================================================
// NOTICIAS - RENDER Y CRUD (MEJORADO)
// ============================================================
function renderNews(noticias) {
  if (!noticias || noticias.length === 0) {
    newsList.innerHTML = `<p class="empty-text">No hay noticias. Crea una con el botón "Agregar noticia".</p>`;
    return;
  }

  let html = '';
  noticias.forEach(nota => {
    let thumbHtml = '';
    if (nota.imageChunks && nota.imageChunks.length > 0 && nota.imageType) {
      const base64 = nota.imageChunks.join('');
      thumbHtml = `<img src="data:${nota.imageType};base64,${base64}" alt="${nota.title}" class="news-thumb" />`;
    } else {
      thumbHtml = `<div class="news-thumb-placeholder"><i class="ri-image-line"></i></div>`;
    }

    html += `
      <div class="news-admin-item" data-id="${nota.id}">
        <div class="news-admin-info">
          ${thumbHtml}
          <div class="news-admin-meta">
            <span class="news-admin-title">${nota.title}</span>
            <span class="news-admin-date">${nota.date || 'Sin fecha'}</span>
            <span class="news-admin-desc">${nota.description || ''}</span>
          </div>
        </div>
        <div class="news-admin-actions">
          <button class="edit-news-btn" data-id="${nota.id}" title="Editar"><i class="ri-pencil-line"></i></button>
          <button class="delete-news-btn" data-id="${nota.id}" title="Eliminar"><i class="ri-delete-bin-line"></i></button>
        </div>
      </div>
    `;
  });

  newsList.innerHTML = html;

  newsList.querySelectorAll('.edit-news-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const noticia = noticias.find(n => n.id === id);
      if (noticia) abrirModalEditarNoticia(noticia);
    });
  });

  newsList.querySelectorAll('.delete-news-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      if (!confirm('¿Eliminar esta noticia?')) return;
      try {
        await deleteDoc(doc(db, 'news', id));
      } catch (error) {
        console.error('Error eliminando noticia:', error);
        alert('❌ Error al eliminar.');
      }
    });
  });
}

// Modal Noticias
addNewsBtn.addEventListener('click', () => abrirModalNuevoNoticia());
newsModalClose.addEventListener('click', cerrarModalNoticia);
newsCancelBtn.addEventListener('click', cerrarModalNoticia);
newsModal.addEventListener('click', (e) => {
  if (e.target === newsModal) cerrarModalNoticia();
});

function abrirModalNuevoNoticia() {
  newsModalTitle.textContent = 'Agregar noticia';
  newsEditId.value = '';
  newsForm.reset();
  newsImagePreview.innerHTML = '';
  newsFormMessage.className = 'form-message';
  newsFormMessage.style.display = 'none';
  newsSubmitBtn.textContent = 'Agregar';
  const today = new Date().toISOString().split('T')[0];
  newsDate.value = today;
  newsModal.classList.add('open');
}

function abrirModalEditarNoticia(noticia) {
  newsModalTitle.textContent = 'Editar noticia';
  newsEditId.value = noticia.id;
  newsTitle.value = noticia.title || '';
  newsDescription.value = noticia.description || '';
  newsDate.value = noticia.date || '';
  newsFacebookLink.value = noticia.facebookLink || '';
  if (noticia.imageChunks && noticia.imageChunks.length > 0 && noticia.imageType) {
    const base64 = noticia.imageChunks.join('');
    newsImagePreview.innerHTML = `<img src="data:${noticia.imageType};base64,${base64}" alt="Imagen actual" />`;
  } else {
    newsImagePreview.innerHTML = '';
  }
  newsFormMessage.className = 'form-message';
  newsFormMessage.style.display = 'none';
  newsSubmitBtn.textContent = 'Actualizar';
  newsModal.classList.add('open');
}

function cerrarModalNoticia() {
  newsModal.classList.remove('open');
}

// Envío de noticias con validaciones mejoradas
newsForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = newsEditId.value;
  const title = newsTitle.value.trim();
  const description = newsDescription.value.trim();
  const date = newsDate.value;
  const facebookLink = newsFacebookLink.value.trim();
  const imageFile = newsImage.files[0];

  if (!title || !description || !date || !facebookLink) {
    mostrarMensaje(newsFormMessage, 'Todos los campos (incluido el enlace de Facebook) son obligatorios.', 'error');
    return;
  }

  // Validar URL de Facebook
  try {
    new URL(facebookLink);
  } catch (_) {
    mostrarMensaje(newsFormMessage, 'El enlace de Facebook debe ser una URL válida.', 'error');
    return;
  }

  try {
    let imageChunks = [];
    let imageType = '';

    if (imageFile) {
      const { base64, type } = await comprimirImagen(imageFile);
      imageType = type;
      imageChunks = dividirEnChunks(base64, CHUNK_SIZE);
    } else if (id) {
      // Conservar imagen existente
      const docSnap = await getDoc(doc(db, 'news', id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        imageChunks = data.imageChunks || [];
        imageType = data.imageType || '';
      }
    }

    const data = {
      title,
      description,
      date,
      facebookLink,
      imageChunks,
      imageType,
      updatedAt: serverTimestamp()
    };

    if (id) {
      await updateDoc(doc(db, 'news', id), data);
    } else {
      data.createdAt = serverTimestamp();
      await addDoc(collection(db, 'news'), data);
    }

    cerrarModalNoticia();
  } catch (error) {
    console.error('Error guardando noticia:', error);
    mostrarMensaje(newsFormMessage, '❌ Error: ' + error.message, 'error');
  }
});

// Previsualización de imagen para noticias
newsImage.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) {
    newsImagePreview.innerHTML = '';
    return;
  }
  try {
    const { base64, type } = await comprimirImagen(file);
    newsImagePreview.innerHTML = `<img src="data:${type};base64,${base64}" alt="Vista previa" />`;
  } catch (error) {
    console.error('Error al previsualizar imagen:', error);
    newsImagePreview.innerHTML = `<span style="color:#ff6b6b;">Error al cargar imagen</span>`;
  }
});

// ============================================================
// LOCUTORES - RENDER Y CRUD
// ============================================================
function renderLocutores(locutores) {
  if (!locutores || locutores.length === 0) {
    locutorList.innerHTML = `<p class="empty-text">No hay locutores. Crea uno con el botón "Agregar locutor".</p>`;
    return;
  }

  let html = '';
  locutores.forEach(loc => {
    let avatarHtml = '';
    if (loc.imageChunks && loc.imageChunks.length > 0 && loc.imageType) {
      const base64 = loc.imageChunks.join('');
      avatarHtml = `<img src="data:${loc.imageType};base64,${base64}" alt="${loc.name}" class="locutor-avatar" />`;
    } else {
      avatarHtml = `<div class="locutor-avatar-placeholder"><i class="ri-user-3-fill"></i></div>`;
    }

    html += `
      <div class="locutor-item" data-id="${loc.id}">
        <div class="locutor-info">
          ${avatarHtml}
          <div class="locutor-meta">
            <span class="locutor-name">${loc.name}</span>
            <span class="locutor-role">${loc.role || ''}</span>
            <span class="locutor-desc">${loc.description || ''}</span>
          </div>
        </div>
        <div class="locutor-actions">
          <button class="edit-locutor-btn" data-id="${loc.id}" title="Editar"><i class="ri-pencil-line"></i></button>
          <button class="delete-locutor-btn" data-id="${loc.id}" title="Eliminar"><i class="ri-delete-bin-line"></i></button>
        </div>
      </div>
    `;
  });

  locutorList.innerHTML = html;

  locutorList.querySelectorAll('.edit-locutor-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const locutor = locutores.find(l => l.id === id);
      if (locutor) abrirModalEditarLocutor(locutor);
    });
  });

  locutorList.querySelectorAll('.delete-locutor-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      if (!confirm('¿Eliminar este locutor?')) return;
      try {
        await deleteDoc(doc(db, 'announcers', id));
      } catch (error) {
        console.error('Error eliminando locutor:', error);
        alert('❌ Error al eliminar.');
      }
    });
  });
}

// Modal Locutores
addLocutorBtn.addEventListener('click', () => abrirModalNuevoLocutor());
locutorModalClose.addEventListener('click', cerrarModalLocutor);
locutorCancelBtn.addEventListener('click', cerrarModalLocutor);
locutorModal.addEventListener('click', (e) => {
  if (e.target === locutorModal) cerrarModalLocutor();
});

function abrirModalNuevoLocutor() {
  locutorModalTitle.textContent = 'Agregar locutor';
  locutorEditId.value = '';
  locutorForm.reset();
  locutorImagePreview.innerHTML = '';
  locutorFormMessage.className = 'form-message';
  locutorFormMessage.style.display = 'none';
  locutorSubmitBtn.textContent = 'Agregar';
  generarSocialCheckboxes({});
  locutorModal.classList.add('open');
}

function abrirModalEditarLocutor(locutor) {
  locutorModalTitle.textContent = 'Editar locutor';
  locutorEditId.value = locutor.id;
  locutorName.value = locutor.name || '';
  locutorRole.value = locutor.role || '';
  locutorDescription.value = locutor.description || '';
  if (locutor.imageChunks && locutor.imageChunks.length > 0 && locutor.imageType) {
    const base64 = locutor.imageChunks.join('');
    locutorImagePreview.innerHTML = `<img src="data:${locutor.imageType};base64,${base64}" alt="Foto actual" />`;
  } else {
    locutorImagePreview.innerHTML = '';
  }
  locutorFormMessage.className = 'form-message';
  locutorFormMessage.style.display = 'none';
  locutorSubmitBtn.textContent = 'Actualizar';
  generarSocialCheckboxes(locutor.social || {});
  locutorModal.classList.add('open');
}

function cerrarModalLocutor() {
  locutorModal.classList.remove('open');
}

// Redes sociales
function generarSocialCheckboxes(socialData) {
  if (!socialCheckboxes) return;
  socialCheckboxes.innerHTML = '';

  SOCIAL_NETWORKS.forEach(net => {
    const value = socialData[net.key] || '';
    const checked = !!value;

    const container = document.createElement('div');
    container.className = 'social-check-item';

    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.dataset.key = net.key;
    checkbox.checked = checked;
    checkbox.addEventListener('change', () => {
      const field = container.querySelector('.social-field');
      if (checkbox.checked) {
        field.classList.add('visible');
        const input = field.querySelector('input');
        input.focus();
      } else {
        field.classList.remove('visible');
        const input = field.querySelector('input');
        input.value = '';
      }
    });
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(' ' + net.label));

    const fieldDiv = document.createElement('div');
    fieldDiv.className = 'social-field' + (checked ? ' visible' : '');
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = net.placeholder;
    input.dataset.key = net.key;
    input.value = value;
    fieldDiv.appendChild(input);

    container.appendChild(label);
    container.appendChild(fieldDiv);
    socialCheckboxes.appendChild(container);
  });
}

function normalizeSocialValue(key, raw) {
  let val = raw.trim();
  if (!val) return '';

  switch (key) {
    case 'facebook':
      val = val.replace(/^https?:\/\/(www\.)?facebook\.com\//, '');
      val = val.replace(/^@/, '');
      val = val.split('?')[0];
      val = val.split('/')[0];
      return val;
    case 'instagram':
      val = val.replace(/^https?:\/\/(www\.)?instagram\.com\//, '');
      val = val.replace(/^@/, '');
      val = val.split('?')[0];
      val = val.split('/')[0];
      return val;
    case 'twitter':
      val = val.replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//, '');
      val = val.replace(/^@/, '');
      val = val.split('?')[0];
      val = val.split('/')[0];
      return val;
    case 'tiktok':
      val = val.replace(/^https?:\/\/(www\.)?tiktok\.com\/@/, '');
      val = val.replace(/^@/, '');
      val = val.split('?')[0];
      val = val.split('/')[0];
      return val;
    case 'whatsapp':
      val = val.replace(/[^0-9+]/g, '');
      return val;
    case 'youtube':
      return val;
    default:
      return val;
  }
}

locutorForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = locutorEditId.value;
  const name = locutorName.value.trim();
  const role = locutorRole.value.trim();
  const description = locutorDescription.value.trim();
  const imageFile = locutorImage.files[0];

  if (!name || !role || !description) {
    mostrarMensaje(locutorFormMessage, 'Nombre, rol y descripción son obligatorios.', 'error');
    return;
  }

  try {
    let imageChunks = [];
    let imageType = '';

    if (imageFile) {
      const { base64, type } = await comprimirImagen(imageFile);
      imageType = type;
      imageChunks = dividirEnChunks(base64, CHUNK_SIZE);
    } else if (id) {
      const docSnap = await getDoc(doc(db, 'announcers', id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        imageChunks = data.imageChunks || [];
        imageType = data.imageType || '';
      }
    }

    const social = {};
    const checkItems = socialCheckboxes.querySelectorAll('.social-check-item');
    checkItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      const input = item.querySelector('.social-field input');
      if (checkbox.checked) {
        const key = checkbox.dataset.key;
        const rawValue = input.value.trim();
        if (rawValue) {
          social[key] = normalizeSocialValue(key, rawValue);
        }
      }
    });

    const data = {
      name,
      role,
      description,
      social,
      imageChunks,
      imageType,
      updatedAt: serverTimestamp()
    };

    if (id) {
      await updateDoc(doc(db, 'announcers', id), data);
    } else {
      data.createdAt = serverTimestamp();
      await addDoc(collection(db, 'announcers'), data);
    }

    cerrarModalLocutor();
  } catch (error) {
    console.error('Error guardando locutor:', error);
    mostrarMensaje(locutorFormMessage, '❌ Error: ' + error.message, 'error');
  }
});

locutorImage.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) {
    locutorImagePreview.innerHTML = '';
    return;
  }
  try {
    const { base64, type } = await comprimirImagen(file);
    locutorImagePreview.innerHTML = `<img src="data:${type};base64,${base64}" alt="Vista previa" />`;
  } catch (error) {
    console.error('Error al previsualizar imagen:', error);
    locutorImagePreview.innerHTML = `<span style="color:#ff6b6b;">Error al cargar imagen</span>`;
  }
});

// ============================================================
// DIRECTORIO - RENDER Y CRUD (sin cambios, ya funcionaba)
// ============================================================
const CHUNK_SIZE = 50000;

function renderDirectory(negocios) {
  if (!negocios || negocios.length === 0) {
    directoryList.innerHTML = `<p class="empty-text">No hay negocios registrados. Crea uno con el botón "Agregar negocio".</p>`;
    return;
  }

  let html = '';
  negocios.forEach(item => {
    let thumbHtml = '';
    if (item.imageChunks && item.imageChunks.length > 0 && item.imageType) {
      const base64 = item.imageChunks.join('');
      thumbHtml = `<img src="data:${item.imageType};base64,${base64}" alt="${item.name}" class="directory-thumb" />`;
    } else {
      thumbHtml = `<div class="directory-thumb-placeholder"><i class="ri-store-3-line"></i></div>`;
    }

    let contactsSummary = '';
    if (item.contacts && item.contacts.length > 0) {
      const phones = item.contacts.filter(c => c.type === 'phone').map(c => c.number);
      const whatsapps = item.contacts.filter(c => c.type === 'whatsapp').map(c => c.number);
      const parts = [];
      if (phones.length) parts.push(`📞 ${phones.join(', ')}`);
      if (whatsapps.length) parts.push(`💬 ${whatsapps.join(', ')}`);
      contactsSummary = parts.join(' · ');
    } else {
      contactsSummary = 'Sin contactos';
    }

    html += `
      <div class="directory-item" data-id="${item.id}">
        <div class="directory-info">
          ${thumbHtml}
          <div class="directory-meta">
            <span class="directory-name">${item.name}</span>
            <span class="directory-badge">${item.badge || 'General'}</span>
            <span class="directory-address">${item.address || ''}</span>
            <span class="directory-contacts-summary">${contactsSummary}</span>
          </div>
        </div>
        <div class="directory-actions">
          <button class="edit-directory-btn" data-id="${item.id}" title="Editar"><i class="ri-pencil-line"></i></button>
          <button class="delete-directory-btn" data-id="${item.id}" title="Eliminar"><i class="ri-delete-bin-line"></i></button>
        </div>
      </div>
    `;
  });

  directoryList.innerHTML = html;

  directoryList.querySelectorAll('.edit-directory-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const negocio = negocios.find(n => n.id === id);
      if (negocio) abrirModalEditarDirectorio(negocio);
    });
  });

  directoryList.querySelectorAll('.delete-directory-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      if (!confirm('¿Eliminar este negocio del directorio?')) return;
      try {
        await deleteDoc(doc(db, 'directory', id));
      } catch (error) {
        console.error('Error eliminando negocio:', error);
        alert('❌ Error al eliminar.');
      }
    });
  });
}

// Modal Directorio
addDirectoryBtn.addEventListener('click', () => abrirModalNuevoDirectorio());
directoryModalClose.addEventListener('click', cerrarModalDirectorio);
directoryCancelBtn.addEventListener('click', cerrarModalDirectorio);
directoryModal.addEventListener('click', (e) => {
  if (e.target === directoryModal) cerrarModalDirectorio();
});

function abrirModalNuevoDirectorio() {
  directoryModalTitle.textContent = 'Agregar negocio';
  directoryEditId.value = '';
  directoryForm.reset();
  directoryImagePreview.innerHTML = '';
  contactsContainer.innerHTML = '';
  directoryFormMessage.className = 'form-message';
  directoryFormMessage.style.display = 'none';
  directorySubmitBtn.textContent = 'Agregar';
  agregarCampoContacto();
  directoryModal.classList.add('open');
}

function abrirModalEditarDirectorio(negocio) {
  directoryModalTitle.textContent = 'Editar negocio';
  directoryEditId.value = negocio.id;
  directoryBadge.value = negocio.badge || '';
  directoryName.value = negocio.name || '';
  directoryDescription.value = negocio.description || '';
  directoryAddress.value = negocio.address || '';

  contactsContainer.innerHTML = '';
  if (negocio.contacts && negocio.contacts.length > 0) {
    negocio.contacts.forEach(contact => {
      agregarCampoContacto(contact.type, contact.number);
    });
  } else {
    agregarCampoContacto();
  }

  if (negocio.imageChunks && negocio.imageChunks.length > 0 && negocio.imageType) {
    const base64 = negocio.imageChunks.join('');
    directoryImagePreview.innerHTML = `<img src="data:${negocio.imageType};base64,${base64}" alt="Imagen actual" />`;
  } else {
    directoryImagePreview.innerHTML = '';
  }

  directoryFormMessage.className = 'form-message';
  directoryFormMessage.style.display = 'none';
  directorySubmitBtn.textContent = 'Actualizar';
  directoryModal.classList.add('open');
}

function cerrarModalDirectorio() {
  directoryModal.classList.remove('open');
}

function agregarCampoContacto(tipo = 'phone', numero = '') {
  const container = document.createElement('div');
  container.className = 'contact-item';

  const select = document.createElement('select');
  select.className = 'contact-type';
  const optionPhone = document.createElement('option');
  optionPhone.value = 'phone';
  optionPhone.textContent = 'Teléfono';
  const optionWhats = document.createElement('option');
  optionWhats.value = 'whatsapp';
  optionWhats.textContent = 'WhatsApp';
  select.appendChild(optionPhone);
  select.appendChild(optionWhats);
  if (tipo === 'whatsapp') select.value = 'whatsapp';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Número (ej. +52 999 123 4567)';
  input.className = 'contact-number';
  input.value = numero;

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn btn-danger btn-sm remove-contact';
  removeBtn.innerHTML = '<i class="ri-close-line"></i>';
  removeBtn.addEventListener('click', () => {
    if (contactsContainer.children.length > 1) {
      container.remove();
    } else {
      alert('Debe haber al menos un contacto.');
    }
  });

  container.appendChild(select);
  container.appendChild(input);
  container.appendChild(removeBtn);
  contactsContainer.appendChild(container);
}

addContactBtn.addEventListener('click', () => {
  agregarCampoContacto();
});

directoryForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = directoryEditId.value;
  const badge = directoryBadge.value.trim();
  const name = directoryName.value.trim();
  const description = directoryDescription.value.trim();
  const address = directoryAddress.value.trim();
  const imageFile = directoryImage.files[0];

  if (!badge || !name || !description || !address) {
    mostrarMensaje(directoryFormMessage, 'Todos los campos son obligatorios.', 'error');
    return;
  }

  const contactItems = contactsContainer.querySelectorAll('.contact-item');
  const contacts = [];
  contactItems.forEach(item => {
    const type = item.querySelector('.contact-type').value;
    const number = item.querySelector('.contact-number').value.trim();
    if (number) {
      contacts.push({ type, number });
    }
  });

  if (contacts.length === 0) {
    mostrarMensaje(directoryFormMessage, 'Debe agregar al menos un número de contacto.', 'error');
    return;
  }

  try {
    let imageChunks = [];
    let imageType = '';

    if (imageFile) {
      const { base64, type } = await comprimirImagen(imageFile);
      imageType = type;
      imageChunks = dividirEnChunks(base64, CHUNK_SIZE);
    } else if (id) {
      const docSnap = await getDoc(doc(db, 'directory', id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        imageChunks = data.imageChunks || [];
        imageType = data.imageType || '';
      }
    }

    const data = {
      badge,
      name,
      description,
      address,
      contacts,
      imageChunks,
      imageType,
      updatedAt: serverTimestamp()
    };

    if (id) {
      await updateDoc(doc(db, 'directory', id), data);
    } else {
      data.createdAt = serverTimestamp();
      await addDoc(collection(db, 'directory'), data);
    }

    cerrarModalDirectorio();
  } catch (error) {
    console.error('Error guardando negocio:', error);
    mostrarMensaje(directoryFormMessage, '❌ Error: ' + error.message, 'error');
  }
});

directoryImage.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) {
    directoryImagePreview.innerHTML = '';
    return;
  }
  try {
    const { base64, type } = await comprimirImagen(file);
    directoryImagePreview.innerHTML = `<img src="data:${type};base64,${base64}" alt="Vista previa" />`;
  } catch (error) {
    console.error('Error al previsualizar imagen:', error);
    directoryImagePreview.innerHTML = `<span style="color:#ff6b6b;">Error al cargar imagen</span>`;
  }
});

// ============================================================
// UTILIDADES COMPARTIDAS
// ============================================================

function comprimirImagen(file, maxWidth = 1920, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const mimeType = file.type || 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);
        const base64 = dataUrl.split(',')[1];
        const type = dataUrl.split(';')[0].split(':')[1];
        resolve({ base64, type });
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

function dividirEnChunks(str, size) {
  const chunks = [];
  for (let i = 0; i < str.length; i += size) {
    chunks.push(str.substring(i, i + size));
  }
  return chunks;
}

function mostrarMensaje(element, texto, tipo) {
  element.textContent = texto;
  element.className = 'form-message ' + tipo;
  element.style.display = 'block';
  if (tipo === 'success') {
    setTimeout(() => {
      element.style.display = 'none';
    }, 5000);
  }
}

window.addEventListener('beforeunload', () => {
  if (streamingUnsubscribe) streamingUnsubscribe();
  if (scheduleUnsubscribe) scheduleUnsubscribe();
  if (newsUnsubscribe) newsUnsubscribe();
  if (locutorUnsubscribe) locutorUnsubscribe();
  if (directoryUnsubscribe) directoryUnsubscribe();
  // Broadcast cleanup
  if (broadcastViewersUnsub) broadcastViewersUnsub();
  broadcastPeerConnections.forEach(pc => { if (pc._unsub) pc._unsub(); pc.close(); });
  if (broadcastLocalStream) broadcastLocalStream.getTracks().forEach(t => t.stop());
});