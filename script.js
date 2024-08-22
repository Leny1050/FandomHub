<!-- Firebase CDN -->
<script type="module">
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
            console.log("Пользователь вошел:", user.email);
            document.getElementById('addRuleContainer').style.display = 'block';
            document.getElementById('pendingContainer').style.display = 'block';
            document.getElementById('applicationsContainer').style.display = 'block';
            document.getElementById('approvedContainer').style.display = 'block';
            document.getElementById('loginButton').style.display = 'none';
            document.getElementById('logoutButton').style.display = 'inline-block';
        } else {
            console.log("Пользователь вышел");
            document.getElementById('addRuleContainer').style.display = 'none';
            document.getElementById('pendingContainer').style.display = 'none';
            document.getElementById('applicationsContainer').style.display = 'none';
            document.getElementById('approvedContainer').style.display = 'none';
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
                console.error("Ошибка при входе:", error);
            });
    });

    // Выход пользователя
    document.getElementById('logoutButton').addEventListener('click', () => {
        signOut(auth).then(() => {
            alert("Вы вышли из системы.");
        }).catch((error) => {
            alert("Ошибка при выходе: " + error.message);
            console.error("Ошибка при выходе:", error);
        });
    });

    // Функции для загрузки и управления правилами
    async function loadRules() {
        try {
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
        } catch (e) {
            console.error("Ошибка при загрузке правил:", e);
            alert("Ошибка при загрузке правил: " + e.message);
        }
    }

    async function addRule() {
        const newRuleInput = document.getElementById('new-rule');
        const newRuleText = newRuleInput.value.trim();

        if (newRuleText && auth.currentUser && allowedEmails.includes(auth.currentUser.email)) {
            try {
                await addDoc(collection(db, "rules"), {
                    text: newRuleText
                });
                newRuleInput.value = "";  // Очистить поле ввода
                loadRules();  // Перезагрузить правила
            } catch (e) {
                console.error("Ошибка при добавлении правила:", e);
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
            console.error("Ошибка при удалении правила:", e);
            alert("Ошибка при удалении правила: " + e.message);
        }
    }

    // Функции для загрузки и управления изображениями
    async function loadImages() {
        try {
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
                    imageElement.appendChild(deleteButton);
                    approvedImagesContainer.appendChild(imageElement);
                } else if (status === "pending") {
                    const approveButton = document.createElement('button');
                    approveButton.textContent = "Одобрить";
                    approveButton.onclick = () => approveImage(doc.id);

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = "Удалить";
                    deleteButton.onclick = () => deleteImage(doc.id, imageUrl);

                    imageElement.appendChild(approveButton);
                    imageElement.appendChild(deleteButton);
                    pendingImagesContainer.appendChild(imageElement);
                }
            });
        } catch (e) {
            console.error("Ошибка при загрузке изображений:", e);
            alert("Ошибка при загрузке изображений: " + e.message);
        }
    }

    document.getElementById('imageUploadButton').addEventListener('click', async () => {
        const fileInput = document.getElementById('imageFile');
        const file = fileInput.files[0];

        if (!file) {
            alert("Пожалуйста, выберите файл.");
            return;
        }

        const storageRef = ref(storage, 'images/' + file.name);
        try {
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            await addDoc(collection(db, "images"), {
                url: downloadURL,
                status: "pending"  // Все новые изображения по умолчанию в статусе "ожидание"
            });
            alert("Изображение успешно загружено и ожидает одобрения.");
            fileInput.value = "";  // Очистить поле файла
            loadImages();  // Перезагрузить изображения
        } catch (e) {
            console.error("Ошибка при загрузке изображения:", e);
            alert("Ошибка при загрузке изображения: " + e.message);
        }
    });

    async function approveImage(id) {
        try {
            const imageRef = doc(db, "images", id);
            await updateDoc(imageRef, {
                status: "approved"
            });
            loadImages();  // Перезагрузить изображения после одобрения
        } catch (e) {
            console.error("Ошибка при одобрении изображения:", e);
            alert("Ошибка при одобрении изображения: " + e.message);
        }
    }

    async function deleteImage(id, imageUrl) {
        try {
            // Удаление изображения из Storage
            const storageRef = ref(storage, imageUrl);
            await deleteObject(storageRef);

            // Удаление записи об изображении из Firestore
            await deleteDoc(doc(db, "images", id));
            loadImages();  // Перезагрузить изображения после удаления
        } catch (e) {
            console.error("Ошибка при удалении изображения:", e);
            alert("Ошибка при удалении изображения: " + e.message);
        }
    }

    // Функции для загрузки и управления анкетами
    async function loadApplications() {
        try {
            const querySnapshot = await getDocs(collection(db, "applications"));
            const applicationsContainer = document.getElementById('applications');
            applicationsContainer.innerHTML = "";  // Очистить контейнер

            querySnapshot.forEach((doc) => {
                const applicationData = doc.data();
                const applicationElement = document.createElement('li');
                applicationElement.classList.add('application-item');

                const applicationText = document.createElement('p');
                applicationText.textContent = `Имя: ${applicationData.name}, Возраст: ${applicationData.age}, Почта: ${applicationData.email}, Телефон: ${applicationData.phone}`;

                // Проверка, является ли текущий пользователь авторизованным и есть ли у него права
                if (auth.currentUser && allowedEmails.includes(auth.currentUser.email)) {
                    const approveButton = document.createElement('button');
                    approveButton.textContent = "Одобрить";
                    approveButton.onclick = () => approveApplication(doc.id);

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = "Удалить";
                    deleteButton.onclick = () => deleteApplication(doc.id);

                    applicationElement.appendChild(applicationText);
                    applicationElement.appendChild(approveButton);
                    applicationElement.appendChild(deleteButton);
                } else {
                    applicationElement.appendChild(applicationText);
                }

                applicationsContainer.appendChild(applicationElement);
            });
        } catch (e) {
            console.error("Ошибка при загрузке анкет:", e);
            alert("Ошибка при загрузке анкет: " + e.message);
        }
    }

    async function approveApplication(id) {
        try {
            const applicationRef = doc(db, "applications", id);
            await updateDoc(applicationRef, {
                status: "approved"
            });
            loadApplications();  // Перезагрузить анкеты после одобрения
        } catch (e) {
            console.error("Ошибка при одобрении анкеты:", e);
            alert("Ошибка при одобрении анкеты: " + e.message);
        }
    }

    async function deleteApplication(id) {
        try {
            await deleteDoc(doc(db, "applications", id));
            loadApplications();  // Перезагрузить анкеты после удаления
        } catch (e) {
            console.error("Ошибка при удалении анкеты:", e);
            alert("Ошибка при удалении анкеты: " + e.message);
        }
    }
</script>
