// Импорт необходимых модулей Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

// Конфигурация Firebase
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

// Массив разрешенных адресов электронной почты
const allowedEmails = [
    "wulk741852963@gmail.com",
    "101010tatata1010@gmail.com",
    "fludvsefd500@gmail.com"
];

// Слушатель изменений состояния аутентификации
onAuthStateChanged(auth, (user) => {
    toggleUI(user);
    loadRules();
    loadImages();
    loadApplications();
    loadOccupiedRoles(); // Загружаем занятые роли
});

// Функция переключения интерфейса в зависимости от состояния аутентификации
function toggleUI(user) {
    const isAuthenticated = !!user;
    document.getElementById('addRuleContainer').style.display = isAuthenticated ? 'block' : 'none';
    document.getElementById('pendingContainer').style.display = isAuthenticated ? 'block' : 'none';
    document.getElementById('applicationsContainer').style.display = isAuthenticated ? 'block' : 'none';
    document.getElementById('approvedContainer').style.display = isAuthenticated ? 'block' : 'none';
    document.getElementById('rolesContainer').style.display = (isAuthenticated && allowedEmails.includes(auth.currentUser.email)) ? 'block' : 'none';
    document.getElementById('loginButton').style.display = isAuthenticated ? 'none' : 'inline-block';
    document.getElementById('logoutButton').style.display = isAuthenticated ? 'inline-block' : 'none';
}

// Вход пользователя
document.getElementById('loginButton').addEventListener('click', async () => {
    const email = prompt("Введите ваш email:");
    const password = prompt("Введите ваш пароль:");
    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Вы успешно вошли в систему!");
    } catch (error) {
        alert("Ошибка при входе: " + error.message);
    }
});

// Выход пользователя
document.getElementById('logoutButton').addEventListener('click', async () => {
    try {
        await signOut(auth);
        alert("Вы вышли из системы.");
    } catch (error) {
        alert("Ошибка при выходе: " + error.message);
    }
});

// Загрузка правил из Firestore
async function loadRules() {
    const querySnapshot = await getDocs(collection(db, "rules"));
    const rulesContainer = document.getElementById('rules');
    rulesContainer.innerHTML = ""; // Очистить контейнер

    querySnapshot.forEach((doc) => {
        const rule = doc.data().text;
        const ruleElement = document.createElement('li');
        ruleElement.classList.add('rule-item');
        ruleElement.textContent = rule;

        // Проверка, если пользователь авторизован и имеет доступ
        if (auth.currentUser && allowedEmails.includes(auth.currentUser.email)) {
            const deleteButton = document.createElement('button');
            deleteButton.textContent = "Удалить";
            deleteButton.classList.add('delete-button');
            deleteButton.onclick = () => deleteRule(doc.id);
            ruleElement.appendChild(deleteButton);
        }

        rulesContainer.appendChild(ruleElement);
    });
}

// Добавление нового правила
document.getElementById('addRuleButton').addEventListener('click', addRule);
async function addRule() {
    const newRuleInput = document.getElementById('new-rule');
    const newRuleText = newRuleInput.value.trim();

    if (newRuleText && auth.currentUser && allowedEmails.includes(auth.currentUser.email)) {
        try {
            await addDoc(collection(db, "rules"), { text: newRuleText });
            newRuleInput.value = ""; // Очистить поле ввода
            loadRules(); // Перезагрузить правила
        } catch (error) {
            alert("Ошибка при добавлении правила: " + error.message);
        }
    } else {
        alert("Пожалуйста, войдите в систему с разрешенным адресом электронной почты для добавления правила.");
    }
}

// Удаление правила
async function deleteRule(id) {
    try {
        await deleteDoc(doc(db, "rules", id));
        loadRules(); // Перезагрузить правила после удаления
    } catch (error) {
        alert("Ошибка при удалении правила: " + error.message);
    }
}

// Загрузка изображений из Firestore
async function loadImages() {
    const approvedImagesContainer = document.getElementById('approvedImages');
    const pendingImagesContainer = document.getElementById('pendingImages');
    approvedImagesContainer.innerHTML = ""; // Очистить контейнер для одобренных изображений
    pendingImagesContainer.innerHTML = ""; // Очистить контейнер для ожидающих изображений

    const querySnapshot = await getDocs(collection(db, "images"));
    querySnapshot.forEach((doc) => {
        const { url, status } = doc.data();
        const imageElement = document.createElement('div');
        const img = document.createElement('img');
        img.src = url;
        imageElement.appendChild(img);

        if (status === "approved") {
            const deleteButton = document.createElement('button');
            deleteButton.textContent = "Удалить";
            deleteButton.onclick = () => deleteImage(doc.id, url);
            imageElement.appendChild(deleteButton);
            approvedImagesContainer.appendChild(imageElement);
        } else if (status === "pending" && auth.currentUser) {
            const approveButton = document.createElement('button');
            approveButton.textContent = "Одобрить";
            approveButton.onclick = () => approveImage(doc.id);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = "Удалить";
            deleteButton.onclick = () => deleteImage(doc.id, url);

            imageElement.appendChild(approveButton);
            imageElement.appendChild(deleteButton);
            pendingImagesContainer.appendChild(imageElement);
        }
    });
}

// Загрузка изображения
document.getElementById('uploadImageButton').addEventListener('click', async () => {
    const fileInput = document.getElementById('imageUpload');
    const file = fileInput.files[0];
    if (!file) return;

    const storageRef = ref(storage, 'images/' + file.name);
    try {
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        await addDoc(collection(db, "images"), { url: url, status: "pending" });
        alert("Изображение загружено и ожидает проверки.");
        loadImages(); // Перезагрузить изображения после загрузки
    } catch (error) {
        alert("Ошибка при загрузке изображения: " + error.message);
    }
});

