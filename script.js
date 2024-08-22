import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

// Firebase конфигурация
const firebaseConfig = {
    apiKey: "AIzaSyDB8xtw8-AYLO7vwcnU3A4-tbGWdRibAJU",
    authDomain: "flud-po-fandomam.firebaseapp.com",
    projectId: "flud-po-fandomam",
    storageBucket: "flud-po-fandomam.appspot.com",
    messagingSenderId: "30961710313",
    appId: "1:30961710313:web:4bc81ff6a1ff1b6f4dbf5d",
    measurementId: "G-WH6ZXJMG15"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Загрузка правил из Firestore
async function loadRules() {
    const rulesCollection = collection(db, "rules");
    const rulesSnapshot = await getDocs(rulesCollection);
    const rulesList = document.getElementById("rules");
    rulesList.innerHTML = ""; // Очищаем список перед загрузкой новых данных
    rulesSnapshot.forEach((doc) => {
        const ruleItem = document.createElement("li");
        ruleItem.className = "rule-item";
        ruleItem.textContent = doc.data().text;

        // Добавление кнопки удаления только если пользователь авторизован
        const user = auth.currentUser;
        if (user) {
            const deleteButton = document.createElement("button");
            deleteButton.className = "delete-button";
            deleteButton.textContent = "Удалить";
            deleteButton.onclick = async () => {
                await deleteDoc(doc(db, "rules", doc.id));
                loadRules(); // Перезагружаем правила после удаления
            };
            ruleItem.appendChild(deleteButton);
        }

        rulesList.appendChild(ruleItem);
    });
}

// Добавление нового правила
async function addRule(ruleText) {
    const user = auth.currentUser;
    if (user) {
        await addDoc(collection(db, "rules"), {
            text: ruleText,
            user: user.uid
        });
        loadRules(); // Перезагружаем правила после добавления
    }
}

// Обработка события добавления правила
document.getElementById("addRuleButton").addEventListener("click", () => {
    const newRuleInput = document.getElementById("new-rule");
    const newRuleText = newRuleInput.value;
    if (newRuleText) {
        addRule(newRuleText);
        newRuleInput.value = ""; // Очистка поля ввода после добавления
    }
});

// Аутентификация через Google
document.getElementById("loginButton").addEventListener("click", () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
});

// Выход из аккаунта
document.getElementById("logoutButton").addEventListener("click", () => {
    signOut(auth);
});

// Отслеживание состояния аутентификации
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById("loginButton").style.display = "none";
        document.getElementById("logoutButton").style.display = "block";
        document.getElementById("addRuleContainer").style.display = "block";
        loadRules();
        loadPendingImages();
    } else {
        document.getElementById("loginButton").style.display = "block";
        document.getElementById("logoutButton").style.display = "none";
        document.getElementById("addRuleContainer").style.display = "none";
        loadRules();
    }
});

// Функция загрузки изображений
async function uploadImage(file) {
    const user = auth.currentUser;
    if (user) {
        const storageRef = ref(storage, `images/${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        await addDoc(collection(db, "images"), {
            url: downloadURL,
            user: user.uid,
            approved: false
        });
        loadPendingImages(); // Обновление ожидающих изображений после загрузки
    }
}

// Обработка события загрузки изображения
document.getElementById("uploadImageButton").addEventListener("click", () => {
    const fileInput = document.getElementById("imageUpload");
    const file = fileInput.files[0];
    if (file) {
        uploadImage(file);
        fileInput.value = ""; // Очистка поля ввода после загрузки
    }
});

// Загрузка ожидающих изображений из Firestore
async function loadPendingImages() {
    const imagesCollection = collection(db, "images");
    const imagesSnapshot = await getDocs(imagesCollection);
    const pendingContainer = document.getElementById("pendingImages");
    pendingContainer.innerHTML = ""; // Очищаем контейнер перед загрузкой новых данных
    imagesSnapshot.forEach((doc) => {
        if (!doc.data().approved) {
            const imageElement = document.createElement("img");
            imageElement.src = doc.data().url;
            imageElement.alt = "Pending Image";
            imageElement.classList.add("pending-image");

            const approveButton = document.createElement("button");
            approveButton.textContent = "Approve";
            approveButton.onclick = async () => {
                await updateDoc(doc.ref, {
                    approved: true
                });
                loadPendingImages(); // Перезагружаем изображения после подтверждения
                loadApprovedImages();
            };

            const pendingItem = document.createElement("div");
            pendingItem.className = "pending-item";
            pendingItem.appendChild(imageElement);
            pendingItem.appendChild(approveButton);
            pendingContainer.appendChild(pendingItem);
        }
    });
}

// Загрузка подтвержденных изображений из Firestore
async function loadApprovedImages() {
    const imagesCollection = collection(db, "images");
    const imagesSnapshot = await getDocs(imagesCollection);
    const approvedContainer = document.getElementById("approvedImages");
    approvedContainer.innerHTML = ""; // Очищаем контейнер перед загрузкой новых данных
    imagesSnapshot.forEach((doc) => {
        if (doc.data().approved) {
            const imageElement = document.createElement("img");
            imageElement.src = doc.data().url;
            imageElement.alt = "Approved Image";
            imageElement.classList.add("approved-image");
            approvedContainer.appendChild(imageElement);
        }
    });
}

// Инициализация загрузки изображений при старте страницы
loadApprovedImages();

