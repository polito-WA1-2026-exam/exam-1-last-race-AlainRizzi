/* Data Access Object (DAO) module for accessing models data */

import dayjs from "dayjs";
import db from "./db.js";
import { Station, Line, Step } from "./models.js";
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
                crypto.scrypt(password, row.salt, 32, function(err, hashedPassword){
                    if(err) reject(err);
                    if (!crypto.timingSafeEqual(Buffer.from(row.hash, 'hex'), hashedPassword)) {
                        resolve(false); // password does not match
                    } else {
                        resolve({ id: row.id, username: row.username, name: row.name });
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

// Returns all adjacent station pairs from the DB as { station1, station2 }, deduped (bidirectional connections stored once).
export const getSegments = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT ls1.station_name AS station1, ls2.station_name AS station2
                     FROM line_stations ls1, line_stations ls2
                     WHERE ls1.line_code = ls2.line_code
                     AND ls2.position = ls1.position + 1`;
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows.map(r => ({ station1: r.station1, station2: r.station2 })));
        });
    });
};

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
    return false; // no path found, error case since the network should be fully connected, but we return false just in case
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
                resolve({ id: this.lastID, startStation, destinationStation });
            }
        });
    });
};

// Returns { start_station_name, destination_station_name } or rejects if not found
const getGameById = (gameId, userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT start_station_name, destination_station_name FROM games WHERE id = ? AND user_id = ?';
        db.get(sql, [gameId, userId], (err, row) => {
            if (err) reject(err);
            else if (row === undefined) reject(new Error('Game not found'));
            else resolve(row);
        });
    });
};

// Returns weighted event pool as array of { title, description, effect }
const getEvents = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT title, description, effect, probability_weight FROM events';
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else {
                const pool = [];
                rows.forEach(row => {
                    for (let i = 0; i < row.probability_weight; i++)
                        pool.push({ title: row.title, description: row.description, effect: row.effect });
                });
                resolve(pool);
            }
        });
    });
};


// Checks that: route has >3 segments, starts at startStation, ends at destinationStation,
// and each consecutive segment shares an endpoint (chain is connected).
const isRouteValid = (route, startStation, destinationStation) => {
    if (route.length < 3) return false;
    if (route[0].station1 !== startStation && route[0].station2 !== startStation) return false;
    if (route[route.length - 1].station2 !== destinationStation && route[route.length - 1].station1 !== destinationStation) return false;

    for (let i = 0; i < route.length - 1; i++) {
        const exits = [route[i].station1, route[i].station2];
        const enters = [route[i + 1].station1, route[i + 1].station2];
        if (!exits.some(e => enters.includes(e))) return false;
    }

    return true;
};

// Validates and completes a game: applies weighted random events per segment, stores result.
// Returns { valid, steps, finalScore }
export const completeGame = async (gameId, userId, route) => {
    const game = await getGameById(gameId, userId);
    const valid = isRouteValid(route, game.start_station_name, game.destination_station_name);

    let finalScore = 0;
    const steps = [];

    if (valid) {
        const eventPool = await getEvents();
        finalScore = 20;
        for (const segment of route) {
            const event = eventPool[Math.floor(Math.random() * eventPool.length)];
            finalScore += event.effect;
            steps.push(new Step(segment.station1, segment.station2, event, finalScore));
        }
    }

    await new Promise((resolve, reject) => {
        const sql = 'UPDATE games SET final_score = ?, route_valid = ?, status = ? WHERE id = ? AND user_id = ?';
        db.run(sql, [finalScore, valid ? 1 : 0, 'completed', gameId, userId], err => {
            if (err) reject(err);
            else resolve();
        });
    });

    return { valid, steps, finalScore };
};

// Returns best score per user, sorted descending
export const getRanking = () => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT u.username, g.final_score AS score, g.start_station_name, g.destination_station_name
                     FROM users u, games g
                     WHERE u.id = g.user_id AND g.route_valid = 1
                     AND g.final_score = (
                         SELECT MAX(g2.final_score) FROM games g2
                         WHERE g2.user_id = u.id AND g2.route_valid = 1
                     )
                     GROUP BY u.id
                     ORDER BY score DESC`;
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows.map(r => ({ username: r.username, score: r.score, startStation: r.start_station_name, destinationStation: r.destination_station_name })));
        });
    });
};