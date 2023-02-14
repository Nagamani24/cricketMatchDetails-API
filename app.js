const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Sever is starting at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
  }
};

initializeDbAndServer();

convertPlayerTable = (each) => {
  return {
    playerId: each.player_id,
    playerName: each.player_name,
  };
};

convertMatchTable = (each) => {
  return {
    matchId: each.match_id,
    match: each.match,
    year: each.year,
  };
};

//API 1

app.get("/players/", async (request, response) => {
  const playersListQuery = `SELECT *
                                FROM player_details`;
  const playersList = await db.all(playersListQuery);
  response.send(playersList.map((each) => convertPlayerTable(each)));
});

//API 2

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  playerDetailsQuery = `SELECT *
                            FROM player_details
                            WHERE player_id= ${playerId};`;
  const playerDetails = await db.get(playerDetailsQuery);
  response.send({
    playerId: playerDetails.player_id,
    playerName: playerDetails.player_name,
  });
});

//API 3

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayerQuery = `UPDATE player_details
                                SET player_name = '${playerName}'
                                WHERE player_id = ${playerId};`;
  const updatePlayer = await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//API 4

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const matchDetailsQuery = `SELECT *
                                  FROM match_details
                                  WHERE match_id = ${matchId};`;
  const matchDetails = await db.get(matchDetailsQuery);
  response.send({
    matchId: matchDetails.match_id,
    match: matchDetails.match,
    year: matchDetails.year,
  });
});

//API 5

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const playerMatchDetailsQuery = `SELECT *
                                      FROM player_match_score Natural Join match_details
                                       
                                      WHERE player_id = ${playerId};`;

  const playerMatchDetails = await db.all(playerMatchDetailsQuery);
  response.send(playerMatchDetails.map((each) => convertMatchTable(each)));
});

//API 6

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayerListQuery = `SELECT player_id,player_name
                                FROM player_details Natural Join player_match_score
                                WHERE match_id = ${matchId};`;
  const getPlayerList = await db.all(getPlayerListQuery);
  response.send(getPlayerList.map((each) => convertPlayerTable(each)));
});

//API 7

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getStatisticsQuery = `SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};`;

  const getStatistics = await db.get(getStatisticsQuery);
  response.send(getStatistics);
});

module.exports = app;
