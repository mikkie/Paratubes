window.com.paratubes.initGame = function(window,canvasId){
    cc.game.onStart = function(){
       //load resources
        cc.LoaderScene.preload([window.ctx + "/static/images/HelloWorld.png"], function () {
        var MyScene = cc.Scene.extend({
            onEnter:function () {
                this._super();
                var size = cc.director.getWinSize();
                var sprite = cc.Sprite.create(window.ctx + "/static/images/HelloWorld.png");
                sprite.setPosition(size.width / 2, size.height / 2);
                sprite.setScale(0.8);
                this.addChild(sprite, 0);

                var label = cc.LabelTTF.create("Hello Paratubes", "Arial", 40);
                label.setPosition(size.width / 2, size.height / 2);
                this.addChild(label, 1);
            }
        });
        cc.director.runScene(new MyScene());
        }, this);
    };
    cc.game.run(canvasId);
};