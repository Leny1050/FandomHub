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

// Функция для обновления интерфейса на основе состояния аутентификации
function updateUIBasedOnAuth(user) {
    const adminVisible = user && allowedEmails.includes(user.email);

    document.getElementById('addRuleContainer').style.display = adminVisible ? 'block' : 'none';
    document.getElementById('pendingContainer').style.display = adminVisible ? 'block' : 'none';
    document.getElementById('applicationsContainer').style.display = adminVisible ? 'block' : 'none';
    document.getElementById('approvedContainer').style.display = adminVisible ? 'block' : 'none';
    document.getElementById('loginButton').style.display = user ? 'none' : 'inline-block';
    document.getElementById('logoutButton').style.display = user ? 'inline-block' : 'none';
}

// Функция для проверки состояния аутентификации
onAuthStateChanged(auth, (user) => {
    updateUIBasedOnAuth(user);
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
            updateUIBasedOnAuth(userCredential.user);  // Обновляем интерфейс для нового состояния
        })
        .catch((error) => {
            alert("Ошибка при входе: " + error.message);
        });
});

// Выход пользователя
document.getElementById('logoutButton').addEventListener('click', () => {
    signOut(auth).then(() => {
        alert("Вы вышли из системы.");
        updateUIBasedOnAuth(null);  // Обновляем интерфейс после выхода
    }).catch((error) => {
        alert("Ошибка при выходе: " + error.message);
    });
});

// Функции для загрузки и управления правилами
async function loadRules() {
    const querySnapshot = await getDocs(collection(db, "rules"));
    const rulesContainer = document.getElementById('rules');
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
        const storageRef = ref(storage, url);
        await deleteObject(storageRef);
        await deleteDoc(doc(db, "images", id));
        loadImages();  // Перезагрузить изображения после удаления
    } catch (e) {
        alert("Ошибка при удалении изображения: " + e.message);
    }
}

// Функции для загрузки и управления анкетами
async function loadApplications() {
    const pendingContainer = document.getElementById('pendingApplications');
    const approvedContainer = document.getElementById('approvedApplications');
    pendingContainer.innerHTML = "";  // Очистить контейнер для ожидающих анкет
    approvedContainer.innerHTML = "";  // Очистить контейнер для одобренных анкет

    const querySnapshot = await getDocs(collection(db, "applications"));
    querySnapshot.forEach((doc) => {
        const applicationData = doc.data();
        const applicationElement = document.createElement('div');

        const nameElement = document.createElement('p');
        nameElement.textContent = "Имя: " + applicationData.name;

        const phoneElement = document.createElement('p');
        phoneElement.textContent = "Телефон: " + applicationData.phone;

        const statusElement = document.createElement('p');
        statusElement.textContent = "Статус: " + applicationData.status;

        applicationElement.appendChild(nameElement);
        applicationElement.appendChild(phoneElement);
        applicationElement.appendChild(statusElement);

        if (applicationData.status === "approved") {
            approvedContainer.appendChild(applicationElement);
        } else if (applicationData.status === "pending" && auth.currentUser) {
            const approveButton = document.createElement('button');
            approveButton.textContent = "Одобрить";
            approveButton.onclick = () => approveApplication(doc.id);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = "Удалить";
            deleteButton.onclick = () => deleteApplication(doc.id);

            applicationElement.appendChild(approveButton);
            applicationElement.appendChild(deleteButton);
            pendingContainer.appendChild(applicationElement);
        }
    });
}

async function addApplication() {
    const name = document.getElementById('applicationName').value;
    const phone = document.getElementById('applicationPhone').value;

    if (name && phone) {
        try {
            await addDoc(collection(db, "applications"), {
                name: name,
                phone: phone,
                status: "pending"
            });
            alert("Анкета добавлена и ожидает проверки.");
            loadApplications();  // Перезагрузить анкеты после добавления
        } catch (e) {
            alert("Ошибка при добавлении анкеты: " + e.message);
        }
    } else {
        alert("Пожалуйста, заполните все поля.");
    }
}
document.getElementById('addApplicationButton').addEventListener('click', addApplication);

async function approveApplication(id) {
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
