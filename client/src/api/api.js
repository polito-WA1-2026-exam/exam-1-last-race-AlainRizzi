import {Station, Line, Step} from '../models/models';

const BASE_URL = 'http://localhost:3001/api';

export async function getNetwork() {
    try{
        const response = await fetch(BASE_URL + '/network', { credentials: 'include' });

        if (response.ok) {
            const data = await response.json();
            return data.map(l => {
                const line = new Line(l.code, l.name, l.color);
                line.Stations = l.Stations.map(s => new Station(s.name, s.x, s.y));
                return line;
            });
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch network');
        }
    } catch (ex) {
        throw new Error("Network error", {cause: ex});
    }
}

export async function getSegments() {
    try{
        const response = await fetch(BASE_URL + '/segments', { credentials: 'include' });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch segments');
        }
    } catch (ex) {
        throw new Error("Network error", {cause: ex});
    }
}

export async function startGame() {
    try{
        const response = await fetch(BASE_URL + '/games', { 
            method: 'POST',
            credentials: 'include' 
        });

        if(response.ok) {
            const data = await response.json();
            return {
                id: data.id,
                startStation: new Station(data.startStation.name, data.startStation.x, data.startStation.y),
                destinationStation: new Station(data.destinationStation.name, data.destinationStation.x, data.destinationStation.y)
            };
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Failed to start game');
        }
    } catch (ex) {
        throw new Error("Network error", {cause: ex});
    }
}

export async function submitRoute(gameId, segments) {
    try{
        const response = await fetch(`${BASE_URL}/games/${gameId}/route`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ segments }),
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            return { valid: data.valid, steps: data.steps.map(s => new Step(s.station1, s.station2, s.event, s.coinsAfter)), finalScore: data.finalScore };
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Failed to submit route');
        }
    } catch (ex) {
        throw new Error("Network error", {cause: ex});
    }
}

export async function getRanking() {
    try{
        const response = await fetch(BASE_URL + '/ranking', { credentials: 'include' });

        if (response.ok) {
            return response.json(); // [{ username, score, startStation, destinationStation }]
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch ranking');
        }
    } catch (ex) {
        throw new Error("Network error", {cause: ex});
    }
}