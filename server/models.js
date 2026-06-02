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


export function Step(station1, station2, event, coinsAfter) {
    this.station1 = station1;
    this.station2 = station2;
    this.event = event;
    this.coinsAfter = coinsAfter;
}