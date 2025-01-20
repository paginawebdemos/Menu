import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBIe6_4rj47XgSWHFVGpk04qB7JgOJIhrI",
  authDomain: "luna-5a497.firebaseapp.com",
  projectId: "luna-5a497",
  storageBucket: "luna-5a497.firebasestorage.app",
  messagingSenderId: "915765095360",
  appId: "1:915765095360:web:689905fc5455bdbb76f625"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loginSection = document.getElementById("login-section");
const adminSection = document.getElementById("admin-content");
const errorMessage = document.getElementById("error-message");
const logoutBtn = document.getElementById("logout-btn");

const addDishForm = document.getElementById("add-dish-form");
const menuList = document.getElementById("menu-list");
const dishPriceInput = document.getElementById("dish-price");

// Función para manejar el inicio de sesión
document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            loginSection.style.display = "none";
            adminSection.style.display = "block";
            loadMenu();
        })
        .catch((error) => {
            errorMessage.style.display = "block";
        });
});

// Verificar el estado de autenticación del usuario
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginSection.style.display = "none";
        adminSection.style.display = "block";
        loadMenu();
    } else {
        loginSection.style.display = "block";
        adminSection.style.display = "none";
    }
});

// Función para cargar el menú
async function loadMenu() {
    const querySnapshot = await getDocs(collection(db, "menu"));
    menuList.innerHTML = ''; // Limpiar la lista antes de mostrarla

    querySnapshot.forEach((doc) => {
        const dish = doc.data();
        const dishDiv = document.createElement("div");
        dishDiv.classList.add("dish-card");
        dishDiv.innerHTML = `
            <img src="${dish.img}" alt="${dish.name}" width="100">
            <h5>${dish.name}</h5>
            <p><strong>Precio:</strong> ${dish.price}</p>
            <p><strong>Categoría:</strong> ${dish.category}</p>
            <p><strong>Descripción:</strong> ${dish.description}</p>
            <button onclick="deleteDish('${doc.id}')">Eliminar</button>
        `;
        menuList.appendChild(dishDiv);
    });
}

window.deleteDish = async function (id) {
    await deleteDoc(doc(db, "menu", id));
    loadMenu();
};

// Agregar un nuevo plato
async function addDish(name, category, price, img, description) {
    await addDoc(collection(db, "menu"), {
        name: name,
        category: category,
        price: `$${price}`,
        img: img,
        description: description
    });
    loadMenu();
}

// Subir imagen a Cloudinary
async function uploadToCloudinary(file) {
   const url = `https://api.cloudinary.com/v1_1/dmlex134e/image/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default");

    try {
        const response = await fetch(url, {
            method: "POST",
            body: formData,
        });
        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error("Error al subir la imagen:", error);
        throw error;
    }
}

addDishForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("dish-name").value;
    const category = document.getElementById("dish-category").value;
    const price = dishPriceInput.value.replace("$", "").trim();
    const fileInput = document.getElementById("dish-img-upload");
    const description = document.getElementById("dish-description").value;

    const file = fileInput.files[0];
    if (!file) {
        alert("Por favor, selecciona una imagen para el producto.");
        return;
    }

    try {
        const imgURL = await uploadToCloudinary(file);
        await addDish(name, category, price, imgURL, description);
        addDishForm.reset();
        alert("Producto agregado correctamente.");
    } catch (error) {
        alert("Error al agregar el producto. Inténtalo nuevamente.");
    }
});

// Función para cerrar sesión
logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
        // Limpiar los campos de correo y contraseña
        document.getElementById("email").value = '';
        document.getElementById("password").value = '';

        // Al cerrar sesión, redirige al login
        loginSection.style.display = "block";
        adminSection.style.display = "none";
    }).catch((error) => {
        console.error("Error al cerrar sesión:", error);
    });
});
