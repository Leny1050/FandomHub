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
        document.getElementById('loginButton').style.display = 'none';
        document.getElementById('logoutButton').style.display = 'inline-block';
    } else {
        document.getElementById('addRuleContainer').style.display = 'none';
        document.getElementById('pendingContainer').style.display = 'none';
        document.getElementById('loginButton').style.display = 'inline-block';
        document.getElementById('logoutButton').style.display = 'none';
    }
    loadRules();  // Загружаем правила при изменении статуса аутентификации
    loadImages();  // Загружаем изображения при изменении статуса аутентификации
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
    const querySnapshot = await getDocs(collection(db, "images"));
    const approvedContainer = document.getElementById('approvedImages');
    const pendingContainer = document.getElementById('pendingImages');
    approvedContainer.innerHTML = "";  // Очистить контейнер для утвержденных изображений
    pendingContainer.innerHTML = "";  // Очистить контейнер для ожидающих изображений

    querySnapshot.forEach((doc) => {
        const imageUrl = doc.data().url;
        const isApproved = doc.data().approved;

        const imgElement = document.createElement('img');
        imgElement.src = imageUrl;

        if (isApproved) {
            const imgContainer = document.createElement('div');
            imgContainer.appendChild(imgElement);

            // Добавление кнопки для удаления утвержденного изображения
            if (auth.currentUser && allowedEmails.includes(auth.currentUser.email)) {
                const deleteButton = document.createElement('button');
                deleteButton.textContent = "Удалить";
                deleteButton.onclick = () => deleteImage(doc.id, imageUrl);
                imgContainer.appendChild(deleteButton);
            }

            approvedContainer.appendChild(imgContainer);
        } else if (auth.currentUser && allowedEmails.includes(auth.currentUser.email)) {
            const approveButton = document.createElement('button');
            approveButton.textContent = "Утвердить";
            approveButton.onclick = () => approveImage(doc.id);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = "Удалить";
            deleteButton.onclick = () => deleteImage(doc.id, imageUrl);

            const imgContainer = document.createElement('div');
            imgContainer.appendChild(imgElement);
            imgContainer.appendChild(approveButton);
            imgContainer.appendChild(deleteButton);

            pendingContainer.appendChild(imgContainer);
        }
    });
}

async function uploadImage() {
    const imageInput = document.getElementById('imageUpload');
    const file = imageInput.files[0];

    if (file) {
        const storageRef = ref(storage, 'images/' + file.name);
        await uploadBytes(storageRef, file);

        const downloadURL = await getDownloadURL(storageRef);

        try {
            await addDoc(collection(db, "images"), {
                url: downloadURL,
                approved: false
            });
            alert("Изображение загружено и отправлено на проверку!");
            loadImages();  // Перезагрузить изображения
        } catch (e) {
            alert("Ошибка при загрузке изображения: " + e.message);
        }
    } else {
        alert("Пожалуйста, выберите изображение для загрузки.");
    }
}

async function approveImage(id) {
    try {
        await updateDoc(doc(db, "images", id), {
            approved: true
        });
        loadImages();  // Перезагрузить изображения после утверждения
    } catch (e) {
        alert("Ошибка при утверждении изображения: " + e.message);
    }
}

async function deleteImage(id, imageUrl) {
    try {
        const storageRef = ref(storage, imageUrl);
        await deleteObject(storageRef); // Удаление изображения из хранилища

        await deleteDoc(doc(db, "images", id)); // Удаление записи из Firestore
        loadImages();  // Перезагрузить изображения после удаления
    } catch (e) {
        alert("Ошибка при удалении изображения: " + e.message);
    }
}

// Обработчик события загрузки изображения
document.getElementById('uploadImageButton').addEventListener('click', uploadImage);
