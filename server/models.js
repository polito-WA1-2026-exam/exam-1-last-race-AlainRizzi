export function User(id, username, name){
    this.id = id;
    this.username = username;
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


export function Step(gameId, from, to, event, coinsAfter) {
    this.gameId = gameId;
    this.from = from;             // station (name)
    this.to = to;
    this.event = event;           // { description, effect } applied to this segment
    this.coinsAfter = coinsAfter; // running coin total after this step
  }