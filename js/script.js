// ===================================
// VARIABLES GLOBALES
// ===================================
let carrito = [];
let productos = [];

// ===================================
// FUNCIONES DE CARRITO - LOCALSTORAGE
// ===================================

// Cargar carrito desde localStorage al iniciar
function cargarCarrito() {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        actualizarContadorCarrito();
    }
}

// Guardar carrito en localStorage
function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Actualizar contador del carrito en el header
function actualizarContadorCarrito() {
    const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = total;
    }
}

// ===================================
// FETCH API - OBTENER PRODUCTOS
// ===================================

// Cargar productos desde la API
async function cargarProductos() {
    const container = document.getElementById('productosContainer');
    
    // Verificar si existe el contenedor (solo en index.html)
    if (!container) return;
    
    try {
        // Mostrar mensaje de carga
        container.innerHTML = '<div class="loading">Cargando productos...</div>';
        
        // Fetch a la API
        const response = await fetch('https://fakestoreapi.com/products?limit=6');
        
        // Verificar si la respuesta es exitosa
        if (!response.ok) {
            throw new Error('Error al cargar productos');
        }
        
        // Convertir respuesta a JSON
        productos = await response.json();
        
        // Renderizar productos en el DOM
        mostrarProductos(productos);
        
    } catch (error) {
        // Manejo de errores
        container.innerHTML = `
            <div class="error">
                ❌ Error al cargar productos: ${error.message}
                <br><br>
                <button onclick="cargarProductos()" class="btn-add-cart" style="max-width: 200px; margin: 0 auto;">
                    Reintentar
                </button>
            </div>
        `;
        console.error('Error:', error);
    }
}

// ===================================
// MANIPULACIÓN DEL DOM - PRODUCTOS
// ===================================

// Mostrar productos en el DOM
function mostrarProductos(productos) {
    const container = document.getElementById('productosContainer');
    
    // Limpiar contenedor
    container.innerHTML = '';

    // Crear una card por cada producto
    productos.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        // Estructura HTML de la card
        card.innerHTML = `
            <img src="${producto.image}" alt="${producto.title}">
            <div class="product-info">
                <h3 class="product-title">${producto.title.substring(0, 50)}...</h3>
                <p class="product-description">${producto.description.substring(0, 80)}...</p>
                <p class="product-price">$${producto.price.toFixed(2)}</p>
                <button class="btn-add-cart" onclick="agregarAlCarrito(${producto.id})">
                    🛒 Agregar al Carrito
                </button>
            </div>
        `;
        
        // Agregar card al contenedor
        container.appendChild(card);
    });
}

// ===================================
// FUNCIONALIDAD DEL CARRITO
// ===================================

// Agregar producto al carrito
function agregarAlCarrito(id) {
    // Buscar el producto por ID
    const producto = productos.find(p => p.id === id);
    
    if (!producto) {
        console.error('Producto no encontrado');
        return;
    }
    
    // Verificar si el producto ya está en el carrito
    const itemExistente = carrito.find(item => item.id === id);

    if (itemExistente) {
        // Si existe, incrementar cantidad
        itemExistente.cantidad++;
    } else {
        // Si no existe, agregarlo
        carrito.push({
            id: producto.id,
            title: producto.title,
            price: producto.price,
            image: producto.image,
            cantidad: 1
        });
    }

    // Guardar en localStorage
    guardarCarrito();
    
    // Actualizar contador
    actualizarContadorCarrito();
    
    // Mostrar mensaje de confirmación
    mostrarMensaje('✅ Producto agregado al carrito');
}

