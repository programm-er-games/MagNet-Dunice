const fields = require('./db_struct');

let rus_fields = {};

try {
    for (const table in fields) {
        for (const field in fields[table]) {
            if (field in rus_fields) continue;
            else {
                let rus_word = "";
                switch (field) {
                    case 'id':
                        rus_word = "№";
                        break;
                    case 'user_id':
                        rus_word = "Номер карточки";
                        break;
                    case 'name':
                        rus_word = "ФИО";
                        break;
                    case 'role':
                        rus_word = "Роль";
                        break;
                    case 'take_time':
                        rus_word = "Время выдачи";
                        break;
                    case 'return_time':
                        rus_word = "Время сдачи";
                        break;
                    case 'room_number':
                        rus_word = "Номер аудитории";
                        break;
                    case 'key_number':
                        rus_word = "Номер аудитории";
                        break;
                    case 'access_level':
                        rus_word = "Главная роль";
                        break;
                    case 'required_access_level':
                        rus_word = "Недоступная роль";
                        break;
                    case 'status':
                        rus_word = 'Статус';
                        break;
                    case 'role':
                        rus_word = 'Роль';
                        break;
                    case 'phone_number':
                        rus_word = "Номер телефона";
                        break;
                    case 'login':
                        rus_word = "Логин";
                        break;
                    case 'password':
                        rus_word = "Пароль";
                        break;
                    case 'is_datetime':
                        rus_word = "Дата и время добавления";
                        break;
                }
                rus_fields[field] = rus_word;
            }
        }
    }
}
catch (error) {
    console.log("From th_struct.js: " + error);
}

const result = rus_fields;
// console.log(result);

module.exports = result;