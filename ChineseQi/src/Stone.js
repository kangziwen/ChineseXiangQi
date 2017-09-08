//定义枚举类型
var TYPE={
    CHE:1,
    MA:2,
    PAO:3,
    BING:4,
    JIANG:5,
    SHI:6,
    XIANG:7
};
var Stone=cc.Sprite.extend({
     _id : null,
     _red : null,
     _row : null,
     _col : null,
     _type: null,
     _dead :null,

   ctor:function () {
     //不调用super 会出现 Sprite中的方法不存在的问题
    this._super();
    this._dead=false;

    return true;
   },
    //初始化棋子
    initStone:function ( id) {
    //  var myStruct={type:null,row:null,col:null};
      var  proper=[{ type : TYPE.CHE, row:0, col:0 },
          {  type : TYPE.MA, row:0, col:1 },
          {  type : TYPE.XIANG, row:0, col:2 },
          { type :  TYPE.SHI, row:0, col:3 },
          {  type : TYPE.BING, row:3, col:2 },
          {  type : TYPE.BING, row:3, col:0 },
          {  type : TYPE.PAO, row:2, col:1 },
          {  type : TYPE.JIANG, row:0, col:4 },
          {  type : TYPE.BING, row:3,col: 4 } ];

      this._id=id;
      this._red = id < 16;

        if (id <= 8)
        {
            this._row = proper[id].row;
            this._col = proper[id].col;
            this._type = proper[id].type;
        }
        if (id > 8 && id < 16)
        {
            var index = id - 9;

            this._row = proper[index].row;
            this._col = 8 - proper[index].col;
            this._type = proper[index].type;
        }
        if (id >= 16)
        {
            var index = id - 16;
            if (index <= 8)
            {
                this._row = 9 - proper[index].row;
                this._col = 8 - proper[index].col;
                this._type = proper[index].type;
            }
            if (index > 8)
            {
                index -= 9;

                this._row = 9 - proper[index].row;
                this._col = proper[index].col;
                this._type = proper[index].type;
            }
        }
        //设置象棋的图片
        var texture;
         switch (this._type){
           case TYPE.CHE:
                  if(this._red){
                      texture=cc.textureCache.addImage(res.rche_png);
                  }else {
                      texture=cc.textureCache.addImage(res.bche_png);
                  }
               break;
             case TYPE.MA:
                 if(this._red){
                     texture=cc.textureCache.addImage(res.rma_png);
                 }else {
                     texture=cc.textureCache.addImage(res.bma_png);
                 }
                 break;
             case TYPE.PAO:
                 if(this._red){
                     texture=cc.textureCache.addImage(res.rpao_png);
                 }else {
                     texture=cc.textureCache.addImage(res.bpao_png);
                 }
                 break;
             case TYPE.BING:
                 if(this._red){
                     texture=cc.textureCache.addImage(res.rbing_png);
                 }else {
                     texture=cc.textureCache.addImage(res.bzu_png);
                 }
                 break;
             case TYPE.JIANG:
                 if(this._red){
                     texture=cc.textureCache.addImage(res.rshuai_png);
                 }else {
                     texture=cc.textureCache.addImage(res.bjiang_png);
                 }
                 break;
             case TYPE.SHI:
                 if(this._red){
                     texture=cc.textureCache.addImage(res.rshi_png);
                 }else {
                     texture=cc.textureCache.addImage(res.bshi_png);
                 }
                 break;
             case TYPE.XIANG:
                 if(this._red){
                     texture=cc.textureCache.addImage(res.rxiang_png);
                 }else {
                     texture=cc.textureCache.addImage(res.bxiang_png);
                 }
                 break;
             default :
              break;
         }
        this.setTexture(texture);
        this.setTextureRect(new cc.Rect(0, 0, texture.getContentSize().width, texture.getContentSize().height));
        //
        this.setPosition(this.fromPlate());
        //
        this.setScale(.6);



    },
    fromPlate:function () {
        var x = this._col * Stone._d + Stone._offx;
        var y = this._row * Stone._d + Stone._offy;
        return cc.p(x, y);
    }
});

//静态变量
Stone._d = 0;
Stone._offx= 0;
Stone._offy = 0;