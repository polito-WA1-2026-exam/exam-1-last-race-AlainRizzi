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

const isAtLeast3Apart = (network, stationName1, stationName2) => {
    const visited = new Set();
    const queue = [{ name: stationName1, distance: 0 }];
    while (queue.length > 0) {
        const { name, distance } = queue.shift();
        if (name === stationName2) return distance >= 3;
        if (distance >= 3) return true; // target not found within 3 stops
        if (visited.has(name)) continue;
        visited.add(name);
        for (const line of network) {
            const index = line.Stations.findIndex(s => s.name === name);
            if (index !== -1) {
                if (index > 0) queue.push({ name: line.Stations[index - 1].name, distance: distance + 1 });
                if (index < line.Stations.length - 1) queue.push({ name: line.Stations[index + 1].name, distance: distance + 1 });
            }
        }
    }
    return false; // no path found — error case since the network should be fully connected, but we return false just in case
};

// This function is used to start a game and assign random start and destination stations that are at least 3 stations apart.
export const startGame = (userId, network) => {
    return new Promise((resolve, reject) => {
        const allStations = network.flatMap(line => line.Stations);
        let startStation, destinationStation;
        do {
            startStation = allStations[Math.floor(Math.random() * allStations.length)];
            destinationStation = allStations[Math.floor(Math.random() * allStations.length)];
        } while (startStation.name === destinationStation.name || !isAtLeast3Apart(network, startStation.name, destinationStation.name));
        const sql = 'INSERT INTO games (user_id, start_station_name, destination_station_name, final_score, route_valid, status) VALUES (?, ?, ?, ?, ?, ?)';
        db.run(sql, [userId, startStation.name, destinationStation.name, 0, false, 'planning'], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ startStation, destinationStation });
            }
        });
    });
};