// Одобрение изображения
async function approveImage(id) {
    try {
        const imageRef = doc(db, "images", id);
        await updateDoc(imageRef, { status: "approved" });
        loadImages(); // Перезагрузить изображения после одобрения
    } catch (error) {
        alert("Ошибка при одобрении изображения: " + error.message);
    }
}

// Удаление изображения
async function deleteImage(id, url) {
    try {
        const storageRef = ref(storage, url);
        await deleteObject(storageRef);
        await deleteDoc(doc(db, "images", id)); // Исправлено
        loadImages(); // Перезагрузить изображения после удаления
    } catch (error) {
        alert("Ошибка при удалении изображения: " + error.message);
    }
}

// Функция для загрузки и управления анкетами
async function loadApplications() {
    const pendingApplicationsContainer = document.getElementById('pendingApplications');
    const approvedApplicationsContainer = document.getElementById('approvedApplications');
    pendingApplicationsContainer.innerHTML = "";  // Очистить контейнер для ожидающих анкет
    approvedApplicationsContainer.innerHTML = "";  // Очистить контейнер для одобренных анкет

    const querySnapshot = await getDocs(collection(db, "applications"));
    querySnapshot.forEach((doc) => {
        const { role, fandom, status } = doc.data();
        const applicationElement = document.createElement('div');
        applicationElement.textContent = `Роль: ${role}, Фандом: ${fandom}`;

        if (status === "approved") {
            approvedApplicationsContainer.appendChild(applicationElement);
        } else if (status === "pending" && auth.currentUser) {
            const approveButton = document.createElement('button');
            approveButton.textContent = "Одобрить";
            approveButton.onclick = () => approveApplication(doc.id);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = "Удалить";
            deleteButton.onclick = () => deleteApplication(doc.id);

            applicationElement.appendChild(approveButton);
            applicationElement.appendChild(deleteButton);
            pendingApplicationsContainer.appendChild(applicationElement);
        }
    });
}

// Одобрение анкеты
async function approveApplication(id) {
    try {
        const applicationRef = doc(db, "applications", id);
        await updateDoc(applicationRef, { status: "approved" });
        loadApplications(); // Перезагрузить анкеты после одобрения
    } catch (error) {
        alert("Ошибка при одобрении анкеты: " + error.message);
    }
}

// Удаление анкеты
async function deleteApplication(id) {
    try {
        await deleteDoc(doc(db, "applications", id));
        loadApplications(); // Перезагрузить анкеты после удаления
    } catch (error) {
        alert("Ошибка при удалении анкеты: " + error.message);
    }
}

// Загрузка занятых ролей
async function loadOccupiedRoles() {
    const rolesContainer = document.getElementById('rolesList');
    rolesContainer.innerHTML = ""; // Очистить контейнер для занятых ролей

    const querySnapshot = await getDocs(collection(db, "roles"));
    querySnapshot.forEach((doc) => {
        const roleElement = document.createElement('li');
        roleElement.textContent = doc.data().name;
        rolesContainer.appendChild(roleElement);
    });
}
// Добавление новой роли
document.getElementById('addRoleButton').addEventListener('click', addRole);
async function addRole() {
    const newRoleInput = document.getElementById('new-role');
    const newRoleText = newRoleInput.value.trim();

    if (newRoleText && auth.currentUser && allowedEmails.includes(auth.currentUser.email)) {
        try {
            await addDoc(collection(db, "roles"), { name: newRoleText });
            newRoleInput.value = ""; // Очистить поле ввода
            loadOccupiedRoles(); // Перезагрузить занятые роли
        } catch (error) {
            alert("Ошибка при добавлении роли: " + error.message);
        }
    } else {
        alert("Пожалуйста, войдите в систему с разрешенным адресом электронной почты для добавления роли.");
    }
}

// Удаление роли
async function deleteRole(id) {
    try {
        await deleteDoc(doc(db, "roles", id));
        loadOccupiedRoles(); // Перезагрузить занятые роли после удаления
    } catch (error) {
        alert("Ошибка при удалении роли: " + error.message);
    }
}

// Обработка загрузки изображений с формами
document.getElementById('imageUpload').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const fileName = document.getElementById('fileName');
        fileName.textContent = `Выбран файл: ${file.name}`;
    }
});

// Сброс формы
document.getElementById('resetFormButton').addEventListener('click', () => {
    document.getElementById('new-rule').value = "";
    document.getElementById('imageUpload').value = "";
    document.getElementById('fileName').textContent = "Выбран файл: None";
});

// Дополнительные функции для управления пользователями
async function loadUsers() {
    const usersContainer = document.getElementById('usersList');
    usersContainer.innerHTML = ""; // Очистить контейнер для пользователей

    const querySnapshot = await getDocs(collection(db, "users"));
    querySnapshot.forEach((doc) => {
        const userElement = document.createElement('li');
        userElement.textContent = doc.data().email;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = "Удалить пользователя";
        deleteButton.onclick = () => deleteUser(doc.id);

        userElement.appendChild(deleteButton);
        usersContainer.appendChild(userElement);
    });
}

// Удаление пользователя
async function deleteUser(id) {
    try {
        await deleteDoc(doc(db, "users", id));
        loadUsers(); // Перезагрузить список пользователей после удаления
    } catch (error) {
        alert("Ошибка при удалении пользователя: " + error.message);
    }
}

// Инициализация функций при загрузке страницы
window.onload = () => {
    loadRules();
    loadImages();
    loadApplications();
    loadOccupiedRoles();
    loadUsers();
};
