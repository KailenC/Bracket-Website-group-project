const bracketModel = require ("../backend/src/models/bracket.model");

const enterResultsIndividual = async (req, res) => {
    const {tournament, game, player1, player2, score1, score2} = req.body;
    //return a winner, bracket type does not matter
    //somehow check if user is auth?
    const match = await bracketModel.getMatch({ tournament, game, player1, player2 })
    const currWins1 = match.wins1 + (score1 > score2 ? 1 : 0);
    const currWins2 = match.wins2 + (score2 > score1 ? 1 : 0);

    const setWinner = currWins1 === 3 ? player1
                    : currWins2 === 3 ? player2
                    : null;
const updatedMatch = await bracketModel.updateMatch({
    tournament,
    game,
    player1,
    player2,
    wins1: currWins1,
    wins2: currWins2,
    setWinner,
    complete: setWinner !== null
});

res.json(updatedMatch); //Somehow will check if setWiner is complete to advance to the next step
};
//entrantReportingHere
//create some function that deals with non-exact ammounts of entrants
//also handle cap-entrants needs to be addressed -> 17 entrants could either be a round of 32 with 1 match or some other workaround

const enterResultsSeries = async (req, res) => {
    const {tournament, game, player1, player2, finalScore1, finalScore2} = req.body;
    const winner = finalScore1 > finalScore2 ? player1: player2;
    const updatedMatch = await bracketModel.updateMatch({
    tournament,
    game,
    player1,
    player2,
    wins1: finalScore1,
    wins2: finalScore2,
    winner,
    complete: true
});
    res.json({tournament, game, player1, player2})

}

//needs to be fixed with how our actual matches db is configured