const { remote } = require('electron');

document.getElementById('logout').addEventListener('click', function (event) {
    event.preventDefault(); // Отключаем стандартное поведение ссылки

    let window = remote.getCurrentWindow(); // Получаем текущее окно
    window.close(); // Закрываем его
});
