export function User(id, email, name){
    this.id = id;
    this.email = email;
    this.name = name;
}

export function Station(name, x, y){
    this.name = name;
    this.x = x;
    this.y = y;
}

export function Line(code, name, color){
    this.code = code;
    this.name = name;
    this.color = color;
    this.Stations = [];
}

export function Game(id, userId, startStationName, destinationStationName, startedAt, completedAt, finalScore, routeValid, status) {
    this.id = id;
    this.userId = userId;
    this.startStationName = startStationName;             // assigned starting station
    this.destinationStationName = destinationStationName; // assigned destination
    this.startedAt = startedAt;                           // when POST /api/games created it
    this.completedAt = completedAt;                       // when route was submitted (null if abandoned)
    this.finalScore = finalScore;                         // negatives stored/shown as 0
    this.routeValid = routeValid;                         // bool: was the submitted route valid
    this.status = status;                                 // e.g. 'planning' | 'completed'
  }

export function Step(from, to, event, coinsAfter) {
    this.from = from;             // station (name)
    this.to = to;
    this.event = event;           // { description, effect } applied to this segment
    this.coinsAfter = coinsAfter; // running coin total after this step
  }