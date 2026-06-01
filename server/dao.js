/* Data Access Object (DAO) module for accessing models data */

import dayjs from "dayjs";
import db from "./db.js";
import { User, Station, Line, Game, Step } from "./models.js";
import crypto from "crypto";

export const getUserById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id, username, name FROM users WHERE id = ?';
        db.get(sql, [id], (err, row) => {
            if (err) reject(err);
            else if (row === undefined) resolve(false);
            else resolve({ id: row.id, username: row.username, name: row.name });
        });
    });
};

export const getUserByCredentials = (username, password) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE username = ?';
        db.get(sql, [username], (err, row) => {
            if (err) {
                reject(err);
            } else if(row === undefined) {
                resolve(false); // no user with this username
            } 
            else {
                const user = new User(row.id, row.username, row.name);

                crypto.scrypt(password, row.salt, 16, function(err, hashedPassword){
                    if(err) reject(err);
                    if (!crypto.timingSafeEqual(Buffer.from(row.hash, 'hex'), hashedPassword)) {
                        resolve(false); // password does not match
                    } else {
                        resolve(user); // success: username and password match
                    }
                });
            }
        }); 
    });
};
