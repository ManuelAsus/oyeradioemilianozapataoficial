// admin/js/admin-auth.js
import { auth } from '../../services/firebase.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js';

// Elementos DOM
const form = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const btnText = document.getElementById('btnText');
const btnSpinner = document.getElementById('btnSpinner');
const errorDiv = document.getElementById('errorMessage');
const togglePwd = document.getElementById('togglePassword');

// Mostrar/ocultar contraseña
togglePwd.addEventListener('click', () => {
  const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordInput.setAttribute('type', type);
  togglePwd.querySelector('i').classList.toggle('ri-eye-line');
  togglePwd.querySelector('i').classList.toggle('ri-eye-off-line');
});

// Verificar si ya hay sesión activa
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Si ya está autenticado, redirigir al dashboard
    window.location.href = 'dashboard.html';
  }
});

// Envío del formulario
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    showError('Por favor completa todos los campos.');
    return;
  }

  // Deshabilitar botón y mostrar spinner
  loginBtn.disabled = true;
  btnText.textContent = 'Verificando...';
  btnSpinner.style.display = 'inline-block';
  errorDiv.style.display = 'none';

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Éxito: redirigir al dashboard
    window.location.href = 'dashboard.html';
  } catch (error) {
    console.error('Error de autenticación:', error);
    let mensaje = 'Error al iniciar sesión. Intenta nuevamente.';
    switch (error.code) {
      case 'auth/user-not-found':
        mensaje = 'No existe una cuenta con este correo.';
        break;
      case 'auth/wrong-password':
        mensaje = 'Contraseña incorrecta.';
        break;
      case 'auth/invalid-email':
        mensaje = 'El correo electrónico no es válido.';
        break;
      case 'auth/too-many-requests':
        mensaje = 'Demasiados intentos fallidos. Espera un momento.';
        break;
      default:
        mensaje = error.message || 'Error desconocido.';
    }
    showError(mensaje);
  } finally {
    loginBtn.disabled = false;
    btnText.textContent = 'Iniciar sesión';
    btnSpinner.style.display = 'none';
  }
});

function showError(msg) {
  errorDiv.textContent = msg;
  errorDiv.style.display = 'block';
}