window.com.paratubes.initGame = function(w,canvasId,$) {
   CanvasRenderingContext2D.prototype.clear = function() {
    this.save();
    this.globalCompositeOperation = 'destination-out';
    // this.fillStyle = 'black';
    this.fill();
    this.restore();
   };
   //圆形擦除
   CanvasRenderingContext2D.prototype.clearArc = function(x, y, radius, startAngle, endAngle, anticlockwise) {
    this.beginPath();
    this.arc(x, y, radius, startAngle, endAngle, anticlockwise);
    this.clear();
   };

   var game = new Game('paratubes', canvasId),
       //画布
       playCanvas = document.getElementById(canvasId),
       playContext = playCanvas.getContext('2d'),
       drawCanvas = document.createElement('canvas'),
       //画图工具
       painters = [],
       //当前画笔
       curPainter,
       //样式
       style = {
       	  stroke : '#000',
       	  lineWidth : '1'
       },
       //鼠标是否按下 
       isMouseDown = false,
       //鼠标位置
       mousePos = {
          x : 0,
          y : 0
       };
   //离屏画布
   var drawContext = (function() {
      drawCanvas.width = playCanvas.width;
      drawCanvas.height = playCanvas.height;
      var ctx = drawCanvas.getContext('2d');
      ctx.strokeStyle = style.stroke;
      ctx.lineWidth = style.lineWidth;
      return ctx; 
   })();    
   playCanvas.style.cursor = 'crosshair';
   //绘图工具类接口  
   var Painter = new Interface('Painter',['mouseDown','mouseMove','mouseUp']);
   //各种画笔
   var pen = {
   	  name : 'pen',
   	  mouseDown : function(e) {
   	  	 isMouseDown = true;
   	  	 drawContext.save();
   	  	 drawContext.beginPath();
   	  	 var loc = windowToCanvas(playCanvas, e.clientX, e.clientY);
   	  	 drawContext.moveTo(loc.x,loc.y);
   	  },
   	  mouseMove : function(e) {
   	     if(isMouseDown){
           var loc = windowToCanvas(playCanvas, e.clientX, e.clientY);	 
           drawContext.lineTo(loc.x,loc.y);
           drawContext.stroke();
         }   
   	  },
   	  mouseUp : function(e) {
   	  	 isMouseDown = false;
   	  	 drawContext.restore();
   	  }
   };
   //橡皮擦 
   var eraser = {
      name : 'eraser',
      mouseDown : function(e) {
         var loc = windowToCanvas(playCanvas, e.clientX, e.clientY);
         mousePos.x = loc.x;
         mousePos.y = loc.y;
         isMouseDown = true;
      },
      mouseMove : function(e) {
         if(isMouseDown){
            var loc = windowToCanvas(playCanvas,e.clientX, e.clientY);
            eraseLast();
            drawEraser(loc);
            mousePos.x = loc.x;
            mousePos.y = loc.y;
         }
      },
      mouseUp : function(e) {
         eraseLast();
         isMouseDown = false;
      }
   };


   //擦除
   var eraseLast = function() {
      //设置擦除区
      drawContext.save();
      drawContext.clearArc(mousePos.x, mousePos.y,
                  10 + parseInt(style.lineWidth),
                  0, Math.PI*2, false);
      drawContext.restore();
   };

   //画橡皮擦
   var drawEraser = function(loc) {
     //画橡皮区
     drawContext.save();
     drawContext.beginPath();
     drawContext.arc(loc.x, loc.y,
                  10 + parseInt(style.lineWidth)-1,
                  0, Math.PI*2, false);
     drawContext.clip();
     //画橡皮
     drawContext.stroke();
     drawContext.restore();
   };

   //默认画笔
   curPainter = pen;
   painters.push(pen);
   painters.push(eraser);
   //检查所有画笔
   for(var i = 0;i < painters.length; i++){
       Interface.ensureImplements(painters[i],Painter); 
   }
 
   //获取画笔
   var getPainter = function(name) {
       for(var i = 0; i < painters.length; i++){
          if(painters[i].name == name){
             return painters[i];  
          }   
       }
       return null;
   };

   //坐标转换 
   var windowToCanvas = function(canvas, x, y) {
      var bbox = canvas.getBoundingClientRect();
      return { 
      	x: x - bbox.left * (canvas.width  / bbox.width),
        y: y - bbox.top  * (canvas.height / bbox.height)
      };
   }; 
   
  
   //更新当前画笔 
   var updatePainter = function(name) {
   	   curPainter = getPainter(name);
   };

   //事件
   game.addMouseListener({key:'lmd',listener:function(e) {
      curPainter.mouseDown(e);   
   }});
   
   game.addMouseListener({key:'lmm',listener:function(e) {
      curPainter.mouseMove(e);   
   }});

   game.addMouseListener({key:'lmu',listener:function(e) {
      curPainter.mouseUp(e); 
   }});

   //键盘事件
   game.addKeyListener({
     key : 'left arrow',
     listener : function() {
        run_rightActions[1].stop();   
        restartAnimation(run_left_Timer); 
        heroSprite.painter = run_leftPainter;
        heroSprite.behaviors = run_leftActions;
     }
   });

   game.addKeyListener({
     key : 'right arrow',
     listener : function() {
        run_leftActions[1].stop();
        restartAnimation(run_right_Timer); 
        heroSprite.painter = run_rightPainter;
        heroSprite.behaviors = run_rightActions;
     }
   });

   //更新画笔 
   $('.painter').click(function() {
      updatePainter($(this).attr('name'));
   });

   //画表格
   var drawGrid = function() {
      if($('#gridCheck').is(':checked')){
      	var stepx = 10;
      	var stepy = 10;
      	playContext.strokeStyle = 'lightgray';
        playContext.lineWidth = 0.5;

        for (var i = stepx + 0.5; i < playContext.canvas.width; i += stepx) {
          playContext.beginPath();
          playContext.moveTo(i, 0);
          playContext.lineTo(i, playContext.canvas.height);
          playContext.stroke();
        }

        for (var i = stepy + 0.5; i < playContext.canvas.height; i += stepy) {
          playContext.beginPath();
          playContext.moveTo(0, i);
          playContext.lineTo(playContext.canvas.width, i);
          playContext.stroke();
        }
      }
   };

  
   //清除画布
   var clearDrawScreen = function () {
      drawContext.clearRect(0, 0,
         drawContext.canvas.width, drawContext.canvas.height);
   };

   //注入函数
   game.startAnimate = function(time) {
   };

   game.paintUnderSprites = function(){
       drawGrid(); 
       //test
       playContext.drawImage(drawCanvas,0,0,drawCanvas.width,drawCanvas.height);
   };

   //精灵表 
   var spritesheet = {
       hero : {
          stand : {
            src : ctx + '/static/images/game/people/man/stand.png',
            image : new Image() 
          },
          run_left : {
            src : ctx + '/static/images/game/people/man/run_left.png',
            image : new Image() 
          },
          run_right : {
            src : ctx + '/static/images/game/people/man/run_right.png',
            image : new Image()
          }
       }
   };

   //右键定时器        
   var run_left_Timer = new AnimationTimer(225);
   //右键定时器        
   var run_right_Timer = new AnimationTimer(225);
   //stand painter
   var standPainter = new SpriteSheetPainter([
         { left: 0,   top: 0, width: 20, height: 50 },
         { left: 20,   top: 0, width: 20, height: 50 },
         { left: 40,   top: 0, width: 23, height: 50 },
         { left: 63,   top: 0, width: 20, height: 50 },
         { left: 83,   top: 0, width: 20, height: 50 }
         ],spritesheet.hero.stand.image);
   //run left painter
   var run_leftPainter = new SpriteSheetPainter([
         { left: 0,   top: 0, width: 30, height: 50 },
         { left: 30,   top: 0, width: 34, height: 50 },
         { left: 64,   top: 0, width: 41, height: 50 },
         { left: 105,   top: 0, width: 36, height: 50 },
         { left: 141,   top: 0, width: 33, height: 50 },
         { left: 174,   top: 0, width: 27, height: 50 },
         { left: 201,   top: 0, width: 20, height: 50 },
         { left: 221,   top: 0, width: 21, height: 50 },
         { left: 242,   top: 0, width: 25, height: 50 }
         ],spritesheet.hero.run_left.image); 
   //run right painter
   var run_rightPainter = new SpriteSheetPainter([
         { left: 0,   top: 0, width: 30, height: 50 },
         { left: 30,   top: 0, width: 34, height: 50 },
         { left: 64,   top: 0, width: 41, height: 50 },
         { left: 105,   top: 0, width: 36, height: 50 },
         { left: 141,   top: 0, width: 33, height: 50 },
         { left: 174,   top: 0, width: 27, height: 50 },
         { left: 201,   top: 0, width: 20, height: 50 },
         { left: 221,   top: 0, width: 21, height: 50 },
         { left: 242,   top: 0, width: 25, height: 50 }
         ],spritesheet.hero.run_right.image); 
   //stand actions
   var standActions = [
         {
           lastAdvance : 0,
           INTERVAL : 80,
           execute : function(sprite,context,now) {
              if(now - this.lastAdvance > this.INTERVAL){
                sprite.painter.advance();
                this.lastAdvance = now;
              }
           }
         }
         ];
   //run left actions
   var run_leftActions = [
         {
           lastAdvance : 0,
           INTERVAL : 80,
           execute : function(sprite,context,now) {
              if (run_left_Timer.isRunning()) {
                  if(now - this.lastAdvance > this.INTERVAL){
                    sprite.painter.advance();
                    this.lastAdvance = now;
                  }
                  if(run_left_Timer.isOver()){
                     run_left_Timer.stop();
                  }
              }
              else{
                  heroSprite.painter = standPainter;
                  heroSprite.behaviors = standActions;
              }
           }
         },{
            lastMove : 0,
            execute : function(sprite,context,now) {
               if (run_left_Timer.isRunning()) {
                  //定时器超时
                  if(run_left_Timer.isOver()){
                     this.stop();
                     return;
                  }
                  if(this.lastMove !== 0){
                    sprite.left -= (now - this.lastMove)/1000 * sprite.velocityX;
                  }
                  this.lastMove = now;
               }
               else{
                  heroSprite.painter = standPainter;
                  heroSprite.behaviors = standActions;
               }
            },
            stop : function(){
               run_left_Timer.stop();
               this.lastMove = 0;
            }
         }
         ];       
   //run right actions
   var run_rightActions = [
         {
           lastAdvance : 0,
           INTERVAL : 80,
           execute : function(sprite,context,now) {
              if (run_right_Timer.isRunning()) {
                  if(now - this.lastAdvance > this.INTERVAL){
                    sprite.painter.advance();
                    this.lastAdvance = now;
                  }
                  if(run_right_Timer.isOver()){
                     run_right_Timer.stop();
                  }
              }
              else{
                  heroSprite.painter = standPainter;
                  heroSprite.behaviors = standActions;
              }
           }
         },{
            lastMove : 0,
            execute : function(sprite,context,now) {
               if (run_right_Timer.isRunning()) {
                  if(run_right_Timer.isOver()){
                     this.stop();
                     return;
                  }
                  if(this.lastMove !== 0){
                    sprite.left += (now - this.lastMove)/1000 * sprite.velocityX;
                  }
                  this.lastMove = now;
               }
               else{
                  heroSprite.painter = standPainter;
                  heroSprite.behaviors = standActions;
               }
            },
            stop : function(){
               run_right_Timer.stop();
               this.lastMove = 0;
            } 
         }
         ];       
   //精灵 
   var hero = {
       top : 50,
       left : 550,
       velocityX : 200,
       spritesheet : new Image(),
       painter : {
         stand : standPainter, 
         run_right : run_rightPainter
       },
       actions : {
         stand : standActions,
         run_right : run_rightActions   
       }
   };

   //重启定时器 
   function restartAnimation(pushTimer) {
     if (pushTimer.isRunning()) {
        pushTimer.stop();
     }
     pushTimer.start();
   }
   
   //hero精灵
   var heroSprite = new Sprite('userAvatar',hero.painter.stand,hero.actions.stand);
   heroSprite.top = hero.top;
   heroSprite.left = hero.left;
   heroSprite.velocityX = hero.velocityX;
   game.addSprite(heroSprite);

   //加载图片
   (function loadImage() {
      var count = 0;
      for(var i in spritesheet){
          for(var j in spritesheet[i]){
             spritesheet[i][j].image.src = spritesheet[i][j].src;
             spritesheet[i][j].image.onload = function() {
                 count++;
                 if(count == 1){
                    game.start();
                 }
             }
          }
      }
   })();


   //调试
   var DEBUGGER = {
      tag : true,
      log : function(msg){
         if(this.tag){
            console.log(msg);
         } 
      },
      run : function(callback){
         if(this.tag){
            callback.call();
         }
      }
   };
};