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

    const allowedEmails = [
        "wulk741852963@gmail.com",
        "101010tatata1010@gmail.com",
        "fludvsefd500@gmail.com"
    ];

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
            document.getElementById('approvedContainer').style.display = 'none';
            document.getElementById('loginButton').style.display = 'inline-block';
            document.getElementById('logoutButton').style.display = 'none';
        }
        loadRules();
        loadImages();
        loadApplications();
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
        rulesContainer.innerHTML = "";

        querySnapshot.forEach((doc) => {
            const rule = doc.data().text;
            const ruleElement = document.createElement('li');
            ruleElement.classList.add('rule-item');

            const ruleText = document.createElement('p');
            ruleText.textContent = rule;

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

        if (newRuleText && auth.currentUser && allowedEmails.includes(auth.currentUser.email)) {
            try {
                await addDoc(collection(db, "rules"), {
                    text: newRuleText
                });
                newRuleInput.value = "";
                loadRules();
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
            loadRules();
        } catch (e) {
            alert("Ошибка при удалении правила: " + e.message);
        }
    }

    // Функции для загрузки и управления изображениями
    async function loadImages() {
        const approvedImagesContainer = document.getElementById('approvedImages');
        const pendingImagesContainer = document.getElementById('pendingImages');
        approvedImagesContainer.innerHTML = "";
        pendingImagesContainer.innerHTML = "";

        const querySnapshot = await getDocs(collection(db, "images"));
        querySnapshot.forEach((doc) => {
            const imageData = doc.data();
            const imageElement = document.createElement('img');
            imageElement.src = imageData.url;
            imageElement.alt = imageData.name;

            const container = imageData.approved ? approvedImagesContainer : pendingImagesContainer;
            container.appendChild(imageElement);

            if (auth.currentUser && allowedEmails.includes(auth.currentUser.email)) {
                const approveButton = document.createElement('button');
                approveButton.textContent = "Одобрить";
                approveButton.onclick = () => approveImage(doc.id);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = "Удалить";
                deleteButton.onclick = () => deleteImage(doc.id, imageData.name);

                container.appendChild(imageElement);
                container.appendChild(approveButton);
                container.appendChild(deleteButton);
            } else {
                container.appendChild(imageElement);
            }
        });
    }

    async function uploadImage() {
        const imageUpload = document.getElementById('imageUpload').files[0];
        if (imageUpload && auth.currentUser && allowedEmails.includes(auth.currentUser.email)) {
            const storageRef = ref(storage, `images/${imageUpload.name}`);
            try {
                await uploadBytes(storageRef, imageUpload);
                const downloadURL = await getDownloadURL(storageRef);

                await addDoc(collection(db, "images"), {
                    name: imageUpload.name,
                    url: downloadURL,
                    approved: false
                });

                loadImages();
            } catch (e) {
                alert("Ошибка при загрузке изображения: " + e.message);
            }
        } else {
            alert("Пожалуйста, войдите в систему с разрешенным адресом электронной почты для загрузки изображений.");
        }
    }
    document.getElementById('uploadImageButton').addEventListener('click', uploadImage);

    async function approveImage(id) {
        try {
            await updateDoc(doc(db, "images", id), {
                approved: true
            });
            loadImages();
        } catch (e) {
            alert("Ошибка при одобрении изображения: " + e.message);
        }
    }

    async function deleteImage(id, imageName) {
        try {
            const storageRef = ref(storage, `images/${imageName}`);
            await deleteObject(storageRef);
            await deleteDoc(doc(db, "images", id));
            loadImages();
        } catch (e) {
            alert("Ошибка при удалении изображения: " + e.message);
        }
    }

    // Функции для работы с анкетами
    async function loadApplications() {
        const pendingApplicationsContainer = document.getElementById('pendingApplications');
        const approvedApplicationsContainer = document.getElementById('approvedApplications');
        pendingApplicationsContainer.innerHTML = "";
        approvedApplicationsContainer.innerHTML = "";

        const querySnapshot = await getDocs(collection(db, "applications"));
        querySnapshot.forEach((doc) => {
            const appData = doc.data();
            const appElement = document.createElement('div');
            appElement.textContent = `Роль: ${appData.role}, Фандом: ${appData.fandom}`;

            const container = appData.approved ? approvedApplicationsContainer : pendingApplicationsContainer;
            container.appendChild(appElement);

            if (auth.currentUser && allowedEmails.includes(auth.currentUser.email)) {
                const approveButton = document.createElement('button');
                approveButton.textContent = "Одобрить";
                approveButton.onclick = () => approveApplication(doc.id);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = "Удалить";
                deleteButton.onclick = () => deleteApplication(doc.id);

                container.appendChild(appElement);
                container.appendChild(approveButton);
                container.appendChild(deleteButton);
            } else {
                container.appendChild(appElement);
            }
        });
    }

    document.getElementById('applicationForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const roleInput = document.getElementById('role').value.trim();
        const fandomInput = document.getElementById('fandom').value.trim();

        if (roleInput && fandomInput) {
            try {
                await addDoc(collection(db, "applications"), {
                    role: roleInput,
                    fandom: fandomInput,
                    approved: false
                });

                document.getElementById('role').value = "";
                document.getElementById('fandom').value = "";
                loadApplications();
            } catch (e) {
                alert("Ошибка при отправке анкеты: " + e.message);
            }
        }
    });

    async function approveApplication(id) {
        try {
            await updateDoc(doc(db, "applications", id), {
                approved: true
            });
            loadApplications();
        } catch (e) {
            alert("Ошибка при одобрении анкеты: " + e.message);
        }
    }

    async function deleteApplication(id) {
        try {
            await deleteDoc(doc(db, "applications", id));
            loadApplications();
        } catch (e) {
            alert("Ошибка при удалении анкеты: " + e.message);
        }
    }
