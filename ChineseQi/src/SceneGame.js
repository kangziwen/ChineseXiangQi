
function Step() {
  //var obj=this;
    this.moveid=0;
    this.killid=0;
    this.rowFrom=0;
    this.colFrom=0;
    this.rowTo=0;
    this.colTo=0;
}
/*
* //用原型方式定义对象的方法
Step.prototype.say=function(){
    alert("我是xxx");
}
* */

var SceneGame=cc.Layer.extend({
      //所有棋子的集合
       _s:[],

    //记录已经选择的棋子的ID,如果是-1表示之前没有象棋被选中,如果不是-1那么表示具体ID
    _selectid : -1,
    // 标记目前该谁走
     _bRedTurn :true,
    // 选中标记精灵
    _selectSprite : null,
    // 记录走棋轨迹用来悔棋
    _steps:[],
    ctor:function () {
        this._super();

        this.CreatePlate();

        //创建棋子
        Stone._d = cc.winSize.height/10;
        Stone._offx = Stone._d;
        Stone._offy = Stone._d/2;
        cc.log("Stone._d : "+Stone._d);
        for (var i = 0; i < 32; i++)
        {
            this._s[i] = new Stone();
            cc.log("test this._s[i] : "+this._s[i]);

             this._s[i].initStone(i);
             this.addChild(this._s[i]);
        }
        this.addCtrlPanel();
        //添加点击事件
     if('touches' in  cc.sys.capabilities){
         cc.eventManager.addListener({
            event:cc. EventListener.TOUCH_ONE_BY_ONE,
             swallowTouches:true,
             onTouchBegan:this.TouchBegan,
             onTouchEnded:this.ToucheEnded.bind(this)

         },this);
     }else {
         cc.log("不支持点击事件");
     }
     //创建选中框精灵
        this._selectid=-1;
        this._selectSprite=new cc.Sprite(res.selected_png);
        this._selectSprite.setVisible(false);
         this.addChild(this._selectSprite);
        this._selectSprite.setScale(0.6);
        return true;
    },
    //创建棋盘
    CreatePlate : function () {
        var size = cc.winSize;
        var plate=new cc.Sprite(res.background_png);
        this.addChild(plate);
        plate.setPosition(cc.p(0,0));
        plate.setAnchorPoint(cc.p(0,0));
        plate.setScale(size.height/plate.getContentSize().height);
    },
    //添加控制按钮
    addCtrlPanel:function () {
        var menu=new cc.Menu();
        this.addChild(menu);
        var menuImage=new cc.MenuItemImage(res.regret_jpg,res.regret_jpg, this.Regret.bind(this));
        menu.addChild(menuImage);
        cc.log("win-width : "+cc.winSize.width+" height : "+cc.winSize.height);
        // menuImage.attr({
        //    x:cc.winSize.height-menuImage.getContentSize(),
        //     y:cc.winSize.width/2.0
        // });
        this.moveNode(menuImage,cc.p(240,0));
        cc.log("menuImage x : "+menuImage.x+" y : "+menuImage.y
            +" width : "+menuImage.getContentSize().width+" height :" +menuImage.getContentSize().height);
        cc.log("menux x: "+menu.x+" y : "+menu.y
            +" width : "+menu.getContentSize().width+" height :" +menu.getContentSize().height);
    },
    //悔棋的回调函数
    Regret:function (node) {
     cc.log("Regret被点击了...");
        // 游戏还没有开始不能悔棋
        cc.log("this._steps "+this._steps);

        if(this._steps.length==0)return;
        // 恢复最后一步
       var step=this._steps.pop();


        // 具体恢复工作
        var s = this._s[step.moveid];
        s._row = step.rowFrom;
        s._col = step.colFrom;
        s.setPosition(s.fromPlate());

        var kill;
        if (step.killid != -1)
        {
            kill =  this._s[step.killid];
            kill._dead = false;
            kill.setVisible(true);
        }

        this._bRedTurn = ! this._bRedTurn;

        // 避免在选中棋子的情况下，悔棋
        this._selectid = -1;
        this._selectSprite.setVisible(false);

    },
    //node相对移动的坐标
    moveNode:function (node,pt) {
         // if(node instanceof  cc.Node)
        node.setPosition(node.getPosition().x+pt.x,node.getPosition().y+pt.y);
    },
    //判断是不是队友
    isSameColor:function (id1,id2) {
        return this._s[id1]._red==this._s[id2]._red;
    },
    // 开始触摸
    TouchBegan:function (touch,event) {
      cc.log("TouchBegan-----");
        return true;
    },
    ToucheEnded:function (touch,event) {

        cc.log("ToucheEnded-----"+touch +event+this);
        if(this._selectid==-1){
            //还没有选中
            this.selectStone(touch);
        }else {
           //已选中了
            this.MoveStone(touch);
        }


    },

    selectStone:function (touch) {
        // 1。通过touch获得点击位置
        // 2。通过位置获得row，col：把屏幕坐标转换成棋盘坐标
        // 3。通过棋盘坐标获得棋子id
        // 4。记录选中的棋子的ID
        var ptClicked=touch.getLocation();
        var changRowcol={row:0,col:0};
        var bClick=this.Screen2Plate(ptClicked,changRowcol);
        // 如果点击在棋盘外，该次点击无效
            if(!bClick){
                return;
            }
            var clickid=this.getStoneFromRowCol(changRowcol.row,changRowcol.col);
        // 如果点击位置没有象棋，那么点击也无效
        if (clickid == -1)
        {
            return;
        }
        // 如果被点中的棋子，和_bRedTurn颜色不一致，不让选中
        if (this._s[clickid]._red != this._bRedTurn)
            return;
        // 记录这次的点击
            this._selectid = clickid;
cc.log("changRowcol : "+changRowcol.row+ " col : "+changRowcol.col);
        // 显示该棋子被选中的效果
        var point= this.Plate2Screen(changRowcol.row, changRowcol.col);
        cc.log("point : "+point.x+ " y : "+point.y);

        this._selectSprite.setPosition(point);
        this._selectSprite.setVisible(true);

    },
    MoveStone:function (touch) {
        var ptClicked=touch.getLocation();
        var changRowcol={row:0,col:0};
        var bClick=this.Screen2Plate(ptClicked,changRowcol);
        // 如果点击在棋盘外，该次点击无效
        if(!bClick){
            return;
        }
        // 检查目标位置是否有棋子，如果有，那么杀掉
        var clickid=this.getStoneFromRowCol(changRowcol.row,changRowcol.col);
        // 如果点击位置没有象棋，那么点击也无效
            if(clickid!=-1){
                // 如果后一次点击的棋子和前一次相同，那么换选择
                    if(this.isSameColor(clickid,this._selectid)){
                        this._selectid=clickid;
                        // 显示该棋子被选中的效果
                        var pt = this.Plate2Screen(changRowcol.row, changRowcol.col);
                        this._selectSprite.setPosition(pt);
                        this._selectSprite.setVisible(true);
                        // 换选择之后，这次点击处理就结束了
                        return;
                    }
            }
        // 判断棋子是否可以移动
            if(!this.canMove(this._selectid,changRowcol.row,changRowcol.col,clickid)){
                return;
            }
        // 可以移动
        // 记录移动信息
        this.recordStep(this._selectid, clickid,
            this._s[this._selectid]._row, this._s[this._selectid]._col, changRowcol.row, changRowcol.col);
        // 走棋相关
        if (clickid != -1)
        {
            // 杀掉
            this._s[clickid].setVisible(false);
            this._s[clickid]._dead = true;
        }

        this._s[this._selectid]._row = changRowcol.row;
        this._s[this._selectid]._col = changRowcol.col;

        this._s[this._selectid].setPosition(this.Plate2Screen(changRowcol.row, changRowcol.col));

        this._selectid = -1;
        this._selectSprite.setVisible(false);
        this._bRedTurn = !this._bRedTurn;
        // 人工智能

        if (!this._bRedTurn)
        {
            // 电脑产生一个step对象
            var step = AI.getStep(this);

            cc.log("MoveStone step"+step);
            var moveStone = this._s[step.moveid];
            moveStone._row = step.rowTo;
            moveStone._col = step.colTo;
            this._bRedTurn = !this._bRedTurn;
            moveStone.setPosition(moveStone.fromPlate());

            if (step.killid != -1)
            {
                var killStone = this._s[step.killid];
                killStone._dead = true;
                killStone.setVisible(false);
            }

            //_steps.push_back(step);
            this._steps.push(step)
        }




    },
    //记录走过的步数，悔棋时用
    recordStep:function (moveid,  killid,  rowFrom,  colFrom,  rowTo,  colTo) {
        var s = new Step();
        s.colFrom = colFrom;
        s.colTo = colTo;
        s.killid = killid;
        s.moveid = moveid;
        s.rowFrom = rowFrom;
        s.rowTo = rowTo;
        this._steps.push(s);
        //
    },
    //判断能否移动
    canMove:function (moveid,row,col,killid) {
     var s=this._s[moveid];
     switch (s._type){
         case TYPE.CHE:
             return this.canMoveChe(moveid, row, col);

         case TYPE.MA:
             return this.canMoveMa(moveid, row, col);

         case TYPE.PAO:
             return this.canMovePao(moveid, row, col, killid);

         case TYPE.BING:
             return this.canMoveBing(moveid, row, col);

         case TYPE.JIANG:
             return this.canMoveJiang(moveid, row, col, killid);

         case TYPE.SHI:
             return this.canMoveShi(moveid, row, col);

         case TYPE.XIANG:
             break;
     }
        return false;

    },
    canMoveChe:function(moveid, row, col){
        // 一条线,中间不能有棋子
        var s=this._s[moveid];
        return this.getStoneCount(s._row, s._col, row, col) == 0;
    },
    getStoneCount:function ( row1,  col1,  row2,  col2) {
        var ret = 0;
        if (row1 != row2 && col1 != col2) return -1;
        if (row1 == row2 && col1 == col2) return -1;
        // row1 == row2 或者col1 == col2
        if (row1 == row2)
        {
            var min, max;
            min = col1 < col2 ? col1 : col2;
            max = col1 > col2 ? col1 : col2;
            for (var col = min + 1; col < max; ++col)
            {
                var id = this.getStoneFromRowCol(row1, col);
                if (id != -1) ++ret;
            }
        }
        else
        {
            var min, max;
            min = row1 < row2 ? row1 : row2;
            max = row1 > row2 ? row1 : row2;
            for (var row = min + 1; row < max; ++row)
            {
                var id = this.getStoneFromRowCol(row, col1);
                if (id != -1) ++ret;
            }
        }
        return ret;
    },
    canMoveMa:function (moveid, row, col){
        var s = this._s[moveid];
        var dRow = Math.abs(s._row - row);
        var dCol = Math.abs(s._col - col);
        var d = dRow * 10 + dCol;

        // 马走日条件
        if (d == 12 || d == 21)
        {
            // 蹩脚位置
            var cRow, cCol;
            if (d == 12)
            {
                cCol = (col + s._col) / 2;
                cRow = s._row;
            }
            else
            {
                cCol = s._col;
                cRow = (s._row + row)/2;
            }

            // 没有蹩脚的棋子
            if (this.getStoneFromRowCol(cRow, cCol) == -1)
                return true;
        }

        return false;


    },
    canMovePao:function(moveid, row, col, killid){
        var s = this._s[moveid];
        if (killid == -1)
            return this.getStoneCount(s._row, s._col, row, col) == 0;

        return this.getStoneCount(s._row, s._col, row, col) == 1;
    },
    canMoveBing:function (moveid, row, col){
        var s = this._s[moveid];
        var dRow = Math.abs(s._row - row);
        var dCol = Math.abs(s._col - col);
        var d = dRow * 10 + dCol;

        // 走太远不行,只能走一格
        if (d != 1 && d != 10)
            return false;
        if (s._red)
        {
            // 不能后退
            if (row < s._row) return false;

            // 过河前不能平移
            if (s._row <= 4 && s._row == row) return false;
        }
        else
        {
            if (row > s._row) return false;
            if (s._row >= 5 && s._row == row) return false;
        }

        return true;

    },
    canMoveJiang:function (moveid, row, col, killid){
        var s = this._s[moveid];

        // 将照面
        if (killid != -1)
        {
            var kill = this._s[killid];
            if (kill._type == Stone.JIANG)
            {
                return this.canMoveChe(moveid, row, col);
            }
        }

        var dRow = Math.abs(s._row - row);
        var dCol = Math.abs(s._col - col);
        var d = dRow * 10 + dCol;
        // 走太远不行,只能走一格
        if (d != 1 && d != 10)
            return false;

        // 不能出九宫
        if (col < 3 || col > 5) return false;
        if (s._red)
        {
            if (row < 0 || row > 2) return false;
        }
        else
        {
            if (row < 7 || row > 9) return false;
        }

        return true;
    },
    canMoveShi:function(moveid, row, col){
        var s = this._s[moveid];
        var dRow = Math.abs(s._row - row);
        var dCol = Math.abs(s._col - col);
        var d = dRow * 10 + dCol;
        if (d != 11) return false;

        // 不能出九宫
        if (col < 3 || col > 5) return false;
        if (s._red)
        {
            if (row < 0 || row > 2) return false;
        }
        else
        {
            if (row < 7 || row > 9) return false;
        }

        return true;
    },
    //
    Screen2Plate:function (ptSceen,changRowcol) {
        // 遍历所有象棋坐标点，计算棋盘格子中心坐标点到点击的店的距离，如果小于半径，那么就对了
        var distance=Stone._d*Stone._d/4.0;
        for(changRowcol.row==0;changRowcol.row<=9;++changRowcol.row){
            for(changRowcol.col=0;changRowcol.col<=8;++changRowcol.col){
              var ptCenter=this.Plate2Screen(changRowcol.row,changRowcol.col);

              if(cc.pDistanceSQ(ptCenter,ptSceen)<distance){
                  return true;
              }

            }
        }
        return false;
    },
    //根据横纵号，返回坐标
    Plate2Screen:function (row,col) {
        var x = col * Stone._d + Stone._offx;
        var y = row * Stone._d + Stone._offy;
        return cc.p(x, y);
    },
    //根据坐标返回棋子号
    getStoneFromRowCol:function (row,col) {
        for (var i = 0; i < 32; ++i)
        {
            if (this._s[i]._row == row && this._s[i]._col == col && !this._s[i]._dead)
                return i;
        }
        return -1;
    }

});
//创建场景
var SceneGameScene=cc.Scene.extend({
    onEnter:function () {
       this._super();
       var layer=new SceneGame();
       this.addChild(layer)

    }

});
