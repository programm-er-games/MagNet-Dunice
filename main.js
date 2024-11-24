const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const { exec } = require('child_process');
const sqlite3 = require('sqlite-electron');
const ExcelJS = require('exceljs');
const fields = require('./app/db_struct');
const rus_fields = require("./app/th_struct");

const server = express();
const dbPath = path.join(__dirname, "app", "axl.db");
let splash;
let mainWindow;
let rfid_data = "";
let cam_data = "";

function get_datetime() {
    let datetime = new Date().toLocaleString();
    datetime = datetime.split(", ");
    datetime[0] = datetime[0].split(".").join("-");
    datetime[1] = datetime[1].split(":").join("-");
    datetime = datetime.join(" ");
    return datetime;
}

function is_args_correct(table, check_all = true, ...args) {
    let error = "";
    if (table in fields) {
        if (check_all === false) return true;
        for (const check_field in args) {
            if (check_field == fields[table]) {
                console.log("success:", field);
                continue;
            }
            else {
                console.log("error:", field)
                error = "field";
                break;
            }
        }
    }
    else error = "table";
    return error === "" ? true : error;
}

ipcMain.handle("create-key-log", async (event, is_exist_u, is_exist_kl) => {
    console.log("is_exist_u:", is_exist_u);
    console.log("is_exist_kl:", is_exist_kl);
    let check = [];
    for (const field in is_exist_u[0]) check.push(field);
    const c1 = is_args_correct("users", check);
    check = [];
    for (const field in is_exist_kl[0]) check.push(field);
    const c2 = is_args_correct("key_logs", check);
    console.log("check1:", c1);
    console.log("check2:", c2);
    if (c1 instanceof String === true) return c1;
    else if (c2 instanceof String === true) return c2;
    if (is_exist_u) {
        if (is_exist_kl) {
            query = "UPDATE key_logs SET return_time = datetime('now', 'localtime'), status = ? WHERE user_id == ? AND take_time != NULL";
            rfid_data = "";
            console.log("updated!");
            return await sqlite3.executeQuery(query, ["Выдан", rfid_data, is_exist_kl[0]['take_time']]);
        }
        else {
            query = "INSERT INTO key_logs (" +
                "user_id, key_number, status" +
                ") VALUES (" +
                "?, ?, ?" +
                ");";
            rfid_data = "";
            console.log("updated!");
            return await sqlite3.executeQuery(query, [rfid_data, is_exist_u[0]['key_number'], "Выдан"]);
        }
    }
    else {
        rfid_data = "";
        console.log("updated!");
        return "error in: unknown user";
    }
});

ipcMain.handle("console-out", (event, to_print, from = "preload.js") => {
    console.log("GET FROM " + from.toUpperCase() + ":", to_print);
});

ipcMain.handle("get-esp-data", (event, to_get = 'all') => {
    switch (to_get) {
        case 'rfid':
            return rfid_data;

        case 'cam':
            return cam_data;

        case 'all':
            return [rfid_data, cam_data];
    }
});

ipcMain.handle("connect_db", async (event) => {
    console.log("DB connected!");
    return await sqlite3.setdbPath(dbPath);
});

ipcMain.handle("db-start", async (event) => {
    for (const table in fields) {
        let query = "CREATE TABLE IF NOT EXISTS ";
        query += table + " (";
        for (const row in fields[table]) {
            if (row !== 'is_datetime') query += row + " " + fields[table][row];
            else if (fields[table][row] === true) query += "datetime TIMESTAMP NOT NULL DEFAULT (datetime('now', 'localtime'))";
            else continue;
            query += ", ";
        }
        query = query.slice(0, -2);
        query += ");";
        if (await sqlite3.executeQuery(query)) continue;
        else return false;
    };
    console.log("DB struct restored!");
    return fields;
});

ipcMain.handle('insert', async (event, table, { ...args }) => {
    let to_check = [];
    for (const field in args) to_check.push(field);
    const check = is_args_correct(table, to_check);
    console.log("check:", check);
    if (check === true) {
        console.log("args:", args);
        to_check = [];
        let query = "INSERT INTO ";
        query += table + " (";
        for (const field in args) {
            query += `${field}` + ", ";
            to_check.push(encodeURI(args[field]));
        }
        query = query.slice(0, -2);
        query += ") VALUES (";
        for (i = 0; i < Object.keys(args).length; i++) query += "?, ";
        query = query.slice(0, -2);
        query += ");";
        console.log("query:", query);
        if (await sqlite3.executeQuery(query, to_check)) return true;
        else return "error in: query or execution";
    }
    else return "error in: " + check;
});

