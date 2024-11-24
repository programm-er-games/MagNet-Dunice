// preload.js
const { contextBridge, ipcRenderer } = require('electron');

ipcRenderer.invoke("connect_db");
/*const fields = */ipcRenderer.invoke("db-start");

contextBridge.exposeInMainWorld('db_api', {
    create: async (table, { ...args }) => {
        if (table === "rooms") {
            try {
                if (args['new'] !== undefined) {
                    const elem = args['new'];
                    const result = await ipcRenderer.invoke("insert", table,
                        {
                            type: elem.id,
                            office_id: 1,
                        }
                    );
                    if (result instanceof String === true) {
                        ipcRenderer.invoke("console-out", result);
                        return "error!";
                    }
                    return result;
                }
                else return "error! need an argument!";
            }
            catch (error) {
                ipcRenderer.invoke("console-out", error);
                return error;
            }
        }
        else if (table === "items") {
            try {
                if (args['new'] !== undefined) {
                    const elem = args['new'];
                    const result = await ipcRenderer.invoke("insert", table,
                        {
                            name: "item",
                            type: elem.id,
                        }
                    );
                    if (result instanceof String === true) {
                        ipcRenderer.invoke("console-out", result);
                        return "error!";
                    }
                    return result;
                }
                else return "error! need an argument!";
            }
            catch (error) {
                return error;
            }
        }
        else if (table === "employees") {
            if (args['new'] !== undefined) {
                const elem = args['new'];
                const result = await ipcRenderer.invoke("insert", table,
                    {
                        name: "employee",
                        office_id: 1,
                        table_id: elem.id,
                    }
                );
                if (result instanceof String === true) {
                    ipcRenderer.invoke("console-out", result);
                    return "error!";
                }
                return result;
            }
            else return "error! need an argument!";
        }
        else if (table === "schemas") {
            
        }
        // else if (table === "users" || table === "admins") {
        //     try {
        //         const result = await ipcRenderer.invoke("insert", table, {
        //             name: document.getElementById("full-name").value.trim(),
        //             login: document.getElementById('login-display').innerText,
        //             password: document.getElementById('password-display').innerText
        //         });
        //         if (result instanceof String === true)
        //             return "error!";
        //         return result;
        //     }
        //     catch (error) {
        //         return error;
        //     }
        // }
    },
    read: async (table, is_auth = false) => {
        try {
            const result = await ipcRenderer.invoke("get", table, { skip: true });
            if (result instanceof String) return "error!";
            // if (is_auth === false) {
            //     const tbody = document.querySelector(".data-table tbody");
            //     tbody.innerHTML = '';
            //     result.forEach(record => {
            //         const tr = document.createElement("tr");
            //         const td_img = document.createElement("td");
            //         td_img.innerHTML = "<img src=\"../image/sheild-front-color.png\" alt=\"Картинка\">";
            //         tr.append(td_img);
            //         for (const key in record) {
            //             const td = document.createElement("td");
            //             td.textContent = decodeURI(record[key]);
            //             tr.appendChild(td);
            //         }
            //         tbody.appendChild(tr);
            //     });
            // }
            return result;
        }
        catch (error) {
            ipcRenderer.invoke("console-out", error);
            return error;
        }
    },
    // update: async (table) => {
    //     if (table == "keys") {
    //         const result = await ipcRenderer.invoke("update", "keys", {});
    //         if (result instanceof String === true) return "error!";
    //         return result;
    //     }
    // },
    delete: async (table, { ...args }) => {
        try {
            const result = await ipcRenderer.invoke("delete", table, { ...args });
            return result;
        }
        catch (error) {
            ipcRenderer.invoke('console-out', error);
            return error;
        }
    },
});

contextBridge.exposeInMainWorld('debug_api', {
    out: (to_print, from = "preload.js") => {
        ipcRenderer.invoke("console-out", to_print, from)
    }
});

contextBridge.exposeInMainWorld('export_api', {
    export: async () => {
        try {
            const result = await ipcRenderer.invoke("export-data", {
                users: await ipcRenderer.invoke("get", "users", { skip: true }),
                keys: await ipcRenderer.invoke("get", "keys", { skip: true }),
                key_logs: await ipcRenderer.invoke("get", "key_logs", { skip: true })
            });
            return result;
        }
        catch (error) {
            return error;
        }
    }
});

contextBridge.exposeInMainWorld('electronAPI', {
    quitApp: () => ipcRenderer.send('app-quit')
});

// загрузка
