const fields = {
    "admins": {
        "id": "INTEGER PRIMARY KEY AUTOINCREMENT",
        "name": "TEXT NOT NULL UNIQUE",
        "login": "TEXT NOT NULL UNIQUE",
        "password": "TEXT NOT NULL UNIQUE",
        is_datetime: true
    },
    "employees": {
        "id": "INTEGER PRIMARY KEY AUTOINCREMENT",
        "name": "TEXT NOT NULL",
        "office_id": "INTEGER NOT NULL",
        "table_id": "INTEGER NOT NULL",
        "settings": "TEXT",
        is_datetime: true
    },
    "tables": {
        "id": "INTEGER PRIMARY KEY AUTOINCREMENT",
        "name": "TEXT",
        "office_id": "INTEGER NOT NULL",
        "room_id": "INTEGER NOT NULL",
        "settings": "TEXT",
        is_datetime: true
    },
    "offices": {
        "id": "INTEGER PRIMARY KEY AUTOINCREMENT",
        "name:": "TEXT NOT NULL",
        "stage": "INTEGER NOT NULL",
        "settings": "TEXT",
        is_datetime: true
    },
    "rooms": {
        "id": "INTEGER PRIMARY KEY AUTOINCREMENT",
        "name": "TEXT",
        "type": "TEXT NOT NULL",
        "office_id": "INTEGER NOT NULL",
        "settings": "TEXT",
        is_datetime: true
    },
    "stages": {
        "id": "INTEGER PRIMARY KEY AUTOINCREMENT",
        "stage_number": "INTEGER NOT NULL",
        "building_id": "INTEGER NOT NULL",
        is_datetime: true
    },
    "items": {
        "id": "INTEGER PRIMARY KEY AUTOINCREMENT",
        "name": "TEXT NOT NULL",
        "description": "TEXT",
        "type": "TEXT",
        "settings": "TEXT",
        is_datetime: true
    },
    "users": {
        "id": "INTEGER PRIMARY KEY AUTOINCREMENT",
        "name": "TEXT NOT NULL UNIQUE",
        "login": "TEXT NOT NULL UNIQUE",
        "password": "TEXT NOT NULL",
        is_datetime: true
    },
    "building": {
        "id": "INTEGER PRIMARY KEY AUTOINCREMENT",
        "name": "TEXT NOT NULL",
        "address": "TEXT NOT NULL",
        is_datetime: true
    },
    "schemas": {
        "id": "INTEGER NOT NULL",
        "element_name": "TEXT",
        "element_id": "INTEGER NOT NULL",
        "element_settings": "TEXT",
        is_datetime: true
    },
};

module.exports = fields;