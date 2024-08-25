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

// Функция для обновления интерфейса
function updateUI(user) {
    if (user) {
        document.getElementById('addRuleContainer').style.display = 'block';
        document.getElementById('pendingContainer').style.display = 'block';
        document.getElementById('applicationsContainer').style.display = 'block';
        document.getElementById('approvedContainer').style.display = 'block';
        document.getElementById('loginButton').style.display = 'none';
        document.getElementById('logoutButton').style.display = 'inline-block';

        loadRules();
        loadImages();
        loadApplications();
    } else {
        document.getElementById('addRuleContainer').style.display = 'none';
        document.getElementById('pendingContainer').style.display = 'none';
        document.getElementById('applicationsContainer').style.display = 'none';
        document.getElementById('approvedContainer').style.display = 'none';
        document.getElementById('loginButton').style.display = 'inline-block';
        document.getElementById('logoutButton').style.display = 'none';
    }
}

// Проверка состояния аутентификации и обновление интерфейса
onAuthStateChanged(auth, (user) => {
    updateUI(user);
});

// Вход пользователя
document.getElementById('loginButton').addEventListener('click', async () => {
    const email = prompt("Введите ваш email:");
    const password = prompt("Введите ваш пароль:");
    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Вы успешно вошли в систему!");
        updateUI(auth.currentUser);  // Обновление интерфейса после входа
    } catch (error) {
        alert("Ошибка при входе: " + error.message);
    }
});

// Выход пользователя
document.getElementById('logoutButton').addEventListener('click', async () => {
    try {
        await signOut(auth);
        alert("Вы вышли из системы.");
        updateUI(null);  // Обновление интерфейса после выхода
    } catch (error) {
        alert("Ошибка при выходе: " + error.message);
    }
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

// Функции для загрузки и управления заявками
async function loadApplications() {
    const applicationsContainer = document.getElementById('applications');
    const approvedContainer = document.getElementById('approvedApplications');
    applicationsContainer.innerHTML = "";  // Очистить контейнер для заявок
    approvedContainer.innerHTML = "";  // Очистить контейнер для одобренных заявок

    const querySnapshot = await getDocs(collection(db, "applications"));
    querySnapshot.forEach((doc) => {
        const application = doc.data();
        const applicationElement = document.createElement('div');
        applicationElement.classList.add('application-item');

        const applicationText = document.createElement('p');
        applicationText.textContent = `Заявка от ${application.name}: ${application.details}`;

        if (application.status === "approved") {
            approvedContainer.appendChild(applicationElement);
        } else if (application.status === "pending" && auth.currentUser) {
            const approveButton = document.createElement('button');
            approveButton.textContent = "Одобрить";
            approveButton.onclick = () => approveApplication(doc.id);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = "Удалить";
            deleteButton.onclick = () => deleteApplication(doc.id);

            applicationElement.appendChild(applicationText);
            applicationElement.appendChild(approveButton);
            applicationElement.appendChild(deleteButton);

            applicationsContainer.appendChild(applicationElement);
        }
    });
}

async function approveApplication(id) {
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
