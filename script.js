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
    const addRuleContainer = document.getElementById('addRuleContainer');
    const pendingContainer = document.getElementById('pendingContainer');
    const applicationsContainer = document.getElementById('applicationsContainer');
    const approvedContainer = document.getElementById('approvedContainer');
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');

    if (user) {
        if (addRuleContainer) addRuleContainer.style.display = 'block';
        if (pendingContainer) pendingContainer.style.display = 'block';
        if (applicationsContainer) applicationsContainer.style.display = 'block';
        if (approvedContainer) approvedContainer.style.display = 'block';
        if (loginButton) loginButton.style.display = 'none';
        if (logoutButton) logoutButton.style.display = 'inline-block';
    } else {
        if (addRuleContainer) addRuleContainer.style.display = 'none';
        if (pendingContainer) pendingContainer.style.display = 'none';
        if (applicationsContainer) applicationsContainer.style.display = 'none';
        if (approvedContainer) approvedContainer.style.display = 'none';
        if (loginButton) loginButton.style.display = 'inline-block';
        if (logoutButton) logoutButton.style.display = 'none';
    }
    loadRules();  // Загружаем правила при изменении статуса аутентификации
    loadImages();  // Загружаем изображения при изменении статуса аутентификации
    loadApplications();  // Загружаем анкеты при изменении статуса аутентификации
});

// Вход пользователя
document.getElementById('loginButton').addEventListener('click', () => {
    const email = prompt("Введите ваш email:");
    const password = prompt("Введите ваш пароль:");
    if (email && password) {
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                alert("Вы успешно вошли в систему!");
            })
            .catch((error) => {
                alert("Ошибка при входе: " + error.message);
            });
    }
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
    if (!rulesContainer) return;  // Проверка на наличие элемента
    rulesContainer.innerHTML = "";  // Очистить контейнер

    querySnapshot.forEach((doc) => {
        const rule = doc.data().text;
        const ruleElement = document.createElement('li');
        ruleElement.classList.add('rule-item');

        const ruleText = document.createElement('p');
        ruleText.textContent = rule;

        // Проверка, является ли текущий пользователь авторизованным и есть ли у него права
        if (auth.currentUser && allowedEmails.includes(auth.currentUser.email)) {
            const deleteButton = document.createElement('button');
            deleteButton.textContent = "Удалить";
            deleteButton.classList.add('delete-button');
            deleteButton.onclick = () => deleteRule(doc.id);

            ruleElement.appendChild(ruleText);
            ruleElement.appendChild(deleteButton);
        } else {
            ruleElement.appendChild(ruleText);
        }

        rulesContainer.appendChild(ruleElement);
    });
}

async function addRule() {
    const newRuleInput = document.getElementById('new-rule');
    if (!newRuleInput) return;  // Проверка на наличие элемента
    const newRuleText = newRuleInput.value.trim();

    // Проверка, является ли текущий пользователь авторизованным и есть ли у него права
    if (newRuleText && auth.currentUser && allowedEmails.includes(auth.currentUser.email)) {
        try {
            await addDoc(collection(db, "rules"), {
                text: newRuleText
            });
            newRuleInput.value = "";  // Очистить поле ввода
            loadRules();  // Перезагрузить правила
        } catch (e) {
            alert("Ошибка при добавлении правила: " + e.message);
        }
    } else {
        alert("Пожалуйста, войдите в систему с разрешенным адресом электронной почты для добавления правила.");
    }
}
document.getElementById('addRuleButton').addEventListener('click', addRule);

async function deleteRule(id) {
    try {
        await deleteDoc(doc(db, "rules", id));
        loadRules();  // Перезагрузить правила после удаления
    } catch (e) {
        alert("Ошибка при удалении правила: " + e.message);
    }
}

// Функции для загрузки и управления изображениями
async function loadImages() {
    const approvedImagesContainer = document.getElementById('approvedImages');
    const pendingImagesContainer = document.getElementById('pendingImages');
    if (!approvedImagesContainer || !pendingImagesContainer) return;  // Проверка на наличие контейнеров
    approvedImagesContainer.innerHTML = "";  // Очистить контейнер для одобренных изображений
    pendingImagesContainer.innerHTML = "";  // Очистить контейнер для ожидающих изображений

    const querySnapshot = await getDocs(collection(db, "images"));
    querySnapshot.forEach((doc) => {
        const imageUrl = doc.data().url;
        const status = doc.data().status;  // "approved" или "pending"

        const imageElement = document.createElement('div');
        const img = document.createElement('img');
        img.src = imageUrl;
        imageElement.appendChild(img);

        if (status === "approved") {
            const deleteButton = document.createElement('button');
            deleteButton.textContent = "Удалить";
            deleteButton.onclick = () => deleteImage(doc.id, imageUrl);
            imageElement.appendChild(deleteButton);  // Добавляем кнопку удаления
            approvedImagesContainer.appendChild(imageElement);
        } else if (status === "pending" && auth.currentUser) {
            const approveButton = document.createElement('button');
            approveButton.textContent = "Одобрить";
            approveButton.onclick = () => approveImage(doc.id, imageUrl);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = "Удалить";
            deleteButton.onclick = () => deleteImage(doc.id, imageUrl);

            imageElement.appendChild(approveButton);
            imageElement.appendChild(deleteButton);
            pendingImagesContainer.appendChild(imageElement);
        }
    });
}

