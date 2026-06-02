# Exam #N: "Exam Title"
## Student: s123456 LASTNAME FIRSTNAME 

## React Client Application Routes

- Route `/`: home page with game instructions and login/play buttons
- Route `/login`: login form
- Route `/game`: full game session (setup, planning, execution, result phases)
- Route `/ranking`: general leaderboard
- Route `*`: page not found

## API Server

- `POST /api/sessions` — login
  - Request body:
    ```json
    {
        "username": "AlainRizzi",
        "password": "alain123" 
    }
    ```
  - Response body:
    ```json
    { 
        "id": 1, 
        "username": "AlainRizzi", 
        "name": "Alain" 
    }
    ```

- `DELETE /api/sessions/current` — logout [isAuthenticated]
  - Request body: none
  - Response body: none

- `GET /api/sessions/current` — get current logged-in user [isAuthenticated]
  - Request body: none
  - Response body:
    ```json
    { 
        "id": 1, 
        "username": "AlainRizzi", 
        "name": "Alain" 
    }
    ```

- `GET /api/network` — get full network map with lines and stations [isAuthenticated]
  - Request body: none
  - Response body:
    ```json
    [
        { 
            "code": "M1", 
            "name": "Linea M1", 
            "color": "#E42313",
            "Stations": 
            [
                { 
                    "name": "Lotto", 
                    "x": 10, 
                    "y": 20 
                }, ...
            ] 
        }, ...
    ]
    ```

- `GET /api/segments` — get all adjacent station pairs for the planning phase [isAuthenticated]
  - Request body: none
  - Response body:
    ```json
    [
        { 
            "station1": "Lotto", 
            "station2": "Pagano" 
        }, ...
    ]
    ```

- `POST /api/games` — start a new game, server assigns start and destination stations [isAuthenticated]
  - Request body: none
  - Response body:
    ```json
    { 
        "id": 3, 
        "startStation": 
        { 
            "name": "Lotto", 
            "x": 10, 
            "y": 20 
        },
        "destinationStation": 
        { 
            "name": "Duomo", 
            "x": 50, 
            "y": 60 
        }
    }
    ```

- `POST /api/games/:id/route` — submit planned route; server validates, applies random events, stores result [isAuthenticated]
  - Request body:
    ```json
    { 
        "segments": 
        [
            { 
                "station1": "Lotto", 
                "station2": "Pagano" 
            }, ...
        ] 
    }
    ```
  - Response body:
    ```json
    { 
        "valid": true, 
        "steps": 
        [
            { 
                "station1": "Lotto", 
                "station2": "Pagano", 
                "event": 
                { 
                    "title": "Crowded Train", 
                    "description": "...", 
                    "effect": -1 
                },
                "coinsAfter": 19
            }, ...
        ], 
        "finalScore": 18 
    }
    ```

- `GET /api/ranking` — get best score per registered user, sorted descending [isAuthenticated]
  - Request body: none
  - Response body:
    ```json
    [
        { 
            "username": "AlainRizzi", 
            "score": 22,
            "startStation": "Lotto",
            "destinationStation": "Duomo"
        }, ...
    ]
    ```

## Database Tables

- Table `users` - id, username, name, salt, hash
- Table `metro_lines` - code, name, color
- Table `stations` - name, x, y
- Table `line_stations` - line_code, station_name, position
- Table `events` - id, title, description, effect, probability_weight
- Table `games` - id, user_id, start_station_name, destination_station_name, final_score, route_valid, status

## Main React Components

- `ListOfSomething` (in `List.js`): component purpose and main functionality
- `GreatButton` (in `GreatButton.js`): component purpose and main functionality
- ...

(only _main_ components, minor ones may be skipped)

## Screenshot

![Screenshot](./img/screenshot.jpg)

## Users Credentials

- AlainRizzi, alain123
- BertaTager, berta123
- Surfer, matheus123
- Ace, alembert123
- Giggles, anabella123

## Use of AI Tools
Briefly describe whether you used any AI tools (e.g., ChatGPT, GitHub Copilot, Claude) while working on this project, for which purposes (e.g., clarifying concepts, debugging, generating code), and how you verified or adapted their output.
If you did not use any AI tools, simply state so.
