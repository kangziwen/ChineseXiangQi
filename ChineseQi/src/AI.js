
var g_score=[100,45,45,20,1500,10,10];
var AI=cc.Class.extend({

}) ;
// 计算分数
AI.getScore=function (game) {
    var blackScore = 0;
    var redScore = 0;

    for (var i = 16; i < 32; ++i)
    {

        if (!game._s[i]._dead)
            blackScore += g_score[game._s[i]._type-1];

    }

    for (var i = 0; i < 16; ++i)
    {

        if (!game._s[i]._dead)
            redScore += g_score[game._s[i]._type-1];
    }
    return blackScore - redScore;
};
AI.getAllPossibleMove=function (game) {
    var ret=[];
    for (var i = 16; i < 32; ++i)
    {
        if (!game._s[i]._dead)
        {
            for (var row = 0; row <= 9; ++row)
            for (var col = 0; col <= 8; ++col)
            {
                var killid = game.getStoneFromRowCol(row, col);
                if (game.canMove(i, row, col, killid))
                {
                    var step = new Step();
                    step.moveid = i;
                    step.killid = killid;
                    step.rowFrom = game._s[i]._row;
                    step.colFrom = game._s[i]._col;
                    step.rowTo = row;
                    step.colTo = col;
                   // ret.push_back(step);
                    ret.push(step)
                }
            }
        }
    }
    return ret;
}
//尝试移动
AI.fakeMove=function (game,step) {
    var moveStone = game._s[step.moveid];
    moveStone._row = step.rowTo;
    moveStone._col = step.colTo;

    if (step.killid != -1)
    {
        var killStone = game._s[step.killid];
        killStone._dead = true;
    }
}
//复位
AI.unfakeMove=function (game,step) {
    var moveStone = game._s[step.moveid];
    moveStone._row = step.rowFrom;
    moveStone._col = step.colFrom;

    if (step.killid != -1)
    {
        var killStone = game._s[step.killid];
        killStone._dead = false;
    }
}
AI.getStep=function (game) {

    var highScore = -3000;
    var ret ;

    // 产生所有可能的移动，遍历
    var allMove = AI.getAllPossibleMove(game);
    cc.log(" getStep "+allMove.length);

    for (var it=0; it <allMove.length; ++it)
    {
        var step = allMove[it];
        AI.fakeMove(game, step);
        var score = AI.getScore(game);
        AI.unfakeMove(game, step);
        cc.log("score "+score+" highScore "+highScore)
        if (score > highScore)
        {
            highScore = score;
            ret = step;
        }
    }

    // for (it = allMove.begin(); it != allMove.end(); ++it)
    // {
    //     var step = *it;
    //     if (step != ret) delete step;
    // }

    return ret;
}