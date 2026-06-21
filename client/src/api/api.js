import {Station, Line, Step} from '../models/models';

const BASE_URL = 'http://localhost:3001/api';

async function handleInvalidResponse(response) {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Request failed');
    }
    const type = response.headers.get('Content-Type');
    if (type !== null && type.indexOf('application/json') === -1) {
        throw new TypeError(`Expected JSON, got ${type}`);
    }
    return response;
}

export async function getNetwork() {
    const data = await fetch(BASE_URL + '/network', { credentials: 'include' })
        .then(handleInvalidResponse)
        .then(r => r.json());
    return data.map(l => {
        const line = new Line(l.code, l.name, l.color);
        line.Stations = l.Stations.map(s => new Station(s.name, s.x, s.y));
        return line;
    });
}


export async function startGame() {
    const data = await fetch(BASE_URL + '/games', {
        method: 'POST',
        credentials: 'include'
    })
        .then(handleInvalidResponse)
        .then(r => r.json());
    return {
        id: data.id,
        startStation: new Station(data.startStation.name, data.startStation.x, data.startStation.y),
        destinationStation: new Station(data.destinationStation.name, data.destinationStation.x, data.destinationStation.y),
        startedAt: data.startedAt,
        timeLimit: data.timeLimit
    };
}

export async function submitRoute(gameId, segments) {
    const data = await fetch(`${BASE_URL}/games/${gameId}/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ segments }),
        credentials: 'include'
    })
        .then(handleInvalidResponse)
        .then(r => r.json());
    return {
        valid: data.valid,
        finalScore: data.finalScore,
        steps: data.steps.map(s => new Step(s.station1, s.station2, s.event, s.coinsAfter))
    };
}

export async function getRanking() {
    return await fetch(BASE_URL + '/ranking', { credentials: 'include' })
        .then(handleInvalidResponse)
        .then(r => r.json());
}