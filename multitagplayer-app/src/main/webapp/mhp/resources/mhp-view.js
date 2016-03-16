if(typeof mhp == 'undefined') mhp = {};
(function() {
	mhp = {
		M : {
			sequence : 0,
			premades : {}, // lowerName como indice - name, hpExp 
			monsters : {} // sequence como indice - id, name, hpExp, number, currentHP, maxHP
		},
		init : function(){
			$('.add-monster-form').validator().on('submit', mhp._addMonsterSubmit);
			$('.add-premade-form').validator().on('submit', mhp._addPremadeSubmit);
		},
		// chamado ao clicar no botao de remover monstro
		// remove o painel de monstro
		removeMonster : function(removeButton){
			var column = $(removeButton).closest(".monster-hp-column");
			mhp._removeMonsterFromMemory(Number(column.attr("monster-id")));
			column.fadeOut("slow", function(){ column.remove(); });
		},
		// chamado ao clicar no botao de remover todos
		removeAll : function(removeButton){
			var columns = $(".monster-row .monster-hp-column");
			columns.fadeOut("slow", function(){ columns.remove(); });
		},
		// chamado ao clicar no botao de adicionar monstro da lista de premade
		addFromPremade : function(){
			var selected = $('select.premade-select').val();
			if(!selected) return;

			var monsterNameLower = selected.toLowerCase();
			var entry = mhp.M.premades[monsterNameLower];
			var monster = {hpExp: entry.hpExp, name: entry.name, stats: entry.stats};
			mhp._addMonsterToMemory(monster);
			mhp._addMonster(monster, monsterNameLower);
		},
		// remove um premade
		removePremade : function(removeButton) {
			var name = $(removeButton).closest("tr").find(".premade-name-cell").text();
			name = name.trim();
			name = name.toLowerCase();
			delete mhp.M.premades[name];
			mhp._updatePremades();
		},
		disableFormButtons : function(){
			$("button.btn").prop("disabled", true);
		},
		enableFormButtons : function(){
			$("button.btn").prop("disabled", false);
		},
		// chamado no submit de adicionar monstro
		_addMonsterSubmit : function(submitEvent){
			if(submitEvent.isDefaultPrevented()) return;

			var monster = {
				hpExp : $(submitEvent.target).find(".max-hp-input").val(),
				name : $(submitEvent.target).find(".name-input").val()
			};

			var monsterNameLower = monster.name.toLowerCase();
			var entry = mhp.M.premades[monsterNameLower];
			if(entry){
				monster.stats = entry.stats;
			}
			
			mhp._addMonsterToMemory(monster);
			mhp._addMonster(monster, monsterNameLower);
		},
		// metodo para adicionar um monstro novo
		_addMonster : function(monster, monsterNameLower){
			if(!monster.maxHP){
				monster.maxHP = mhp._calcHP(monster.hpExp);
				if(monster.maxHP < 1) monster.maxHP = 1;
				monster.currentHP = monster.maxHP;
			}

			var row = $(".monster-row");
			var monsterColumnClone = $(".hidden-content .monster-hp-column").first().clone();
			monsterColumnClone.attr("monster-id", monster.id);
			monsterColumnClone.find('.remove-hp-form').validator().on('submit', mhp._removeHPSubmit);
			monsterColumnClone.find('.add-hp-form').validator().on('submit', mhp._addHPSubmit);

			if(monster.stats){
				var showStatsButton = monsterColumnClone.find(".monster-stats-button");
				monsterColumnClone.find(".monster-stats-button").removeClass("hidden");
			}

			if(monsterNameLower){
				monsterColumnClone.attr("monster-name-lower", monsterNameLower);
			}

			mhp._setHPValue(monsterColumnClone[0], monster);

			monster.name = monster.name.trim();
			var localNumber = monster.number ? monster.number : 1;
			var added = false;

			var lowerName = monster.name.toLowerCase();
			$(".monster-row .monster-hp-column").each(function(index, column){
				var testName = $(column).find(".monster-name-title").text().toLowerCase();
				if(lowerName == testName){
					var testNumber = mhp._getNumber(column);
					if(monster.number && localNumber < testNumber){
						added = true;
						$(column).before(monsterColumnClone);
						return false;
					}
					else if(!monster.number) localNumber = testNumber + 1;
				}
				if(lowerName < testName){
					added = true;
					$(column).before(monsterColumnClone);
					return false;
				}
			});
			
			if(!added) $(".monster-row").append(monsterColumnClone);
			mhp._setName(monsterColumnClone[0], monster.name, localNumber);
			monster.number = localNumber;
			monsterColumnClone.fadeIn("slow");
		},
		// adicona monstro na memoria
		_addMonsterToMemory : function(monster){
			mhp.M.sequence++;
			monster.id = mhp.M.sequence;
			mhp.M.monsters[monster.id] = monster;
		},
		// remove monstro da memoria
		_removeMonsterFromMemory : function(id){
			delete mhp.M.monsters[id];
		},
		// encontra monstro da memoria
		_findMonsterFromMemory : function(id){
			return mhp.M.monsters[id];
		},
		// chamado no submit de reducao de hp
		_removeHPSubmit : function(submitEvent){
			mhp._innerHPSubmit(".dmg-input", mhp._damage, submitEvent);
		},
		// chamado no submit de adicionar hp
		_addHPSubmit : function(submitEvent){
			mhp._innerHPSubmit(".heal-input", mhp._heal, submitEvent);
		},
		// metodo comum de adicionar e remover hp
		_innerHPSubmit : function(inputClass, method, submitEvent){
			if(submitEvent.isDefaultPrevented()) return;
			var input = $(submitEvent.target).find(inputClass);
			var stringVal = input.val();
			var value = stringVal ? Number(stringVal) : 1;
			$(submitEvent.target).closest(".monster-hp-column").each(function(index, column){
				method(column, value);
			});
		},
		// calcula um hp dada uma expressao de hp
		_calcHP : function(hpExp){
			var spaceLessExp = hpExp.replace(/\s/g, '');
			var hp = 0;
			var token = "";
			var add = true;
			for(var i=0; i < spaceLessExp.length; i++){
				if(spaceLessExp[i] == '+' || spaceLessExp[i] == '-'){
					if(add) hp += mhp._calcTokenHP(token);
					else hp -= mhp._calcTokenHP(token);

					add = spaceLessExp[i] == '+';
					token = "";
					continue;
				}
				token += spaceLessExp[i];
			}
			if(add) hp += mhp._calcTokenHP(token);
			else hp -= mhp._calcTokenHP(token);

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
		_setHPValue : function(monsterColumn, monster){
			var hpBar = $(monsterColumn).find(".hp-bar");
			if(monster.currentHP < 0) monster.currentHP = 0;
			if(monster.maxHP < 1) monster.maxHP = 1;
			if(monster.currentHP > monster.maxHP) monster.currentHP = monster.maxHP;

			var hpPercentage = (monster.currentHP / monster.maxHP) * 100 + "%";
			hpBar.css("width", hpPercentage);

			var hpText = monster.currentHP + " / " + monster.maxHP;
			$(monsterColumn).find(".hp-bar-text").text(hpText);

			if(monster.currentHP == 0) $(monsterColumn).find(".monster-hp-panel").addClass("monster-dead");
			else $(monsterColumn).find(".monster-hp-panel").removeClass("monster-dead");
		},
		// dimunui o hp de um monstro
		_damage : function(monsterColumn, damage){
			var id = Number($(monsterColumn).attr("monster-id"));
			var monster = mhp._findMonsterFromMemory(id);
			monster.currentHP = monster.currentHP - damage;
			mhp._setHPValue(monsterColumn, monster);
		},
		// aumenta o hp de um monstro
		_heal : function(monsterColumn, heal){
			mhp._damage(monsterColumn, -heal);
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
		},
		// chamado pelo botao de submit do form que adiciona um premade
		_addPremadeSubmit : function(submitEvent){
			if(submitEvent.isDefaultPrevented()) return;
			var hpExp = $(submitEvent.target).find(".max-hp-input").val();
			var name = $(submitEvent.target).find(".name-input").val();	
			mhp._addPremade(name, hpExp);
		},
		// adiciona um premade
		_addPremade : function(name, hpExp){
			var spaceLessExp = hpExp.replace(/\s/g, '');

			var realName = name.trim();
			var lowerName = realName.toLowerCase();
			var existingEntry = mhp.M.premades[lowerName];
			if(existingEntry) existingEntry.hpExp = spaceLessExp;
			else{
				mhp.M.premades[lowerName] = {
					name : realName,
					hpExp : spaceLessExp
				}
			}
			mhp._updatePremades();
		},
		// atualiza a lista de premades no select e na tabela
		_updatePremades : function(){
			var premadeSelect = $("select.premade-select");
			premadeSelect.empty();

			var premadeTableBody = $(".premade-table tbody");
			$(".premade-table .premade-row").remove();

			var keys = Object.keys(mhp.M.premades).sort();
			$(keys).each(function(index, key){
				var entry = mhp.M.premades[key];
				premadeSelect.append("<option data-subtext='" + entry.hpExp + "'>" + entry.name + "</option>");

				var newRow = "<tr class='row premade-row'>";
				newRow += "<td class='premade-name-cell'>" + entry.name + "</td>";
				newRow += "<td>" + entry.hpExp + "</td>";
				
				newRow += '<td>';
				newRow += '    <button type="button" class="close center-block remove-premade-button" aria-label="Close" onclick="mhp.removePremade(this)">';
				newRow += '        <span aria-hidden="true">&times;</span>';
				newRow += '    </button>';
				newRow += '</td>';
				
				newRow += "</tr>";
			
				premadeTableBody.append(newRow);
			});
			premadeSelect.selectpicker('refresh');
		}
	}
} ());