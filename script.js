import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

// Firebase конфигурация
const firebaseConfig = {
    apiKey: "AIzaSyA8NY2vDCOd5ePK5fDMWaMd2JfsRrTabf4",
    authDomain: "flud-73dba.firebaseapp.com",
    projectId: "flud-73dba",
    storageBucket: "flud-73dba.appspot.com",
    messagingSenderId: "799414854266",
    appId: "1:799414854266:web:97a0a54eeb9271389c11c3",
    measurementId: "G-C2VRPHPDRG"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Элементы
const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");
const addRuleButton = document.getElementById("addRuleButton");
const addRuleContainer = document.getElementById("addRuleContainer");
const rulesList = document.getElementById("rules");
const imageUpload = document.getElementById("imageUpload");
const uploadImageButton = document.getElementById("uploadImageButton");
const approvedImages = document.getElementById("approvedImages");
const pendingContainer = document.getElementById("pendingContainer");
const pendingImages = document.getElementById("pendingImages");

// Обработка аутентификации
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginButton.style.display = "none";
        logoutButton.style.display = "inline-block";
        addRuleContainer.style.display = "block";
        pendingContainer.style.display = "block";
    } else {
        loginButton.style.display = "inline-block";
        logoutButton.style.display = "none";
        addRuleContainer.style.display = "none";
        pendingContainer.style.display = "none";
    }
});

loginButton.addEventListener("click", async () => {
    const email = prompt("Введите email");
    const password = prompt("Введите пароль");
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        alert("Ошибка входа: " + error.message);
    }
});

logoutButton.addEventListener("click", async () => {
    await signOut(auth);
});

// Добавление правила
addRuleButton.addEventListener("click", async () => {
    const newRule = document.getElementById("new-rule").value;
    if (newRule.trim() === "") return;

    try {
        await addDoc(collection(db, "rules"), { text: newRule });
        loadRules();
    } catch (error) {
        console.error("Ошибка при добавлении правила: ", error);
    }
});

// Загрузка правил
async function loadRules() {
    rulesList.innerHTML = "";
    const rulesSnapshot = await getDocs(collection(db, "rules"));
    rulesSnapshot.forEach((doc) => {
        const ruleItem = document.createElement("li");
        ruleItem.classList.add("rule-item");
        ruleItem.innerHTML = `
            <p>${doc.data().text}</p>
            <button class="delete-button" data-id="${doc.id}">Удалить</button>
        `;
        rulesList.appendChild(ruleItem);
    });
    attachDeleteHandlers();
}

// Обработка удаления правила
function attachDeleteHandlers() {
    const deleteButtons = document.querySelectorAll(".delete-button");
    deleteButtons.forEach((button) => {
        button.addEventListener("click", async (e) => {
            const ruleId = e.target.dataset.id;
            try {
                await deleteDoc(doc(db, "rules", ruleId));
                loadRules();
            } catch (error) {
                console.error("Ошибка при удалении правила: ", error);
            }
        });
    });
}

// Загрузка изображения
uploadImageButton.addEventListener("click", async () => {
    const file = imageUpload.files[0];
    if (!file) return;

    const storageRef = ref(storage, `pending_images/${file.name}`);
    try {
        await uploadBytes(storageRef, file);
        alert("Изображение загружено и ожидает проверки.");
        loadPendingImages();
    } catch (error) {
        console.error("Ошибка при загрузке изображения: ", error);
    }
});

// Загрузка проверенных изображений
async function loadApprovedImages() {
    const approvedSnapshot = await getDocs(collection(db, "approved_images"));
    approvedImages.innerHTML = "";
    approvedSnapshot.forEach(async (doc) => {
        const imageUrl = await getDownloadURL(ref(storage, doc.data().path));
        const imgElement = document.createElement("img");
        imgElement.src = imageUrl;
        approvedImages.appendChild(imgElement);
    });
}

// Загрузка ожидающих изображений
async function loadPendingImages() {
    const pendingSnapshot = await getDocs(collection(db, "pending_images"));
    pendingImages.innerHTML = "";
    pendingSnapshot.forEach(async (doc) => {
        const imageUrl = await getDownloadURL(ref(storage, doc.data().path));
        const imgElement = document.createElement("img");
        imgElement.src = imageUrl;
        pendingImages.appendChild(imgElement);

        // Кнопка для подтверждения изображения
        const approveButton = document.createElement("button");
        approveButton.textContent = "Подтвердить";
        approveButton.addEventListener("click", async () => {
            try {
                await addDoc(collection(db, "approved_images"), { path: doc.data().path });
                await deleteDoc(doc(db, "pending_images", doc.id));
                loadApprovedImages();
                loadPendingImages();
            } catch (error) {
                console.error("Ошибка при подтверждении изображения: ", error);
            }
        });
        pendingImages.appendChild(approveButton);
    });
}

// Начальная загрузка правил и изображений
loadRules();
loadApprovedImages();
