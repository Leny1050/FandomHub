import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

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

// Массив с разрешенными адресами электронной почты
const allowedEmails = [
    "wulk741852963@gmail.com",
    "101010tatata1010@gmail.com",
    "fludvsefd500@gmail.com"
];

// Функция для проверки состояния аутентификации
onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('addRuleContainer').style.display = 'block';
        document.getElementById('pendingContainer').style.display = 'block';
        document.getElementById('applicationsContainer').style.display = 'block';
        document.getElementById('approvedContainer').style.display = 'block';
        document.getElementById('loginButton').style.display = 'none';
        document.getElementById('logoutButton').style.display = 'inline-block';
    } else {
        document.getElementById('addRuleContainer').style.display = 'none';
        document.getElementById('pendingContainer').style.display = 'none';
        document.getElementById('applicationsContainer').style.display = 'none';
        document.getElementById('approvedContainer').style.display = 'block'; // Занятые роли видны всегда
        document.getElementById('loginButton').style.display = 'inline-block';
        document.getElementById('logoutButton').style.display = 'none';
    }
    loadRules();  // Загружаем правила при изменении статуса аутентификации
    loadImages();  // Загружаем изображения при изменении статуса аутентификации
    loadApplications();  // Загружаем анкеты при изменении статуса аутентификации
});

// Вход пользователя
document.getElementById('loginButton').addEventListener('click', () => {
    const email = prompt("Введите ваш email:");
    const password = prompt("Введите ваш пароль:");
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            alert("Вы успешно вошли в систему!");
        })
        .catch((error) => {
            alert("Ошибка при входе: " + error.message);
        });
});

// Выход пользователя
document.getElementById('logoutButton').addEventListener('click', () => {
    signOut(auth).then(() => {
        alert("Вы вышли из системы.");
    }).catch((error) => {
        alert("Ошибка при выходе: " + error.message);
    });
});

// Функции для загрузки и управления правилами
async function loadRules() {
    const querySnapshot = await getDocs(collection(db, "rules"));
    const rulesContainer = document.getElementById('rules');
    rulesContainer.innerHTML = "";  // Очистить контейнер

    const uniqueRules = new Set(); // Используем Set для отслеживания уникальных ролей

    querySnapshot.forEach((doc) => {
        const rule = doc.data().text;

        // Добавляем роль в Set, если её там ещё нет
        if (!uniqueRules.has(rule)) {
            uniqueRules.add(rule);

            const ruleElement = document.createElement('li');
            ruleElement.classList.add('rule-item');

            const ruleText = document.createElement('p');
            ruleText.textContent = rule;

            // Проверка, является ли текущий пользователь авторизованным и есть ли у него права
            if (auth.currentUser && allowedEmails.includes(auth.currentUser.email)) {
                const deleteButton = document.createElement('button');
                deleteButton.textContent = "Удалить";
                deleteButton.onclick = () => deleteRule(doc.id); // Удаление правила
                ruleElement.appendChild(deleteButton);
            }

            ruleElement.appendChild(ruleText);
            rulesContainer.appendChild(ruleElement);
        }
    });
}

async function deleteRule(id) {
    try {
        await deleteDoc(doc(db, "rules", id));
        loadRules();  // Перезагрузить правила после удаления
    } catch (e) {
        alert("Ошибка при удалении правила: " + e.message);
    }
}

// Функции для загрузки изображений
async function loadImages() {
    const approvedImagesContainer = document.getElementById('approvedImages');
    approvedImagesContainer.innerHTML = "";  // Очистить контейнер для одобренных изображений

    const querySnapshot = await getDocs(collection(db, "images"));
    
    querySnapshot.forEach((doc) => {
        const image = doc.data();
        if (image.status === "approved") {
            const imageElement = document.createElement('img');
            imageElement.src = image.url;
            approvedImagesContainer.appendChild(imageElement);
        }
    });
}

