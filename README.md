# Bomberman Mayhem
Building a basic multiplayer bomberman type game using babylon.js and colyseus

## Rules
- Player move around using keyboard arrows
- Player can place bombs (1 at a time) by pressing teh scape key on the keyboard
- Bomb will explode automatically after 3 seconds (bomb explosion radius is of 4 squares)
- Anyone in the explosion radius will die
- Last player alive will be declared the winner

## Current Progress
- Basic framework is in place (21-02-2024)

## ASCII Map Maker
I use https://stmn.github.io/ascii-map-editor/ to generate all the maps.

Cell types currently available: 
- W (wall)
- S (spwanpoint)
- G (ground)

## Requirements
- Download and install [Node.js LTS](https://nodejs.org/en/download/)
- Clone or download this repository.
- Run `npm install`

## Technology
- Babylon.js 6.x.x [https://www.babylonjs.com/](https://www.babylonjs.com/)
- Colyseus 0.15.x [https://colyseus.io/](https://colyseus.io/)

## How to run
- Run `npm run server-dev` to launch the server
- Run `npm run client-dev` to launch the client

> The client should be accessible at [`http://localhost:8080`](http://localhost:8080)
> The server should be available locally at [http://localhost:3000](http://localhost:3000)