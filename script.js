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

// Функция для обновления интерфейса в зависимости от статуса пользователя
function updateUI(user) {
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

    loadRules();  // Загружаем правила
    loadImages();  // Загружаем изображения
    loadApplications();  // Загружаем анкеты
}

// Функция для проверки состояния аутентификации
onAuthStateChanged(auth, (user) => {
    updateUI(user);
});

// Вход пользователя
document.getElementById('loginButton').addEventListener('click', () => {
    const email = prompt("Введите ваш email:");
    const password = prompt("Введите ваш пароль:");
    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
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
    const rulesContainer = document.getElementById('rulesList');
    if (!rulesContainer) return;  // Проверяем наличие контейнера
    rulesContainer.innerHTML = "";  // Очистить контейнер

    querySnapshot.forEach((doc) => {
        const rule = doc.data().text;
        const ruleElement = document.createElement('li');
        ruleElement.classList.add('rule-item');

        const ruleText = document.createElement('p');
        ruleText.textContent = rule;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Удалить';
        deleteButton.addEventListener('click', () => deleteRule(doc.id));

        ruleElement.appendChild(ruleText);
        ruleElement.appendChild(deleteButton);

        rulesContainer.appendChild(ruleElement);
    });
}

async function deleteRule(ruleId) {
    await deleteDoc(doc(db, "rules", ruleId));
    loadRules();
}

// Добавление правила
document.getElementById('addRuleButton').addEventListener('click', async () => {
    const newRuleInput = document.getElementById('new-rule');
    if (!newRuleInput) return;  // Проверяем наличие элемента

    const newRule = newRuleInput.value;
    if (newRule) {
        await addDoc(collection(db, "rules"), { text: newRule });
        newRuleInput.value = "";
        loadRules();
    } else {
        alert("Введите текст правила!");
    }
});

// Функции для загрузки и управления изображениями
async function loadImages() {
    const approvedImagesContainer = document.getElementById('approvedImages');
    const pendingImagesContainer = document.getElementById('pendingImages');

    if (!approvedImagesContainer || !pendingImagesContainer) return;  // Проверяем наличие контейнеров

    approvedImagesContainer.innerHTML = "";  // Очистить контейнеры
    pendingImagesContainer.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "images"));

    querySnapshot.forEach((doc) => {
        const imageData = doc.data();
        const imgElement = document.createElement('img');
        imgElement.src = imageData.url;

        if (imageData.approved) {
            approvedImagesContainer.appendChild(imgElement);
        } else {
            pendingImagesContainer.appendChild(imgElement);

            const approveButton = document.createElement('button');
            approveButton.textContent = 'Подтвердить';
            approveButton.addEventListener('click', async () => {
                await updateDoc(doc(db, "images", doc.id), { approved: true });
                loadImages();
            });

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Удалить';
            deleteButton.addEventListener('click', async () => {
                const imageRef = ref(storage, imageData.path);
                await deleteObject(imageRef);
                await deleteDoc(doc(db, "images", doc.id));
                loadImages();
            });

            pendingImagesContainer.appendChild(approveButton);
            pendingImagesContainer.appendChild(deleteButton);
        }
    });
}

document.getElementById('uploadImageButton').addEventListener('click', async () => {
    const imageUpload = document.getElementById('imageUpload');
    if (!imageUpload) return;  // Проверяем наличие элемента

    const file = imageUpload.files[0];
    if (file) {
        const storageRef = ref(storage, 'images/' + file.name);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);

        await addDoc(collection(db, "images"), {
            url: url,
            path: storageRef.fullPath,
            approved: false
        });

        loadImages();
    } else {
        alert("Выберите изображение для загрузки!");
    }
});

// Функции для загрузки и управления анкетами
async function loadApplications() {
    const pendingApplicationsContainer = document.getElementById('pendingApplications');
    const approvedApplicationsContainer = document.getElementById('approvedApplications');

    if (!pendingApplicationsContainer || !approvedApplicationsContainer) return;  // Проверяем наличие контейнеров

    pendingApplicationsContainer.innerHTML = "";  // Очистить контейнеры
    approvedApplicationsContainer.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "applications"));

    querySnapshot.forEach((doc) => {
        const applicationData = doc.data();
        const applicationElement = document.createElement('div');
        applicationElement.classList.add('application-item');
        applicationElement.textContent = `Роль: ${applicationData.role}, Фандом: ${applicationData.fandom}`;

        if (applicationData.approved) {
            approvedApplicationsContainer.appendChild(applicationElement);
        } else {
            pendingApplicationsContainer.appendChild(applicationElement);

            const approveButton = document.createElement('button');
            approveButton.textContent = 'Подтвердить';
            approveButton.addEventListener('click', async () => {
                await updateDoc(doc(db, "applications", doc.id), { approved: true });
                loadApplications();
            });

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Удалить';
            deleteButton.addEventListener('click', async () => {
                await deleteDoc(doc(db, "applications", doc.id));
                loadApplications();
            });

            pendingApplicationsContainer.appendChild(approveButton);
            pendingApplicationsContainer.appendChild(deleteButton);
        }
    });
}

document.getElementById('applicationForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const roleInput = document.getElementById('role');
    const fandomInput = document.getElementById('fandom');

    if (!roleInput || !fandomInput) return;  // Проверяем наличие элементов

    const newApplication = {
        role: roleInput.value,
        fandom: fandomInput.value,
        approved: false
    };

    await addDoc(collection(db, "applications"), newApplication);
    loadApplications();
});