ipcMain.handle('update', async (event, table, { ...args }) => {
    let to_check = [];
    for (const field in args)
        to_check.push(
            field.startsWith("upd_") === true ? field.slice(3) : field
        );
    const check = is_args_correct(table, to_check);
    if (check === true) {
        let query = "UPDATE " + table + " SET ";
        let temp_q = " WHERE ";
        let check_list = [];
        let upd_list = [];
        for (const field in args) {
            if (field.startsWith("upd_") === true) {
                query += field.slice(3) + " = ?, ";
                upd_list.push(encodeURI(args[field]));
            }
            else {
                temp_q += field + " == ? AND ";
                check_list.push(encodeURI(args[field]));
            }
        }
        upd_list.push(check_list);
        temp_q = temp_q.slice(0, -5);
        temp_q += ";";
        query = query.slice(0, -2);
        query += temp_q;
        return await sqlite3.fetchAll(query, upd_list);
    }
    else return check;
});

ipcMain.handle('delete', async (event, table, { ...args }) => {
    let query = "DELETE * FROM ";
    if (args['skip'] === true) {
        const check = is_args_correct(table, check_all = false);
        if (check === true) {
            query += table;
            return await sqlite3.executeQuery(query);
        }
        else return "error in: table";
    }
    else {
        let to_check = [];
        for (const field in args) to_check.push(field);
        const check = is_args_correct(table, to_check);
        if (check === true) {
            query += table + " WHERE ";
            to_check = [];
            for (const field in args) {
                if (args[field].startsWith("*(") === true
                    && args[field].endsWith(")*") === true) {

                    const temp = args[field].slice(2, -2);
                    console.log("temp:", temp);
                    query += `${field} ${temp} AND `;
                }
                else {
                    query += `${field}` + " == ? AND ";
                    to_check.push(args[field]);
                }
            }
            query = query.slice(0, -5);
            query += ";";
            const result = await sqlite3.fetchAll(query, to_check);
            console.log("del: " + result);
            return result;
        }
        else return "error in: " + check;
    }
});

ipcMain.handle('get', async (event, table, { ...args }) => {
    let query = "SELECT * FROM ";
    if (args['skip'] === true) {
        const check = is_args_correct(table, check_all = false);
        if (check === true) {
            query += table;
            return await sqlite3.fetchAll(query);
        }
        else return "error in: table";
    }
    else {
        let to_check = [];
        for (const field in args) to_check.push(field);
        const check = is_args_correct(table, to_check);
        if (check === true) {
            query += table + " WHERE ";
            to_check = [];
            for (const field in args) {
                if (args[field].startsWith("*(") === true
                    && args[field].endsWith(")*") === true) {

                    const temp = args[field].slice(2, -2);
                    console.log("temp:", temp);
                    query += `${field} ${temp} AND `;
                }
                else {
                    query += `${field}` + " == ? AND ";
                    to_check.push(args[field]);
                }
            }
            query = query.slice(0, -5);
            query += ";";
            const result = await sqlite3.fetchAll(query, to_check);
            console.log("get: " + result);
            return result;
        }
        else return "error in: " + check;
    }
});

ipcMain.handle('get_filter', async (event, table, cond, cond_value) => {
    const check = is_args_correct(table, check_all = false);
    if (check === true) {
        let query = "SELECT * FROM " + table + " WHERE ? == ?";
        return await sqlite3.fetchAll(query, [cond, cond_value]);
    }
});

ipcMain.handle('get_fields', async (event, table) => {
    let result = {};
    const check = is_args_correct(table, false);
    // console.log("rus_fields: " + rus_fields);
    if (check === true) {
        for (const field in fields[table]) {
            result[field] = rus_fields[field];
        }
        // console.log("result: " + result);
        return result;
    }
    else return check;
});

ipcMain.handle('export-data', async (event, { ...args }) => {
    try {
        for (const table in args) {
            if (is_args_correct(table, false) === true) continue;
            else return "error in: table";
        }
        const workbook = new ExcelJS.Workbook();
        for (const table in fields) {
            let temp_ws = workbook.addWorksheet(table);
            let temp = [];
            for (const field in fields[table]) {
                if (field !== 'is_datetime')
                    temp.push({ header: field.toUpperCase(), key: field, width: 30 });
                else if (fields[table][field] === true)
                    temp.push({ header: "DATETIME", key: "datetime", width: 30 });
            }
            temp_ws.columns = temp;
            const temp_data = args[table];
            for (const field in temp_data) for (const row in temp_data[field]) temp_data[field][row] = decodeURI(temp_data[field][row]);
            for (const record in temp_data) {
                console.log(Object.values(temp_data[record]));
                temp_ws.addRow(Object.values(temp_data[record]));
            }
        }

        let name = "log " + get_datetime() + ".xlsx";
        exec("copy \""
            + path.join(__dirname, "app", "temp.xlsx")
            + "\" \""
            + path.join(__dirname, name)
            + "\"",
            (error, stdout, stderr) => {
                if (error) {
                    console.log(error);
                    return "error";
                }
                console.log(stdout);
                console.error(stderr);
            }
        );
        console.log("Success! Log expoted to " + name);
        return await workbook.xlsx.writeFile(path.join(__dirname, name));
    }
    catch (error) { console.error(error); }
});

