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

// Слушатель изменения состояния аутентификации
onAuthStateChanged(auth, (user) => {
    toggleUI(user); // Переключение интерфейса в зависимости от состояния аутентификации
    loadRules(); // Загрузка правил
    loadImages(); // Загрузка изображений
    loadApplications(); // Загрузка анкет
});

// Функция для переключения интерфейса в зависимости от состояния аутентификации
function toggleUI(user) {
    const isAuthenticated = !!user; // Проверка, вошел ли пользователь в систему
    document.getElementById('addRuleContainer').style.display = isAuthenticated ? 'block' : 'none';
    document.getElementById('pendingContainer').style.display = isAuthenticated ? 'block' : 'none';
    document.getElementById('applicationsContainer').style.display = isAuthenticated ? 'block' : 'none';
    document.getElementById('approvedContainer').style.display = isAuthenticated ? 'block' : 'none';
    document.getElementById('loginButton').style.display = isAuthenticated ? 'none' : 'inline-block';
    document.getElementById('logoutButton').style.display = isAuthenticated ? 'inline-block' : 'none';
}

// Вход пользователя
document.getElementById('loginButton').addEventListener('click', async () => {
    const email = prompt("Введите ваш email:"); // Запрос email у пользователя
    const password = prompt("Введите ваш пароль:"); // Запрос пароля у пользователя
    try {
        await signInWithEmailAndPassword(auth, email, password); // Аутентификация пользователя
        alert("Вы успешно вошли в систему!"); // Успешное уведомление
    } catch (error) {
        alert("Ошибка при входе: " + error.message); // Ошибка при аутентификации
    }
});

// Выход пользователя
document.getElementById('logoutButton').addEventListener('click', async () => {
    try {
        await signOut(auth); // Выход пользователя
        alert("Вы вышли из системы."); // Уведомление о выходе
    } catch (error) {
        alert("Ошибка при выходе: " + error.message); // Ошибка при выходе
    }
});

// Загрузка правил из Firestore
async function loadRules() {
    const querySnapshot = await getDocs(collection(db, "rules")); // Получение документов из коллекции "rules"
    const rulesContainer = document.getElementById('rules');
    rulesContainer.innerHTML = ""; // Очистка контейнера

    querySnapshot.forEach((doc) => {
        const rule = doc.data().text; // Получение текста правила
        const ruleElement = document.createElement('li'); // Создание элемента списка для правила
        ruleElement.classList.add('rule-item');
        ruleElement.textContent = rule; // Установка текста правила

        // Если пользователь администратор, добавляем кнопку удаления
        if (auth.currentUser && allowedEmails.includes(auth.currentUser.email)) {
            const deleteButton = document.createElement('button'); // Создание кнопки удаления
            deleteButton.textContent = "Удалить"; // Текст кнопки
            deleteButton.classList.add('delete-button');
            deleteButton.onclick = () => deleteRule(doc.id); // Установка функции удаления правила
            ruleElement.appendChild(deleteButton);
        }

        rulesContainer.appendChild(ruleElement); // Добавление правила в контейнер
    });
}

// Добавление нового правила
document.getElementById('addRuleButton').addEventListener('click', addRule);
async function addRule() {
    const newRuleInput = document.getElementById('new-rule'); // Получение элемента ввода нового правила
    const newRuleText = newRuleInput.value.trim(); // Получение и обрезка текста нового правила

    // Проверка на наличие текста правила и соответствие пользователя разрешенному списку
    if (newRuleText && auth.currentUser && allowedEmails.includes(auth.currentUser.email)) {
        try {
            await addDoc(collection(db, "rules"), { text: newRuleText }); // Добавление нового правила в Firestore
            newRuleInput.value = ""; // Очистка ввода
            loadRules(); // Перезагрузка правил
        } catch (error) {
            alert("Ошибка при добавлении правила: " + error.message); // Ошибка при добавлении правила
        }
    } else {
        alert("Пожалуйста, войдите в систему с разрешенным адресом электронной почты для добавления правила."); // Уведомление об ошибке
    }
}

