const socket = io();
const Players = {
    "Жаклин Делатр": "https://i.imgur.com/zs68ode.png",
    "Майкл Бэрри": "https://i.imgur.com/Tcjo29H.png",
    "Оливер Спенсер": "https://i.imgur.com/Tcjo29H.png",
    "Грэм Нильсен": "https://img.itch.zone/4.png"
};
const resultColor = {
    "Success": "#C7F7CD",
    "MixedSuccess": "#F7E8C7",
    "Fail": "#FFC2C2"
};
// Таймер для исчезновения блока results
let clickTimer = 15000;
let timer; 
let isHide = true;
// Получаем элементы overlay и content-box
const overlay = document.getElementById('overlay');
const contentBox = document.querySelector('.content-box');
let currentPlayer = '';

// Заполняем выпадающий список значениями из Players
const usernameSelect = document.getElementById('username');
for (let key in Players) {
    let option = document.createElement('option');
    option.value = key;
    option.textContent = key;
    usernameSelect.appendChild(option);
}

// Обработчик изменения выбранного пользователя в списке
usernameSelect.addEventListener('change', function() {
    const selectedUsername = usernameSelect.value;
    document.getElementById('photoUrl').value = Players[selectedUsername];
});

function setModifier(value) {
    document.getElementById('modifier').value = value;
}

function setBackground(data) {
    // Заполняем карточку результатов
    document.getElementById('nameLabel').textContent = `${data.username}`; 
    // const dices = `[${data.diceFirst}, ${data.diceSecond}]`;
    const dices = `2d6`;
    if (data.modifier < 0)
        document.getElementById('diceLabel').textContent = `${dices}  -  ${Math.abs(data.modifier)}`;
    else
        document.getElementById('diceLabel').textContent = `${dices}  +  ${data.modifier}`;
    document.getElementById('totalLabel').textContent = `${data.result}`;

    let result = data.result;
    const contentBox = document.querySelector('.content-box');
    const totalLabel = document.getElementById('totalLabel');
    const resultLabel = document.getElementById('resultLabel');

    // if (result >= 12) {
    //     // contentBox.style.backgroundImage = "url('imgs/bg_crit_success.png')";
    //     resultLabel.textContent = "Критический успех";
    // } else 
    // if (result >= 10 && result < 12) {
    if (result >= 10) {
        // contentBox.style.backgroundImage = "url('imgs/bg_success.png')";
        resultLabel.textContent = "Успех";
        totalLabel.style.color = resultColor["Success"];
        resultLabel.style.color = resultColor["Success"];
    } else if (result >= 7 && result <= 9) {
        // contentBox.style.backgroundImage = "url('imgs/bg_mixed_success.png')";
        resultLabel.textContent = "Успех с ценой";
        totalLabel.style.color = resultColor["MixedSuccess"];
        resultLabel.style.color = resultColor["MixedSuccess"];
    } else {
        // contentBox.style.backgroundImage = "url('imgs/bg_fail.png')";
        resultLabel.textContent = "Провал";
        totalLabel.style.color = resultColor["Fail"];
        resultLabel.style.color = resultColor["Fail"];
    }
}

function rollDice() {
    clearTimeout(timer); // Сбрасываем таймер, если кнопка была нажата снова
    const username = usernameSelect.value;
    const photoUrl = Players[username]; 
    const modifier = parseInt(document.getElementById('modifier').value);

    const diceFirst = Math.floor(Math.random() * 6) + 1;
    const diceSecond = Math.floor(Math.random() * 6) + 1;
    const result = diceFirst + diceSecond + modifier;

    document.getElementById('result').textContent = `${result} ([${diceFirst}, ${diceSecond}]  +  [${modifier}])`;

    // Отправляем данные через сокет
    socket.emit('roll', { username, photoUrl, diceFirst, diceSecond, modifier, result });
}

socket.on('roll', data => {
    // document.getElementById('nameLabel').textContent = `Имя: ${data.username}`;
    // document.getElementById('diceLabel').textContent = `Значения кубов: ${data.diceFirst}, ${data.diceSecond}`;
    // document.getElementById('modifierLabel').textContent = `Модификатор: ${data.modifier}`;
    // document.getElementById('totalLabel').textContent = `Результат: ${data.result}`;

    // Отправка результатов в чат
    const chat = document.getElementById('chat');
    const chatMessage = document.createElement('div');
    const extraSpaces = "&nbsp;&nbsp;&nbsp;&nbsp;";  
    chatMessage.innerHTML  = `<strong>${data.username}</strong>: ${data.result}${extraSpaces}<em>([${data.diceFirst}, ${data.diceSecond}]  +  [${data.modifier}])</em>`;
    chat.appendChild(chatMessage);
    chat.scrollTop = chat.scrollHeight;

    // Анимация смены блока info
    if (!isHide) {
        const infoBlock = document.querySelector('.info');
        infoBlock.classList.add('hidden'); // Скрываем текущее содержимое блока info
        // Ждем завершения анимации, чтобы поменять содержимое
        infoBlock.addEventListener('transitionend', function() {
            // Обновляем содержимое блока info
            setBackground(data); // Устанавливаем фон в зависимости от результата
            infoBlock.classList.remove('hidden'); // Показываем новый контент
        }, { once: true }); // Удаляем слушатель после первого срабатывания
    } else
        setBackground(data);
    
    
    // Устанавливаем фон в зависимости от результата
    // setBackground(data.result);

    // Устанавливаем картинку по URL
    // const userImage = document.getElementById('userImage');
    // if (currentPlayer !== data.username) {
    //     currentPlayer = data.username
    //     // Просто статичная замена картинки
    //     // userImage.src = data.photoUrl.trim(); // Удаляем пробелы
        
    //     // Анимация смены изображения
    //     userImage.classList.add('hidden'); // Скрываем текущее изображение
    //     // Ждем завершения анимации, чтобы поменять src
    //     userImage.addEventListener('transitionend', function() {
    //         userImage.src = data.photoUrl; // Меняем изображение
    //         userImage.classList.remove('hidden'); // Показываем новое изображение
    //     }, { once: true }); // Удаляем слушатель после первого срабатывания
    // } 

    // Анимация для overlay и content-box
    overlay.style.opacity = '0';  // Исчезновение overlay
    contentBox.style.opacity = '1'; // Появление content-box
    isHide = false;

    clearTimeout(timer); // Сброс таймера, если событие пришло от другого пользователя

    // Запускаем таймер перед анимацией исчезновения content-box
    timer = setTimeout(() => {
        contentBox.style.opacity = '0'; // Анимация исчезновения content-box
        overlay.style.opacity = '1';    // Появление overlay
        isHide = true
    }, clickTimer);
});

document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('themeToggle');
    const body = document.body;
    document.body.classList.add('day-theme');
    contentBox.style.backgroundImage = "url('imgs/roller_bg.png')";
    
    // Toggle theme
    themeToggleButton.addEventListener('click', () => {
         if (body.classList.contains('day-theme')) {
              body.classList.remove('day-theme');
              body.classList.add('night-theme');
              themeToggleButton.innerText = 'Switch to Day Theme';
          } else {
              body.classList.remove('night-theme');
              body.classList.add('day-theme');
              themeToggleButton.innerText = 'Switch to Night Theme';
          }
    });
});