async function uploadImage() {
    const file = document.getElementById('imageUpload').files[0];
    if (!file) return;

    const storageRef = ref(storage, `images/${file.name}`);
    await uploadBytes(storageRef, file);

    const url = await getDownloadURL(storageRef);
    await addDoc(collection(db, "images"), {
        url: url,
        status: "pending" // Изначально статус - ожидающий
    });

    loadImages(); // Перезагрузить изображения после загрузки
}

// Вызов функции загрузки изображений при клике
document.getElementById('uploadImageButton').addEventListener('click', uploadImage);

async function approveImage(id, url) {
    try {
        const imageRef = doc(db, "images", id);
        await updateDoc(imageRef, {
            status: "approved"
        });
        loadImages();  // Перезагрузить изображения после одобрения
    } catch (e) {
        alert("Ошибка при одобрении изображения: " + e.message);
    }
}

async function deleteImage(id, url) {
    try {
        const storageRef = ref(storage, url);
        await deleteObject(storageRef);
        await deleteDoc(doc(db, "images", id));
        loadImages();  // Перезагрузить изображения после удаления
    } catch (e) {
        alert("Ошибка при удалении изображения: " + e.message);
    }
}

// Функции для загрузки и управления заявками
async function loadApplications() {
    const pendingApplicationsContainer = document.getElementById('pendingApplications');
    const approvedApplicationsContainer = document.getElementById('approvedApplications');
    
    pendingApplicationsContainer.innerHTML = "";  // Очистить контейнер для ожидающих анкет
    approvedApplicationsContainer.innerHTML = "";  // Очистить контейнер для занятых ролей

    const uniqueRoles = new Set(); // Используем Set для отслеживания уникальных ролей

    const querySnapshot = await getDocs(collection(db, "applications"));
    
    querySnapshot.forEach((doc) => {
        const application = doc.data();
        const role = application.role;
        const fandom = application.fandom;
        const status = application.status;  // "pending" или "approved"

        if (status === "approved" && !uniqueRoles.has(role)) {
            uniqueRoles.add(role); // Добавляем роль в Set

            const applicationElement = document.createElement('div');
            applicationElement.textContent = `Роль: ${role}, Фандом: ${fandom}`;

            const approvedText = document.createElement('span');
            approvedText.textContent = ` (Занята)`;
            applicationElement.appendChild(approvedText);

            approvedApplicationsContainer.appendChild(applicationElement);
        }

        if (status === "pending") {
            const applicationElement = document.createElement('div');
            applicationElement.textContent = `Роль: ${role}, Фандом: ${fandom}`;

            // Проверка, является ли текущий пользователь авторизованным и есть ли у него права
            if (auth.currentUser && allowedEmails.includes(auth.currentUser.email)) {
                const approveButton = document.createElement('button');
                approveButton.textContent = "Одобрить";
                approveButton.onclick = () => approveApplication(doc.id, role, fandom);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = "Удалить";
                deleteButton.onclick = () => deleteApplication(doc.id);

                applicationElement.appendChild(approveButton);
                applicationElement.appendChild(deleteButton);
            }

            pendingApplicationsContainer.appendChild(applicationElement);
        }
    });
}

async function approveApplication(id, role, fandom) {
    try {
        const applicationRef = doc(db, "applications", id);
        await updateDoc(applicationRef, {
            status: "approved"
        });
        loadApplications();  // Перезагрузить заявки после одобрения
    } catch (e) {
        alert("Ошибка при одобрении заявки: " + e.message);
    }
}

async function deleteApplication(id) {
    try {
        await deleteDoc(doc(db, "applications", id));
        loadApplications();  // Перезагрузить заявки после удаления
    } catch (e) {
        alert("Ошибка при удалении заявки: " + e.message);
    }
}

// Начальная загрузка данных
document.addEventListener('DOMContentLoaded', () => {
    loadRules();
    loadImages();
    loadApplications();
});
