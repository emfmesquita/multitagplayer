if(typeof hpt == 'undefined') hpt = {};
(function() {
	hpt.view = {
		C : {
			NAVBAR_HEIGHT : 51,
			CONTAINER_PADDING : 10,
			PORTRAIT_MARGIN : 5,
			PORTRAIT_BORDER_SIZE : 8,
			PORTRAIT_RATIO : 0.3,
			HP_BORDER_SIZE : 8,
			MIN_FONT_SIZE : 10,
			NLD_FONT_SIZE : 20
		},
		init : function(){
			hpt.view._fullResize();
			hpt.view.update(1,"Xablau Torah'Ceza", "http://i.imgur.com/ni9nzBx.png", "#00AA00",20,40,10,5,15);
			hpt.view.update(2,"Eldin Faron", "http://i.imgur.com/JZiReKj.png", "#FF0000",35,40,0,0,0);
			hpt.view.update(3,"Celeborn", "http://i.imgur.com/5ZT71fW.jpg", "#598EFF",5,50,0,0,0);
			$(window).resize(function(){
				hpt.view._fullResize();
			});
		},
		addPlayer : function(){

		},
		update : function(charNumber, name, imageURL, color, currentHP, maxHP, tempHP, lostMaxHP, nonLethalDamage){
			var portrait = $(".player-column:nth-child(" + charNumber + ") .portrait");
			portrait.attr("title", name).css("border-color", color);
			portrait.find(".portrait-text span").css("color", color).text(name);
			portrait.css("background-image", "url('" + imageURL + "')");
			hpt.view._updateHP(charNumber, currentHP, maxHP, tempHP, lostMaxHP, nonLethalDamage);
		},
		_updateHP : function(charNumber, currentHP, maxHP, tempHP, lostMaxHP, nonLethalDamage){
			var td = $(".player-column:nth-child(" + charNumber + ")");
			hp = hpt.view._preProcessHP(currentHP, maxHP, tempHP, lostMaxHP, nonLethalDamage);

			var text = "-" + hp.lostMaxHP + "\u2620";
			var title = hp.lostMaxHP + " Max HP lost"
			td.find(".max-hp-lost").text(text).attr("title", title);

			if(hp.currentHP < 0){
				text = hp.currentHP + "/" + hp.maxHP + "\u271D";
				title = hp.currentHP + " from " + hp.maxHP + " HP";
				td.find(".current-hp").text(text).attr("title", title).css("background-color", "white");
			}
			else {
				text = hp.lostHP + "/" + hp.maxHP + "\u2661";
				title = hp.lostHP + " from " + hp.maxHP + " HP lost";
				td.find(".hp-lost").text(text).attr("title", title);

				text = hp.tempHP + "\u231a";
				title = hp.tempHP + " temporary HP";
				td.find(".temp-hp").text(text).attr("title", title);

				text = hp.currentHP + "/" + hp.maxHP + "\u2665";
				title = hp.currentHP + " from " + hp.maxHP + " HP";
				td.find(".current-hp").text(text).attr("title", title).css("background-color", hpt.view._hpColor(hp.currentHP, hp.maxHP));

				title = hp.nonLethalDamage + " non Lethal Damage";
				td.find(".non-lethal-damage-text").text(hp.nonLethalDamage);
				td.find(".non-lethal-damage-column").attr("title", title);
			}

			hpt.view._resize(charNumber, currentHP, maxHP, tempHP, lostMaxHP, nonLethalDamage);
		},
		_innerChangeHP : function(td, locator, innerText, title){
			td.find(locator).text(innerText).attr("title", title);
		},
		_fullResize : function(){
			var C = hpt.view.C;

			// width
			var totalWidth = window.innerWidth;
			var playerWidth = Math.round(totalWidth / hpt.view._numberOfPlayers) - C.CONTAINER_PADDING;
			$(".player-column").css("width", playerWidth + "px");

			// height
			var totalHeight = window.innerHeight - C.NAVBAR_HEIGHT - C.CONTAINER_PADDING - C.PORTRAIT_MARGIN;
			var portraitHeight = Math.round(totalHeight * C.PORTRAIT_RATIO);
			var hpHeight = totalHeight - portraitHeight;
			$(".portrait").css("height", portraitHeight + "px");

			var portraitTextHeightTotal = portraitHeight - C.PORTRAIT_BORDER_SIZE;;
			var portraitTextHeight = Math.round(portraitTextHeightTotal * 0.3);
			var portraitTextHeightBlank = portraitTextHeightTotal - portraitTextHeight;
			$(".portrait-text").css("line-height", portraitTextHeight + "px");
			$(".portrait-text-blank").css("height", portraitTextHeightBlank + "px");
			$(".portrait-text").textfill({explicitWidth : playerWidth , explicitHeight : portraitTextHeight, maxFontPixels : 30});
			$(".full-hp-bar").css("height", hpHeight + "px");

			$.each(hpt.view._players, function(index, player){
				hpt.view._resize(index+1, player.currentHP, player.maxHP, player.tempHP, player.lostMaxHP, player.nonLethalDamage);
			});
		},
		_resize : function(charNumber, currentHP, maxHP, tempHP, lostMaxHP, nonLethalDamage){
			hpt.view._resizeWidth(charNumber, currentHP, maxHP, tempHP, lostMaxHP, nonLethalDamage);
			hpt.view._resizeHeight(charNumber, currentHP, maxHP, tempHP, lostMaxHP, nonLethalDamage);
		},
		_resizeWidth : function(charNumber, currentHP, maxHP, tempHP, lostMaxHP, nonLethalDamage){
			var td = $(".player-column:nth-child(" + charNumber + ")");
			var hp = hpt.view._preProcessHP(currentHP, maxHP, tempHP, lostMaxHP, nonLethalDamage);

			var playerWidth = td[0].offsetWidth;
			var currentHPWidth = playerWidth;
			var nldWidth = 0;
			if(hp.nonLethalDamage > 0){
				currentHPWidth = Math.round(playerWidth * 0.8);
				nldWidth = playerWidth - currentHPWidth;
				td.find(".non-lethal-damage").css("width", nldWidth + "px");
				td.find(".non-lethal-damage-text").css("width", nldWidth + "px");
				td.find(".non-lethal-damage-label").css("width", nldWidth + "px");
				td.find(".non-lethal-damage-column").show();
			}
			else{
				td.find(".non-lethal-damage-column").hide();
			}
			td.find(".current-hp-column").css("width", currentHPWidth + "px");
		},
		_resizeHeight : function(charNumber, currentHP, maxHP, tempHP, lostMaxHP, nonLethalDamage){
			var totalMaxHP = maxHP + tempHP;
			if(totalMaxHP == 0){
				totalMaxHP = 1;
			}
			var td = $(".player-column:nth-child(" + charNumber + ")");

			var totalHeight = td.find(".full-hp-bar")[ 0 ].offsetHeight;
			var hp = hpt.view._preProcessHP(currentHP, maxHP, tempHP, lostMaxHP, nonLethalDamage);

			// max hp perdido
			var lmhpHeight = hpt.view._getHeight(hp.lostMaxHP, totalMaxHP, totalHeight);
			hpt.view._innerResize(td.find(".max-hp-lost"), lmhpHeight);

			// hp maximo descontanto o hp max perdido
			var hpHeight = totalHeight - lmhpHeight;
			hpt.view._innerResize(td.find(".hp-bar"), hpHeight);

			// desconta a borda
			hpHeight = hpHeight - hpt.view.C.HP_BORDER_SIZE;

			if(hp.currentHP < 0){
				hpt.view._innerResize(td.find(".current-hp"), hpHeight);
				td.find(".temp-hp").hide();
				td.find(".hp-lost").hide();
			}
			else{
				var localHPMax = totalMaxHP - hp.lostMaxHP;

				// hp
				var chpHeight = hpt.view._getHeight(hp.currentHP, localHPMax, hpHeight);
				hpt.view._innerResize(td.find(".current-hp"), chpHeight);

				// hp temporario
				var thpHeight = hpt.view._getHeight(tempHP, localHPMax, hpHeight);
				hpt.view._innerResize(td.find(".temp-hp"), thpHeight);

				// hp perdido
				var lhpHeight = hpHeight - chpHeight - thpHeight;
				hpt.view._innerResize(td.find(".hp-lost"), lhpHeight);
			}

			// hp temporario
			if(hp.nonLethalDamage > 0){
				var nldHeight = hpt.view._getHeight(hp.nonLethalDamage, localHPMax, hpHeight);
				var nldBlankHeight = hpHeight - nldHeight;
				td.find(".non-lethal-damage").css("height", nldHeight + "px");
				td.find(".non-lethal-damage-blank").css("height", nldBlankHeight + "px");
				td.find(".non-lethal-damage-text").css("line-height", hpHeight + "px");
			}
		},
		_innerResize : function(element, height){
			var heightPx = height + "px";
			var fontHeight = hpt.view._getFontSize(height) + "px";
			element.css("height", heightPx).css("line-height", heightPx).css("font-size", fontHeight).show();
		},
		_getHeight : function(value, max, totalHeight){
			return Math.round((value / max) * totalHeight);
		},
		_getFontSize : function(height){
			if(height > 30){
				return 30;
			}
			if(height < 8){
				return 0;
			}
			return height;
		},
		_preProcessHP : function(currentHP, maxHP, tempHP, lostMaxHP, nonLethalDamage){
			var hp = {};

			// max hp perdido - nao pode ser maior do que o max hp
			hp.lostMaxHP = lostMaxHP;
			if(lostMaxHP > maxHP){
				hp.lostMaxHP = maxHP;
			}

			// hp maximo descontanto o hp max perdido
			hp.maxHP = maxHP - hp.lostMaxHP;

			// hp - nao pode ser maior que max hp
			hp.currentHP = currentHP;
			if(currentHP > hp.maxHP){
				hp.currentHP = hp.maxHP;
			}

			hp.lostHP = hp.maxHP - hp.currentHP;
			hp.tempHP = tempHP;

			// dano nao letal nao pode ser maior que hp max mais hp temporario
			hp.nonLethalDamage = nonLethalDamage;
			if(nonLethalDamage > hp.maxHP + hp.tempHP){
				hp.nonLethalDamage = hp.maxHP + hp.tempHP;
			}

			return hp;
		},
		_hpColor : function(currentHP, maxHP){
			var ratio = 1;
			if(maxHP > 0){
				ratio = currentHP / maxHP;
			}

			var r = Math.round(255 - (95 * ratio));
			var g = Math.round(255 * ratio);
			var b = Math.round(160 * ratio);
			return "rgb(" + r + "," + g + "," + b + ")";
		},
		_players : [
			{
				currentHP : 20,
				maxHP : 40,
				tempHP : 10,
				lostMaxHP : 5,
				nonLethalDamage : 15
			},
			{
				currentHP : 35,
				maxHP : 40,
				tempHP : 0,
				lostMaxHP : 0,
				nonLethalDamage : 0
			},
			{
				currentHP : 5,
				maxHP : 50,
				tempHP : 0,
				lostMaxHP : 0,
				nonLethalDamage : 0
			}
		],
		_numberOfPlayers : 4
	}
} ());