// Mostrar el modal del carrito
function mostrarCarrito() {
    const modal = document.getElementById('cartModal');
    const itemsContainer = document.getElementById('cartItems');
    
    // Verificar si el carrito está vacío
    if (carrito.length === 0) {
        itemsContainer.innerHTML = '<div class="empty-cart">🛒 El carrito está vacío</div>';
        document.getElementById('cartTotal').textContent = 'Total: $0.00';
    } else {
        // Limpiar contenedor
        itemsContainer.innerHTML = '';
        let total = 0;

        // Crear un item por cada producto en el carrito
        carrito.forEach(item => {
            const subtotal = item.price * item.cantidad;
            total += subtotal;

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.title}">
                <div class="cart-item-info">
                    <h4>${item.title.substring(0, 40)}...</h4>
                    <p>$${item.price.toFixed(2)} x ${item.cantidad} = $${subtotal.toFixed(2)}</p>
                </div>
                <div class="cart-item-controls">
                    <button onclick="cambiarCantidad(${item.id}, -1)" title="Disminuir cantidad">-</button>
                    <span>${item.cantidad}</span>
                    <button onclick="cambiarCantidad(${item.id}, 1)" title="Aumentar cantidad">+</button>
                    <button onclick="eliminarDelCarrito(${item.id})" style="background: #ff4757;" title="Eliminar producto">🗑️</button>
                </div>
            `;
            
            itemsContainer.appendChild(cartItem);
        });

        // Actualizar total
        document.getElementById('cartTotal').textContent = `Total: $${total.toFixed(2)}`;
    }

    // Mostrar modal
    modal.classList.add('active');
}

// Cambiar cantidad de un producto en el carrito
function cambiarCantidad(id, cambio) {
    const item = carrito.find(i => i.id === id);
    
    if (item) {
        item.cantidad += cambio;
        
        // Si la cantidad llega a 0 o menos, eliminar producto
        if (item.cantidad <= 0) {
            eliminarDelCarrito(id);
        } else {
            // Guardar cambios
            guardarCarrito();
            
            // Actualizar vista
            mostrarCarrito();
            actualizarContadorCarrito();
        }
    }
}

// Eliminar producto del carrito
function eliminarDelCarrito(id) {
    // Filtrar el producto a eliminar
    carrito = carrito.filter(item => item.id !== id);
    
    // Guardar cambios
    guardarCarrito();
    
    // Actualizar vista
    mostrarCarrito();
    actualizarContadorCarrito();
    
    // Mostrar mensaje
    mostrarMensaje('🗑️ Producto eliminado del carrito');
}

// Cerrar modal del carrito
function cerrarCarrito() {
    const modal = document.getElementById('cartModal');
    modal.classList.remove('active');
}

// Finalizar compra
function finalizarCompra() {
    if (carrito.length === 0) {
        alert('❌ El carrito está vacío. Agrega productos antes de finalizar la compra.');
        return;
    }
    
    // Calcular total
    const total = carrito.reduce((sum, item) => sum + (item.price * item.cantidad), 0);
    
    // Mensaje de confirmación
    alert(`✅ ¡Gracias por tu compra!\n\nTotal: $${total.toFixed(2)}\n\nTu pedido será procesado en breve.`);
    
    // Limpiar carrito
    carrito = [];
    guardarCarrito();
    actualizarContadorCarrito();
    
    // Cerrar modal
    cerrarCarrito();
}

// ===================================
// VALIDACIÓN DE FORMULARIO
// ===================================

// Validar y enviar formulario de contacto con AJAX
function validarFormulario(event) {
    event.preventDefault(); // Prevenir envío tradicional
    
    const form = event.target;
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const mensaje = document.getElementById('mensaje').value.trim();

    // Verificar campos vacíos
    if (!nombre || !email || !mensaje) {
        alert('❌ Por favor, completa todos los campos obligatorios.');
        return false;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('❌ Por favor, ingresa un correo electrónico válido.');
        return false;
    }

    // Validar longitud mínima del mensaje
    if (mensaje.length < 10) {
        alert('❌ El mensaje debe tener al menos 10 caracteres.');
        return false;
    }

    // Enviar formulario con AJAX
    enviarFormulario(form);
    
    return false;
}

// Enviar formulario usando Fetch API
async function enviarFormulario(form) {
    const submitBtn = form.querySelector('.btn-submit');
    const textoOriginal = submitBtn.textContent;
    
    try {
        // Deshabilitar botón y mostrar loading
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        
        // Obtener datos del formulario
        const formData = new FormData(form);
        
        // Enviar a Formspree
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            // Éxito
            mostrarMensaje('✅ ¡Mensaje enviado correctamente! Te responderemos pronto.');
            form.reset(); // Limpiar formulario
            
            // Opcional: redirigir a home después de 2 segundos
            setTimeout(() => {
                // Detectar si estamos en la carpeta pages o en la raíz
                if (window.location.pathname.includes('/pages/')) {
                    window.location.href = '../index.html';
                } else {
                    window.location.href = 'index.html';
                }
            }, 2000);
        } else {
            // Error del servidor
            throw new Error('Error al enviar el formulario');
        }
        
    } catch (error) {
        // Error de red o servidor
        alert('❌ Hubo un error al enviar el mensaje. Por favor, intenta nuevamente.');
        console.error('Error:', error);
    } finally {
        // Rehabilitar botón
        submitBtn.disabled = false;
        submitBtn.textContent = textoOriginal;
    }
}

// ===================================
// UTILIDADES
// ===================================

// Mostrar mensaje temporal
function mostrarMensaje(texto) {
    // Crear elemento de mensaje
    const mensaje = document.createElement('div');
    mensaje.textContent = texto;
    mensaje.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 3000;
        animation: slideIn 0.3s;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        font-weight: 600;
    `;
    
    // Agregar al body
    document.body.appendChild(mensaje);
    
    // Eliminar después de 2 segundos
    setTimeout(() => {
        mensaje.style.animation = 'slideOut 0.3s';
        setTimeout(() => mensaje.remove(), 300);
    }, 2000);
}

// Navegación suave (smooth scroll)
function inicializarNavegacionSuave() {
    document.querySelectorAll('nav a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===================================
// EVENT LISTENERS
// ===================================

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    
    // Cargar carrito desde localStorage
    cargarCarrito();
    
    // Cargar productos desde la API (solo en index.html)
    cargarProductos();
    
    // Event listener para abrir carrito
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', mostrarCarrito);
    }
    
    // Event listener para cerrar carrito
    const cartClose = document.getElementById('cartClose');
    if (cartClose) {
        cartClose.addEventListener('click', cerrarCarrito);
    }
    
    // Event listener para cerrar modal al hacer click fuera
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.addEventListener('click', function(e) {
            if (e.target === cartModal) {
                cerrarCarrito();
            }
        });
    }
    
    // Event listener para validar formulario de contacto
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', validarFormulario);
    }
    
    // Inicializar navegación suave
    inicializarNavegacionSuave();
    
    console.log('✅ Aplicación iniciada correctamente');
});

// ===================================
// TECLA ESC PARA CERRAR MODAL
// ===================================
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('cartModal');
        if (modal && modal.classList.contains('active')) {
            cerrarCarrito();
        }
    }
});