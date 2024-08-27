import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

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

// Уровни геймификации
const levelRequirements = [1, 3, 7, 14, 30, 60, 120, 365]; // В днях
const levelMessages = [
    "Уровень 1: Простой участник",
    "Уровень 2: Участник 3 дней",
    "Уровень 3: Участник недели",
    "Уровень 4: Участник 2 недель",
    "Уровень 5: Участник месяца",
    "Уровень 6: Участник 2 месяцев",
    "Уровень 7: Участник 4 месяцев",
    "Уровень 8: Участник года",
];

// Функция для расчета уровня
function calculateLevel(days) {
    for (let i = levelRequirements.length - 1; i >= 0; i--) {
        if (days >= levelRequirements[i]) {
            return i + 1; // Уровень 1 основан на индексе 0
        }
    }
    return 0; // Если не достигнуто ни одного уровня
}

// Функция для проверки состояния аутентификации
onAuthStateChanged(auth, (user) => {
    const addRuleContainer = document.getElementById('addRuleContainer');
    const pendingContainer = document.getElementById('pendingApplications');
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
    const rulesContainer = document.getElementById('rulesList');
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

    console.log("Добавляемое правило:", newRuleText); // Добавьте это логирование

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

// Функции для загрузки и управления анкетами
async function loadApplications() {
    const pendingApplicationsContainer = document.getElementById('pendingApplications');
    const approvedApplicationsContainer = document.getElementById('approvedApplications');
    if (!pendingApplicationsContainer || !approvedApplicationsContainer) return;  // Проверка на наличие контейнеров
    pendingApplicationsContainer.innerHTML = "";  // Очистить контейнер для ожидающих анкет
    approvedApplicationsContainer.innerHTML = "";  // Очистить контейнер для одобренных ролей

    const querySnapshot = await getDocs(collection(db, "applications"));
    console.log("Получены документы:", querySnapshot.size);  // Логирование размера полученных данных

    querySnapshot.forEach((doc) => {
        const application = doc.data();
        console.log("Документ:", doc.id, "Данные:", application);  // Логирование каждого документа
        const role = application.role;
        const fandom = application.fandom;
        const status = application.status;  // "pending" или "approved"
        const joinDate = application.joinDate.toDate(); // Получаем дату присоединения

        const currentDate = new Date();
        const timeDiff = Math.ceil((currentDate - joinDate) / (1000 * 3600 * 24)); // Разница в днях

        const applicationElement = document.createElement('div');
        applicationElement.textContent = `Роль: ${role}, Фандом: ${fandom}`;

        // Расчет уровня
        const level = calculateLevel(timeDiff);
        const levelMessage = level > 0 ? levelMessages[level - 1] : "У вас еще нет уровня";

        const levelElement = document.createElement('p');
        levelElement.textContent = levelMessage;
        applicationElement.appendChild(levelElement);

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
            if (auth.currentUser && allowedEmails.includes(auth.currentUser.email)) {
                const deleteButton = document.createElement('button');
                deleteButton.textContent = "Удалить";
                deleteButton.onclick = () => deleteApplication(doc.id);
                applicationElement.appendChild(deleteButton);
            }

            console.log("Добавляем одобренную заявку:", role, fandom);  // Логирование добавления одобренной заявки
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
            status: "pending",
            joinDate: new Date() // Сохраняем текущую дату как дату присоединения
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