document.getElementById('uploadImageButton').addEventListener('click', async () => {
    const fileInput = document.getElementById('imageUpload');
    if (!fileInput) return;  // Проверка на наличие элемента
    const file = fileInput.files[0];
    if (!file) return;

    const storageRef = ref(storage, 'images/' + file.name);
    try {
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        await addDoc(collection(db, "images"), {
            url: url,
            status: "pending"
        });
        alert("Изображение загружено и ожидает проверки.");
        loadImages();  // Перезагрузить изображения после загрузки
    } catch (e) {
        alert("Ошибка при загрузке изображения: " + e.message);
    }
});

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
        // Проверка существования изображения перед удалением
        const storageRef = ref(storage, url);
        await getDownloadURL(storageRef); // Это выбросит ошибку, если файл не существует

        // Если файл существует, удалить его
        await deleteObject(storageRef);
        await deleteDoc(doc(db, "images", id));
        loadImages();  // Перезагрузить изображения после удаления
    } catch (e) {
        if (e.code === 'storage/object-not-found') {
            alert("Ошибка: Файл не найден. Возможно, он уже удален.");
        } else {
            alert("Ошибка при удалении изображения: " + e.message);
        }
        // Перезагрузить изображения, чтобы очистить контейнеры
        loadImages();
    }
}


// Функции для загрузки и управления анкетами
async function loadApplications() {
    const pendingApplicationsContainer = document.getElementById('pendingApplications');
    const approvedApplicationsContainer = document.getElementById('approvedApplications');
    if (!pendingApplicationsContainer || !approvedApplicationsContainer) return;  // Проверка на наличие контейнеров
    pendingApplicationsContainer.innerHTML = "";  // Очистить контейнер для ожидающих анкет
    approvedApplicationsContainer.innerHTML = "";  // Очистить контейнер для занятых ролей

    const querySnapshot = await getDocs(collection(db, "applications"));
    querySnapshot.forEach((doc) => {
        const application = doc.data();
        const role = application.role;
        const fandom = application.fandom;
        const status = application.status;  // "pending" или "approved"

        const applicationElement = document.createElement('div');
        applicationElement.textContent = `Роль: ${role}, Фандом: ${fandom}`;

        if (status === "pending" && auth.currentUser) {
            const approveButton = document.createElement('button');
            approveButton.textContent = "Одобрить";
            approveButton.onclick = () => approveApplication(doc.id, role, fandom);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = "Удалить";
            deleteButton.onclick = () => deleteApplication(doc.id);

            applicationElement.appendChild(approveButton);
            applicationElement.appendChild(deleteButton);
            pendingApplicationsContainer.appendChild(applicationElement);
        } else if (status === "approved") {
            const deleteButton = document.createElement('button');
            deleteButton.textContent = "Удалить";
            deleteButton.onclick = () => deleteApplication(doc.id);

            applicationElement.appendChild(deleteButton);
            approvedApplicationsContainer.appendChild(applicationElement);
        }
    });
}

document.getElementById('applicationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const role = document.getElementById('role');
    const fandom = document.getElementById('fandom');
    if (!role || !fandom) return;  // Проверка на наличие элементов

    try {
        await addDoc(collection(db, "applications"), {
            role: role.value.trim(),
            fandom: fandom.value.trim(),
            status: "pending"
        });
        alert("Ваша анкета отправлена и ожидает проверки.");
        loadApplications();  // Перезагрузить анкеты после отправки
    } catch (e) {
        alert("Ошибка при отправке анкеты: " + e.message);
    }
});

async function approveApplication(id, role, fandom) {
    try {
        const applicationRef = doc(db, "applications", id);
        await updateDoc(applicationRef, {
            status: "approved"
        });
        loadApplications();  // Перезагрузить анкеты после одобрения
    } catch (e) {
        alert("Ошибка при одобрении анкеты: " + e.message);
    }
}

async function deleteApplication(id) {
    try {
        await deleteDoc(doc(db, "applications", id));
        loadApplications();  // Перезагрузить анкеты после удаления
    } catch (e) {
        alert("Ошибка при удалении анкеты: " + e.message);
    }
}
