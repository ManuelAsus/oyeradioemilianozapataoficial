// js/contact.js
import { db } from '../services/firebase.js';
import { addDoc, collection, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const statusDiv = document.getElementById('formStatus');

    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Mostrar estado "Enviando..."
        statusDiv.style.display = 'block';
        statusDiv.textContent = 'Enviando...';
        statusDiv.style.background = 'rgba(255, 255, 255, 0.05)';
        statusDiv.style.color = '#fff';
        statusDiv.style.border = '1px solid rgba(255,255,255,0.1)';

        const name = document.getElementById('contactName').value.trim();
        const email = document.getElementById('contactEmail').value.trim();
        const message = document.getElementById('contactMessage').value.trim();

        if (!name || !email || !message) {
            statusDiv.textContent = '❌ Todos los campos son obligatorios.';
            statusDiv.style.background = 'rgba(255, 0, 0, 0.15)';
            statusDiv.style.color = '#ff6b6b';
            statusDiv.style.border = '1px solid rgba(255,0,0,0.3)';
            return;
        }

        try {
            await addDoc(collection(db, 'contactMessages'), {
                name,
                email,
                message,
                timestamp: serverTimestamp()
            });

            statusDiv.textContent = '✅ ¡Mensaje enviado con éxito!';
            statusDiv.style.background = 'rgba(34, 197, 94, 0.15)';
            statusDiv.style.color = '#22c55e';
            statusDiv.style.border = '1px solid rgba(34, 197, 94, 0.3)';
            form.reset();
        } catch (error) {
            console.error('Error al guardar mensaje:', error);
            statusDiv.textContent = '❌ Error al enviar. Intenta nuevamente.';
            statusDiv.style.background = 'rgba(255, 0, 0, 0.15)';
            statusDiv.style.color = '#ff6b6b';
            statusDiv.style.border = '1px solid rgba(255,0,0,0.3)';
        }
    });
});