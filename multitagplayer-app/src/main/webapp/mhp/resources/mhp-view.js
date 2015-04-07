if(typeof mhp == 'undefined') mhp = {};
(function() {
	mhp.view = {
		C : {
			NO_NAME : "Unknown",
			CURRENT_HP_ATTR : "currentHP",
			MAX_HP_ATTR : "maxHP",
		},
		init : function(){
			$('.add-monster-form').validator().on('submit', mhp.view._addMonsterSubmit);
		},
		// chamado ao clicar no botao de remover monstro
		// remove o painel de monstro
		removeMonster : function(removeButton){
			var column = $(removeButton).closest(".monster-hp-column");
			column.fadeOut("slow", function(){ column.remove(); });
		},
		// chamado ao clicar no botao de remover todos
		removeAll : function(removeButton){
			var columns = $(".monster-row .monster-hp-column");
			columns.fadeOut("slow", function(){ columns.remove(); });
		},
		// chamado no submit de adicionar monstro
		_addMonsterSubmit : function(submitEvent){
			if(submitEvent.isDefaultPrevented()) return;
			var hpExp = $(submitEvent.target).find(".max-hp-input").val();
			var name = $(submitEvent.target).find(".name-input").val();			
			var maxHP = mhp.view._calcHP(hpExp);
			if(maxHP < 1) maxHP = 1;
			mhp.view._addMonster(name, maxHP);
		},
		// metodo para adicionar um monstro novo
		_addMonster : function(name, maxHP){
			if(maxHP < 1) maxHP = 1;
			var row = $(".monster-row");
			var monsterColumnClone = $(".hidden-content .monster-hp-column").first().clone();
			monsterColumnClone.find('.remove-hp-form').validator().on('submit', mhp.view._removeHPSubmit);
			monsterColumnClone.find('.add-hp-form').validator().on('submit', mhp.view._addHPSubmit);

			mhp.view._setHPValue(monsterColumnClone[0], maxHP, maxHP);

			var realName = name;
			if(realName) realName = realName.trim();
			if(!realName) realName = mhp.view.C.NO_NAME;
			var number = 1;
			var added = false;

			var lowerName = realName.toLowerCase();
			$(".monster-row .monster-hp-column").each(function(index, column){
				var testName = $(column).find(".monster-name-title").text().toLowerCase();
				if(lowerName == testName){
					var testNumber = mhp.view._getNumber(column);
					number = testNumber + 1;
				}
				if(lowerName < testName){
					added = true;
					$(column).before(monsterColumnClone);
					return false;
				}
			});
			
			if(!added) $(".monster-row").append(monsterColumnClone);
			mhp.view._setName(monsterColumnClone[0], realName, number);
			monsterColumnClone.fadeIn("slow");
		},
		// chamado no submit de reducao de hp
		_removeHPSubmit : function(submitEvent){
			mhp.view._innerHPSubmit(".dmg-input", mhp.view._damage, submitEvent);
		},
		// chamado no submit de adicionar hp
		_addHPSubmit : function(submitEvent){
			mhp.view._innerHPSubmit(".heal-input", mhp.view._heal, submitEvent);
		},
		// metodo comum de adicionar e remover hp
		_innerHPSubmit : function(inputClass, method, submitEvent){
			if(submitEvent.isDefaultPrevented()) return;
			var input = $(submitEvent.target).find(inputClass);
			var value = Number(input.val());
			$(submitEvent.target).closest(".monster-hp-column").each(function(index, column){
				method(column, value);
			});
		},
		// calcula um hp dada uma expressao de hp
		_calcHP : function(hpExp){
			var spaceLessExp = hpExp.replace(/\s/g, '');
			var hp = 0;
			
			//var tokens = spaceLessExp.split("+");
			//$.each(tokens, function(index, token){
			//	var tokenValue = mhp.view._calcTokenHP(token);
			//	hp += tokenValue;
			//});

			var token = "";
			var add = true;
			for(var i=0; i < spaceLessExp.length; i++){
				if(spaceLessExp[i] == '+' || spaceLessExp[i] == '-'){
					if(add) hp += mhp.view._calcTokenHP(token);
					else hp -= mhp.view._calcTokenHP(token);

					add = spaceLessExp[i] == '+';
					token = "";
					continue;
				}
				token += spaceLessExp[i];
			}
			if(add) hp += mhp.view._calcTokenHP(token);
			else hp -= mhp.view._calcTokenHP(token);

			return hp;
		},
		// calcula o hp de um termo de uma expressao de hp
		_calcTokenHP : function(tokenExp){
			var isVariable = tokenExp.indexOf("d") != -1;
			if(!isVariable) return Number(tokenExp);

			var variableTokens = tokenExp.split("d");
			var multiplier = variableTokens[0].length == 0 ? 1 : Number(variableTokens[0]);
			var diceValue = Number(variableTokens[1]);

			var tokenValue = 0;
			if(diceValue > 0){
				for(var i=0; i < multiplier; i++){
					var parcialValue = Math.floor((Math.random() * diceValue) + 1);
					tokenValue += parcialValue;
				}
			}

			return tokenValue;
		},
		// muda o hp de um monstro
		_setHPValue : function(monsterColumn, currentValue, maxValue){
			var hpBar = $(monsterColumn).find(".hp-bar");
			if(currentValue < 0) currentValue = 0;
			if(maxValue < 1) maxValue = 1;
			if(currentValue > maxValue) currentValue = maxValue;

			hpBar.attr(mhp.view.C.MAX_HP_ATTR, maxValue);
			hpBar.attr(mhp.view.C.CURRENT_HP_ATTR, currentValue);

			var hpPercentage = (currentValue / maxValue) * 100 + "%";
			hpBar.css("width", hpPercentage);

			var hpText = currentValue + " / " + maxValue;
			$(monsterColumn).find(".hp-bar-text").text(hpText);
		},
		// dimunui o hp de um monstro
		_damage : function(monsterColumn, damage){
			var hpBar = $(monsterColumn).find(".hp-bar");
			var maxHP = Number(hpBar.attr(mhp.view.C.MAX_HP_ATTR));
			var currentHP = Number(hpBar.attr(mhp.view.C.CURRENT_HP_ATTR));
			mhp.view._setHPValue(monsterColumn, currentHP - damage, maxHP);
		},
		// aumenta o hp de um monstro
		_heal : function(monsterColumn, heal){
			mhp.view._damage(monsterColumn, -heal);
		},
		// muda o nome de um monstro
		_setName : function(monsterColumn, name, number){
			$(monsterColumn).find(".monster-name-title").text(name);
			$(monsterColumn).find(".monster-number-title").text("(" + number + ")");
		},
		// recupera o numero de um monstro
		_getNumber : function(monsterColumn){
			var text = $(monsterColumn).find(".monster-number-title").text();
			text = text.substring(1, text.length - 1);
			return Number(text);
		}
	}
} ());