import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js';
import { getAuth, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-storage.js';

// Настройки Firebase
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

// Элементы интерфейса
const rulesContainer = document.getElementById('rules');
const addRuleContainer = document.getElementById('addRuleContainer');
const newRuleInput = document.getElementById('new-rule');
const addRuleButton = document.getElementById('addRuleButton');
const imageUpload = document.getElementById('imageUpload');
const uploadImageButton = document.getElementById('uploadImageButton');
const approvedImages = document.getElementById('approvedImages');
const pendingImages = document.getElementById('pendingImages');
const applicationsContainer = document.getElementById('applicationsContainer');
const approvedApplications = document.getElementById('approvedApplications');
const pendingApplications = document.getElementById('pendingApplications');
const applicationForm = document.getElementById('applicationForm');
const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');

// Функция для загрузки правил из Firestore
async function loadRules() {
    const rulesQuery = query(collection(db, 'rules'));
    const rulesSnapshot = await getDocs(rulesQuery);
    rulesContainer.innerHTML = ''; // Очищаем текущее содержимое
    rulesSnapshot.forEach((doc) => {
        const ruleItem = document.createElement('li');
        ruleItem.classList.add('rule-item');
        ruleItem.innerHTML = `<p>${doc.data().text}</p><button class="delete-button" onclick="deleteRule('${doc.id}')">Удалить</button>`;
        rulesContainer.appendChild(ruleItem);
    });
}

// Функция для добавления правила в Firestore
addRuleButton.addEventListener('click', async () => {
    const newRule = newRuleInput.value.trim();
    if (newRule) {
        await addDoc(collection(db, 'rules'), { text: newRule });
        newRuleInput.value = '';
        loadRules(); // Обновить список правил
    }
});

// Функция для удаления правила из Firestore
window.deleteRule = async function (ruleId) {
    await deleteDoc(doc(db, 'rules', ruleId));
    loadRules(); // Обновить список правил
};

// Функция для загрузки изображений
uploadImageButton.addEventListener('click', async () => {
    const file = imageUpload.files[0];
    if (file) {
        const storageRef = ref(storage, `images/${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        
        // Добавить в коллекцию ожидания
        await addDoc(collection(db, 'pendingImages'), { url: downloadURL });
        imageUpload.value = ''; // Очистить поле загрузки
        loadImages(); // Обновить список изображений
    }
});

// Функция для загрузки изображений из Firestore
async function loadImages() {
    const pendingImagesSnapshot = await getDocs(collection(db, 'pendingImages'));
    pendingImages.innerHTML = ''; // Очищаем текущее содержимое
    pendingImagesSnapshot.forEach((doc) => {
        const imageUrl = doc.data().url;
        const imageItem = document.createElement('div');
        imageItem.innerHTML = `<img src="${imageUrl}" alt="Загруженное изображение" /><div class="button-container"><button onclick="approveImage('${doc.id}')">Одобрить</button><button onclick="removeImage('${doc.id}')">Удалить</button></div>`;
        pendingImages.appendChild(imageItem);
    });

    const approvedImagesSnapshot = await getDocs(collection(db, 'approvedImages'));
    approvedImages.innerHTML = ''; // Очищаем текущее содержимое
    approvedImagesSnapshot.forEach((doc) => {
        const imageUrl = doc.data().url;
        const imageItem = document.createElement('div');
        imageItem.innerHTML = `<img src="${imageUrl}" alt="Одобренное изображение" />`;
        approvedImages.appendChild(imageItem);
    });
}

// Функция для одобрения изображения
window.approveImage = async function (imageId) {
    const imageRef = doc(db, 'pendingImages', imageId);
    const imageDoc = await getDoc(imageRef);
    
    // Добавляем в коллекцию одобренных изображений
    await addDoc(collection(db, 'approvedImages'), { url: imageDoc.data().url });
    await deleteDoc(imageRef); // Удаляем из ожидания
    loadImages(); // Обновить список изображений
};

// Функция для удаления изображения
window.removeImage = async function (imageId) {
    await deleteDoc(doc(db, 'pendingImages', imageId));
    loadImages(); // Обновить список изображений
};

// Функция для загрузки анкет
async function loadApplications() {
    const applicationsSnapshot = await getDocs(collection(db, 'applications'));
    pendingApplications.innerHTML = ''; // Очищаем текущее содержимое
    approvedApplications.innerHTML = ''; // Очищаем текущее содержимое
    applicationsSnapshot.forEach((doc) => {
        const application = doc.data();
        const applicationItem = document.createElement('div');
        applicationItem.innerHTML = `<p>Роль: ${application.role}, Фандом: ${application.fandom}</p><button onclick="approveApplication('${doc.id}')">Одобрить</button><button onclick="removeApplication('${doc.id}')">Удалить</button>`;
        pendingApplications.appendChild(applicationItem);
    });
}

// Функция для обработки отправки анкеты
applicationForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const role = document.getElementById('role').value;
    const fandom = document.getElementById('fandom').value;
    
    const user = auth.currentUser;
    if (user && allowedEmails.includes(user.email)) {
        await addDoc(collection(db, 'applications'), { role, fandom });
        applicationForm.reset();
        loadApplications(); // Обновить список анкет
    } else {
        alert("У вас нет разрешения на отправку анкеты.");
    }
});

// Функция для одобрения анкеты
window.approveApplication = async function (applicationId) {
    const applicationRef = doc(db, 'applications', applicationId);
    const applicationDoc = await getDoc(applicationRef);
    
    // Добавляем в коллекцию одобренных анкет
    await addDoc(collection(db, 'approvedApplications'), applicationDoc.data());
    await deleteDoc(applicationRef); // Удаляем из ожидания
    loadApplications(); // Обновить список анкет
};

// Функция для удаления анкеты
window.removeApplication = async function (applicationId) {
    await deleteDoc(doc(db, 'applications', applicationId));
    loadApplications(); // Обновить список анкет
};

// Функция для входа пользователя
loginButton.addEventListener('click', async () => {
    const email = prompt("Введите ваш email:");
    const password = prompt("Введите ваш пароль:");
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Успешный вход:', userCredential.user);
        loadRules();
        loadImages();
        loadApplications();
        loginButton.style.display = 'none';
        logoutButton.style.display = 'inline';
        addRuleContainer.style.display = 'block'; // Показываем контейнер для добавления правил
    } catch (error) {
        console.error('Ошибка входа:', error);
        alert('Ошибка входа: ' + error.message);
    }
});

// Функция для выхода пользователя
logoutButton.addEventListener('click', async () => {
    await signOut(auth);
    console.log('Пользователь вышел');
    loginButton.style.display = 'inline';
    logoutButton.style.display = 'none';
    addRuleContainer.style.display = 'none'; // Скрываем контейнер для добавления правил
});

// Загрузка правил при первой загрузке страницы
loadRules();
