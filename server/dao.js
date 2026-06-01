/* Data Access Object (DAO) module for accessing models data */

import dayjs from "dayjs";
import db from "./db.js";
import { User, Station, Line, Game, Step } from "./models.js";
import crypto from "crypto";

// This function is used to check if user is still in db by id
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

// This function is used by Passport to check if the credentials are correct and to retrieve user info (id, username, name) to store in the session.
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

                crypto.scrypt(password, row.salt, 32, function(err, hashedPassword){
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

// This function is used to get the metro network (lines and stations) to be stored in the server memory at startup and used for validating routes and calculating scores.
export const getNetwork = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT s.name as stationName, s.x, s.y,
        l.code as lineCode, l.name as lineName, l.color as lineColor,
        ls.position as lineStationPosition FROM stations s, metro_lines l, line_stations ls
        WHERE s.name = ls.station_name AND l.code = ls.line_code
        ORDER BY l.code, ls.position`; // NOTE: the order by is important to correctly build the network (lines and their stations in the correct order)
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const network = [];
                rows.forEach(row => {
                    let line = network.find(l => l.code === row.lineCode);
                    if (!line) {
                        line = new Line(row.lineCode, row.lineName, row.lineColor);
                        network.push(line);
                    }
                    line.Stations.push(new Station(row.stationName, row.x, row.y));
                });
                resolve(network);
            }
        });
    });
}