function createWindow() {
    // Создаем загрузочный экран
    splash = new BrowserWindow({
        width: 400,
        height: 300,
        frame: false,  // Без рамки
        alwaysOnTop: true,  // Всегда поверх других окон
        transparent: true,  // Прозрачность для более красивого вида
        icon: path.join(__dirname, 'image', 'sheild-front-color.ico'),  // Указываем путь к иконке для splash
        title: 'QR-KEY',  // Название приложения
        webPreferences: {
            contextIsolation: true
        }
    });

    splash.loadFile(path.join(__dirname, 'page/splash.html'));

    // Создаем основное окно
    mainWindow = new BrowserWindow({
        fullscreen: true,
        show: false,  // Не показывать до полной загрузки
        icon: path.join(__dirname, 'image', 'sheild-front-color.ico'),  // Указываем путь к иконке для основного окна
        title: 'QR-KEY',  // Название приложения
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            enableRemoteModule: false
        }
    });

    const { Menu } = require('electron');
    Menu.setApplicationMenu(null);
    mainWindow.loadFile(path.join(__dirname, 'page/index.html'));

    // Показать основное окно после полной загрузки
    mainWindow.webContents.on('did-finish-load', () => {
        setTimeout(() => {
            // Проверка, что splash окно существует и не уничтожено
            if (splash && !splash.isDestroyed()) {
                splash.close();  // Закрыть загрузочный экран
            }
            mainWindow.show();  // Показать основное окно
        }, 3000);  // Задержка для демонстрации анимации
    });
}

app.whenReady().then(() => {
    createWindow();

    setInterval(async () => {
        const rfid = rfid_data;
        rfid_data = "";
        if (rfid == "" || rfid === "ESP32 connected to server!") return;
        // is_exist_u = sqlite3.fetchAll("SELECT * FROM users WHERE user_id == ?", [rfid_data]);
        const is_exist_kl = await sqlite3.fetchAll("SELECT * FROM key_logs WHERE user_id == ?", [rfid_data]);
        console.log("is_exist_kl: " + is_exist_kl);
        const check = is_exist_kl[0] === undefined ? false : true;
        if (check === true) {
            query = "UPDATE key_logs " +
                "SET return_time = datetime('now', 'localtime'), status = ? " +
                "WHERE user_id == ? AND take_time != NULL";
            console.log("updated!");
            return await sqlite3.executeQuery(query, ["Сдан", rfid, is_exist_kl[0]['take_time']]);
        }
        else {
            query = "INSERT INTO key_logs (" +
                "user_id, key_number, status" +
                ") VALUES (" +
                "?, ?, ?" +
                ");";
            console.log("created!");
            return await sqlite3.executeQuery(query, [rfid, 101, "Выдан"]);
        }
    }, 1000);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

server.use(bodyParser.text());

server.post('/rfid_data', (req, res) => {
    console.log('Received on /rfid_data:' + req.body);
    const test = req.body;
    console.log(test);
    rfid_data = req.body;
    res.send('Data received');
});

server.post('/cam_data', (req, res) => {
    console.log('Received on /cam_data:', req.body);
    cam_data = req.body;
    res.send('Data received');
    // console.log('Received on /cam_data:', req.body);
    // // Запуск Python-скрипта для обработки изображения
    // exec(path.join(__dirname, "qr_scan", "qr_scan.exe") + " \"" + req.body + "\"", (error, stdout, stderr) => {
    //     if (error) console.error("Error executing script:\n\n" + error);
    //     console.log(stdout);
    //     cam_data = stdout;

    //     // Отправляем результат обратно на клиент
    //     req.body = stdout;
    //     res.send('Data received: ' + stdout);
    // });
});

server.post('/err', (req, res) => {
    console.log('Received on /err:', req.body);
    res.send(('Error occured! See:\n', req.body));
});

server.listen(8000, () => {
    console.log('HTTP server is listening on http://localhost:8000');
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Обработка события на выход из приложения
ipcMain.on('app-quit', () => {
    app.quit();
});