// Удаление правила
async function deleteRule(id) {
    try {
        await deleteDoc(doc(db, "rules", id)); // Удаление документа правила из Firestore
        loadRules(); // Перезагрузка правил после удаления
    } catch (error) {
        alert("Ошибка при удалении правила: " + error.message); // Ошибка при удалении правила
    }
}

// Загрузка изображений из Firestore
async function loadImages() {
    const approvedImagesContainer = document.getElementById('approvedImages');
    const pendingImagesContainer = document.getElementById('pendingImages');
    approvedImagesContainer.innerHTML = ""; // Очистка контейнера для одобренных изображений
    pendingImagesContainer.innerHTML = ""; // Очистка контейнера для ожидающих изображений

    const querySnapshot = await getDocs(collection(db, "images")); // Получение изображений из коллекции "images"
    querySnapshot.forEach((doc) => {
        const { url, status } = doc.data(); // Получение URL и статуса изображения
        const imageElement = document.createElement('div'); // Создание контейнера для изображения
        const img = document.createElement('img'); // Создание элемента изображения
        img.src = url; // Установка источника изображения
        imageElement.appendChild(img);

        // Обработка одобренных изображений
        if (status === "approved") {
            const deleteButton = document.createElement('button'); // Создание кнопки удаления
            deleteButton.textContent = "Удалить"; // Текст кнопки
            deleteButton.onclick = () => deleteImage(doc.id, url); // Установка функции удаления изображения
            imageElement.appendChild(deleteButton);
            approvedImagesContainer.appendChild(imageElement); // Добавление изображения в контейнер одобренных
        } else if (status === "pending" && auth.currentUser) {
            const approveButton = document.createElement('button'); // Создание кнопки одобрения
            approveButton.textContent = "Одобрить"; // Текст кнопки
            approveButton.onclick = () => approveImage(doc.id); // Установка функции одобрения изображения

            const deleteButton = document.createElement('button'); // Создание кнопки удаления
            deleteButton.textContent = "Удалить"; // Текст кнопки
            deleteButton.onclick = () => deleteImage(doc.id, url); // Установка функции удаления изображения

            imageElement.appendChild(approveButton); // Добавление кнопки одобрения
            imageElement.appendChild(deleteButton); // Добавление кнопки удаления
            pendingImagesContainer.appendChild(imageElement); // Добавление изображения в контейнер ожидающих
        }
    });
}

