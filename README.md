# Exam #N: "Exam Title"
## Student: s123456 LASTNAME FIRSTNAME 

## React Client Application Routes

- Route `/`: page content and purpose
- Route `/something/:param`: page content and purpose, param specification
- ...

## API Server

- POST `/api/something`
  - request parameters and request body content
  - response body content
- GET `/api/something`
  - request parameters
  - response body content
- POST `/api/something`
  - request parameters and request body content
  - response body content
- ...

## Database Tables

- Table `users` - stores users. It contains id, email, name, and hashed+salted credentials (salt, hash).
- Table `metro_lines` - stores the metro lines of the network. It contains code (primary key), name, and display color.
- Table `stations` - stores all stations in the network. It contains name (primary key) and x/y coordinates used to render the map.
- Table `line_stations` - junction table connecting lines and stations. It contains line_code, station_name, and position (ordering of the station within that line), allowing reconstruction of all connections and segments.
- Table `events` - stores the pool of random events that can occur during a journey segment. It contains title, description, effect (integer from -4 to +4), and probability_weight for weighted random selection.
- Table `games` - stores each game played by a registered user. It contains user_id, start and destination station names, timestamps, final_score (≥ 0, null if not yet completed), route_valid (0/1), and status (planning or completed).

## Main React Components

- `ListOfSomething` (in `List.js`): component purpose and main functionality
- `GreatButton` (in `GreatButton.js`): component purpose and main functionality
- ...

(only _main_ components, minor ones may be skipped)

## Screenshot

![Screenshot](./img/screenshot.jpg)

## Users Credentials

- username, password (plus any other requested info)
- username, password (plus any other requested info)

## Use of AI Tools
Briefly describe whether you used any AI tools (e.g., ChatGPT, GitHub Copilot, Claude) while working on this project, for which purposes (e.g., clarifying concepts, debugging, generating code), and how you verified or adapted their output.
If you did not use any AI tools, simply state so.
