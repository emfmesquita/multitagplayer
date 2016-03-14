if(typeof mhp_stats == 'undefined') mhp_stats = {};
(function() {
	mhp_stats = {
		_crToXp : {
			"1/8": "25",
			"1/2": "100",
			"1": "200",
			"2": "450",
			"3": "700",
			"4": "1100",
			"5": "1800",
			"6": "2300",
			"7": "2900",
			"8": "3900",
			"9": "5000",
			"10": "5900",
			"11": "7200",
			"12": "8400",
			"13": "10000",
			"14": "11500",
			"15": "13000",
			"16": "15000",
			"17": "18000",
			"18": "20000",
			"19": "22000",
			"20": "25000",
			"21": "33000",
			"22": "41000",
			"23": "50000",
			"24": "62000",
			"25": "",
			"26": "90000",
			"27": "",
			"28": "",
			"29": "",
			"30": "155000"
		},
		_toSize : {
			"T": "Tiny",
			"S": "Small",
			"M": "Medium",
			"L": "Large",
			"H": "Huge",
			"G": "Gargantuan"
		},
		// chamado pelo botao de submit do form que adiciona um premade xml
		updatePremadesXml : function(){
			var xmlArea = $("#premadeXmlArea");
			var xmlText = xmlArea.val();
			if(!xmlText){
				return;
			}

			var premadesDoc = $.parseXML(xmlText);
			$("monster", premadesDoc).each(mhp_stats._parseCreature);
			mhp._updatePremades();
			xmlArea.val(null);
			$('#premade-xml-modal').modal('hide');
		},
		// chamado pelo botao de stats de cada criatura
		showMonsterStats : function(button){
			var monsterNameLower = button.closest(".hp-column").attributes["monster-name-lower"].value;
			if(!monsterNameLower){
				return;
			}

			var creature = mhp.M.premades[monsterNameLower];
			if(!creature || !creature.stats){
				return;
			}

			mhp_stats._updateStatsModal(creature.stats);
			$("#stat-block-modal").modal("show");
		},
		_getXmlText : function(cssExpression, xmlEl){
			return $(cssExpression, xmlEl).text().trim();
		},
		_parseCreature : function(index, creatureXml){
			var creature = {};
			creature.name = mhp_stats._getXmlText("monster>name", creatureXml);
			creature.size = mhp_stats._toSize[mhp_stats._getXmlText("monster>size", creatureXml)];
			creature.type = mhp_stats._getXmlText("monster>type", creatureXml);
			creature.alignment = mhp_stats._getXmlText("monster>alignment", creatureXml);
			creature.ac = mhp_stats._getXmlText("monster>ac", creatureXml);
			creature.hp = mhp_stats._getXmlText("monster>hp", creatureXml);
			creature.speed = mhp_stats._getXmlText("monster>speed", creatureXml);
			creature.str = mhp_stats._getXmlText("monster>str", creatureXml);
			creature.dex = mhp_stats._getXmlText("monster>dex", creatureXml);
			creature.con = mhp_stats._getXmlText("monster>con", creatureXml);
			creature.int = mhp_stats._getXmlText("monster>int", creatureXml);
			creature.wis = mhp_stats._getXmlText("monster>wis", creatureXml);
			creature.cha = mhp_stats._getXmlText("monster>cha", creatureXml);
			creature.save = mhp_stats._getXmlText("monster>save", creatureXml);
			creature.skill = mhp_stats._getXmlText("monster>skill", creatureXml);
			creature.resist = mhp_stats._getXmlText("monster>resist", creatureXml);
			creature.vulnerable = mhp_stats._getXmlText("monster>vulnerable", creatureXml);
			creature.immune = mhp_stats._getXmlText("monster>immune", creatureXml);
			creature.conditionImmune = mhp_stats._getXmlText("monster>conditionImmune", creatureXml);
			creature.languages = mhp_stats._getXmlText("monster>languages", creatureXml);
			creature.cr = mhp_stats._getXmlText("monster>cr", creatureXml);

			var senses = mhp_stats._getXmlText("monster>senses", creatureXml);
			var passive = mhp_stats._getXmlText("monster>passive", creatureXml);
			if (senses) {
				senses = senses + ", ";
			}
			creature.senses = senses + "passive Perception " + passive;

			var hpExp = "1";
			var spaceIndex = creature.hp.indexOf(" ");
			if(spaceIndex > -1){
				hpExp = creature.hp.substring(spaceIndex + 1).replace("(", "").replace(")", "");
			}

			mhp_stats._parseTraits("trait", creature, creatureXml);
			mhp_stats._parseTraits("action", creature, creatureXml);
			mhp_stats._parseTraits("reaction", creature, creatureXml);
			mhp_stats._parseTraits("legendary", creature, creatureXml);

			if(creature.cr == "0" && creature.action.length > 0){
				creature.cr = creature.cr + " (10 XP)";
			} else if(creature.cr == "0"){
				creature.cr = creature.cr + " (0 XP)";
			} else{
				creature.cr = creature.cr + " (" + mhp_stats._crToXp[creature.cr] + " XP)";
			}

			var spaceLessExp = hpExp.replace(/\s/g, '');
			var lowerName = creature.name.toLowerCase();
			mhp.M.premades[lowerName] = {
				name : creature.name,
				hpExp : spaceLessExp,
				stats: creature
			}
		},
		_parseTraits : function(traitName, creature, creatureXml){
			creature[traitName] = [];
			$("monster>" + traitName, creatureXml).each(function(index, node){
				mhp_stats._parseTrait(index, node, traitName, creature);
			});
		},
		_parseTrait : function(index, node, traitName, creature){
			var stat = {text: []};
			stat.name = mhp_stats._getXmlText(traitName + ">name", node);
			stat.text = "";
			$(traitName + ">text", node).each(function(textIndex, textNode){
				stat.text = stat.text + textNode.textContent.trim() + "<br/>";
			});
			if(stat.text.length > 0){
				stat.text = stat.text.substring(0, stat.text.length - 5);
			}
			creature[traitName].push(stat);
		},
		_updateStatsModal : function(stats){
			var statBlock = $("#stat-block-modal stat-block");
			statBlock.empty();

			var heading = $($.parseHTML("<creature-heading></creature-heading>"));
			heading.append("<h1>" + stats.name + "</h1>");
			heading.append("<h2>" + stats.size + " " + stats.type + ", " + stats.alignment + "</h2>");
			statBlock.append(heading);

			var top = $($.parseHTML("<top-stats></top-stats>"));
			mhp_stats._appendPropertyLine(top, "Armor Class", stats.ac);
			mhp_stats._appendPropertyLine(top, "Hit Points", stats.hp);
			mhp_stats._appendPropertyLine(top, "Speed", stats.speed);
			top.append(mhp_stats._buildAbilityScores(stats));
			mhp_stats._appendPropertyLine(top, "Saving Throws", stats.save);
			mhp_stats._appendPropertyLine(top, "Skills", stats.skill);
			mhp_stats._appendPropertyLine(top, "Damage Vulnerabilities", stats.vulnerable);
			mhp_stats._appendPropertyLine(top, "Damage Resistences", stats.resist);
			mhp_stats._appendPropertyLine(top, "Damage Immunities", stats.immune);
			mhp_stats._appendPropertyLine(top, "Condition Immunities", stats.conditionImmune);
			mhp_stats._appendPropertyLine(top, "Languages", stats.languages === "" ? "-" : stats.languages);
			mhp_stats._appendPropertyLine(top, "Senses", stats.senses);
			mhp_stats._appendPropertyLine(top, "Challenge", stats.cr);
			statBlock.append(top);

			mhp_stats._appendTraits(statBlock, stats, "trait");
			mhp_stats._appendTraits(statBlock, stats, "action", "Actions");
			mhp_stats._appendTraits(statBlock, stats, "reaction", "Reactions");
			mhp_stats._appendTraits(statBlock, stats, "legendary", "Legendary Actions");
		},
		_appendPropertyLine : function(node, key, value){
			mhp_stats._appendProperty(node, key, value, "property-line");
		},
		_appendPropertyBlock : function(node, trait){
			mhp_stats._appendProperty(node, trait.name, trait.text, "property-block");
		},
		_appendProperty : function(node, key, value, tag){
			if(!value || value === "") return;
			var prop = $($.parseHTML("<" + tag + "></" + tag + ">"));
			prop.append("<h4>" + key + "</h4>");
			prop.append("<p> " + value + "</p>");
			node.append(prop);
		},
		_appendTraits : function(node, stats, traitName, header){
			if(stats[traitName].length == 0) return;
			if(header){
				node.append("<h3>" + header + "</h3>");
			}
			stats[traitName].forEach(function(trait){
				mhp_stats._appendPropertyBlock(node, trait);
			});
		},
		_buildAbilityScores : function(stats){
			var abilitiesBlock = $($.parseHTML("<abilities-block></abilities-block>"));
			abilitiesBlock.attr("data-str", stats.str);
			abilitiesBlock.attr("data-dex", stats.dex);
			abilitiesBlock.attr("data-con", stats.con);
			abilitiesBlock.attr("data-int", stats.int);
			abilitiesBlock.attr("data-wis", stats.wis);
			abilitiesBlock.attr("data-cha", stats.cha);
			return abilitiesBlock;
		}
	}
} ());