// Загрузка изображения
document.getElementById('uploadImageButton').addEventListener('click', async () => {
    const fileInput = document.getElementById('imageUpload'); // Получение элемента загрузки файла
    const file = fileInput.files[0]; // Получение файла
    if (!file) return; // Если файла нет, выход

    const storageRef = ref(storage, 'images/' + file.name); // Ссылка на хранилище для загрузки изображения
   ```javascript
    try {
        await uploadBytes(storageRef, file); // Загрузка файла в хранилище
        const url = await getDownloadURL(storageRef); // Получение URL загруженного изображения
        await addDoc(collection(db, "images"), { url: url, status: "pending" }); // Добавление изображения в Firestore со статусом "ожидание"
        alert("Изображение загружено и ожидает проверки."); // Уведомление о загрузке изображения
        loadImages(); // Перезагрузка изображений после загрузки
    } catch (error) {
        alert("Ошибка при загрузке изображения: " + error.message); // Ошибка при загрузке изображения
    }
});

// Одобрение изображения
async function approveImage(id) {
    try {
        const imageRef = doc(db, "images", id); // Получение ссылки на документ изображения
        await updateDoc(imageRef, { status: "approved" }); // Обновление статуса изображения на "одобрено"
        loadImages(); // Перезагрузка изображений после одобрения
    } catch (error) {
        alert("Ошибка при одобрении изображения: " + error.message); // Ошибка при одобрении изображения
    }
}

// Удаление изображения
async function deleteImage(id, url) {
    try {
        const storageRef = ref(storage, url); // Получение ссылки на изображение в хранилище
        await deleteObject(storageRef); // Удаление изображения из хранилища
        await deleteDoc(doc(db, "images", id)); // Удаление документа изображения из Firestore
        loadImages(); // Перезагрузка изображений после удаления
    } catch (error) {
        alert("Ошибка при удалении изображения: " + error.message); // Ошибка при удалении изображения
    }
}

// Функция для загрузки и управления анкетами
async function loadApplications() {
    const pendingApplicationsContainer = document.getElementById('pendingApplications');
    const approvedApplicationsContainer = document.getElementById('approvedApplications');
    pendingApplicationsContainer.innerHTML = "";  // Очистить контейнер для ожидающих анкет
    approvedApplicationsContainer.innerHTML = "";  // Очистить контейнер для одобренных анкет

    const querySnapshot = await getDocs(collection(db, "applications")); // Получение анкет из Firestore
    querySnapshot.forEach((doc) => {
        const { role, fandom, status } = doc.data(); // Получение данных анкеты
        const applicationElement = document.createElement('div'); // Создание элемента для анкеты
        applicationElement.textContent = `Роль: ${role}, Фандом: ${fandom}`; // Установка текста анкеты

        // Обработка одобренных анкет
        if (status === "approved") {
            approvedApplicationsContainer.appendChild(applicationElement); // Добавление одобренной анкеты в контейнер

            // Если текущий пользователь администратор, добавляем кнопку удаления
            if (auth.currentUser && allowedEmails.includes(auth.currentUser.email)) {
                const deleteButton = document.createElement('button'); // Создание кнопки удаления
                deleteButton.textContent = "Удалить"; // Текст кнопки
                deleteButton.onclick = () => deleteApplication(doc.id); // Установка функции удаления анкеты
                applicationElement.appendChild(deleteButton); // Добавление кнопки в элемент анкеты
            }
        }

        // Заявки на рассмотрении видны только админам
        if (status === "pending" && auth.currentUser) {
            const approveButton = document.createElement('button'); // Создание кнопки одобрения
            approveButton.textContent = "Одобрить"; // Текст кнопки
            approveButton.onclick = () => approveApplication(doc.id, role, fandom); // Установка функции одобрения анкеты

            const deleteButton = document.createElement('button'); // Создание кнопки удаления
            deleteButton.textContent = "Удалить"; // Текст кнопки
            deleteButton.onclick = () => deleteApplication(doc.id); // Установка функции удаления анкеты

            applicationElement.appendChild(approveButton); // Добавление кнопки одобрения
            applicationElement.appendChild(deleteButton); // Добавление кнопки удаления
            pendingApplicationsContainer.appendChild(applicationElement); // Добавление анкеты в контейнер ожидающих
        }
    });
}

// Функция для отправки анкеты
document.getElementById('applicationForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Предотвращение перезагрузки страницы
    const role = document.getElementById('role').value.trim(); // Получение роли из формы
    const fandom = document.getElementById('fandom').value.trim(); // Получение фандома из формы

    try {
        await addDoc(collection(db, "applications"), {
            role: role,
            fandom: fandom,
            status: "pending" // Установка статуса анкеты на "ожидание"
        });
        alert("Ваша анкета отправлена и ожидает проверки."); // Уведомление об успешной отправке анкеты
        loadApplications();  // Перезагрузка анкет после отправки
    } catch (e) {
        alert("Ошибка при отправке анкеты: " + e.message); // Ошибка при отправке анкеты
    }
});

// Функция для одобрения анкеты
async function approveApplication(id) {
    try {
        const applicationRef = doc(db, "applications", id); // Получение ссылки на документ анкеты
        await updateDoc(applicationRef, {
            status: "approved" // Обновление статуса анкеты на "одобрено"
        });
        loadApplications();  // Перезагрузка анкет после одобрения
    } catch (e) {
        alert("Ошибка при одобрении анкеты: " + e.message); // Ошибка при одобрении анкеты
    }
}

// Функция для удаления анкеты
async function deleteApplication(id) {
    try {
        await deleteDoc(doc(db, "applications", id)); // Удаление документа анкеты из Firestore
        loadApplications();  // Перезагрузка анкет после удаления
    } catch (e) {
        alert("Ошибка при удалении анкеты: " + e.message); // Ошибка при удалении анкеты
    }
}
