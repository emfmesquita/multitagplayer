if(typeof mhp_stats_parser == 'undefined') mhp_stats_parser = {};
(function() {
	mhp_stats_parser = {
		C : {
			crToXp : {
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
			toSize : {
				"T": "Tiny",
				"S": "Small",
				"M": "Medium",
				"L": "Large",
				"H": "Huge",
				"G": "Gargantuan"
			}
		},
		parseCreature : function(creatureXml){
			var creature = {};
			creature.name = mhp_stats_parser._getXmlText("monster>name", creatureXml);
			creature.size = mhp_stats_parser.C.toSize[mhp_stats_parser._getXmlText("monster>size", creatureXml)];
			creature.type = mhp_stats_parser._getXmlText("monster>type", creatureXml);
			creature.alignment = mhp_stats_parser._getXmlText("monster>alignment", creatureXml);
			creature.ac = mhp_stats_parser._getXmlText("monster>ac", creatureXml);
			creature.hp = mhp_stats_parser._getXmlText("monster>hp", creatureXml);
			creature.speed = mhp_stats_parser._getXmlText("monster>speed", creatureXml);
			creature.str = mhp_stats_parser._getXmlText("monster>str", creatureXml);
			creature.dex = mhp_stats_parser._getXmlText("monster>dex", creatureXml);
			creature.con = mhp_stats_parser._getXmlText("monster>con", creatureXml);
			creature.int = mhp_stats_parser._getXmlText("monster>int", creatureXml);
			creature.wis = mhp_stats_parser._getXmlText("monster>wis", creatureXml);
			creature.cha = mhp_stats_parser._getXmlText("monster>cha", creatureXml);
			creature.save = mhp_stats_parser._getXmlText("monster>save", creatureXml);
			creature.skill = mhp_stats_parser._getXmlText("monster>skill", creatureXml);
			creature.resist = mhp_stats_parser._getXmlText("monster>resist", creatureXml);
			creature.vulnerable = mhp_stats_parser._getXmlText("monster>vulnerable", creatureXml);
			creature.immune = mhp_stats_parser._getXmlText("monster>immune", creatureXml);
			creature.conditionImmune = mhp_stats_parser._getXmlText("monster>conditionImmune", creatureXml);
			creature.languages = mhp_stats_parser._getXmlText("monster>languages", creatureXml);
			creature.cr = mhp_stats_parser._getXmlText("monster>cr", creatureXml);

			var senses = mhp_stats_parser._getXmlText("monster>senses", creatureXml);
			var passive = mhp_stats_parser._getXmlText("monster>passive", creatureXml);
			if (senses) {
				senses = senses + ", ";
			}
			creature.senses = senses + "passive Perception " + passive;

			var hpExp = "1";
			var spaceIndex = creature.hp.indexOf(" ");
			if(spaceIndex > -1){
				hpExp = creature.hp.substring(spaceIndex + 1).replace("(", "").replace(")", "");
			}

			mhp_stats_parser._parseTraits("trait", creature, creatureXml);
			mhp_stats_parser._parseTraits("action", creature, creatureXml);
			mhp_stats_parser._parseTraits("reaction", creature, creatureXml);
			mhp_stats_parser._parseTraits("legendary", creature, creatureXml);

			if(creature.cr == "0" && creature.action.length > 0){
				creature.cr = creature.cr + " (10 XP)";
			} else if(creature.cr == "0"){
				creature.cr = creature.cr + " (0 XP)";
			} else{
				creature.cr = creature.cr + " (" + mhp_stats_parser.C.crToXp[creature.cr] + " XP)";
			}
			
			var spells = mhp_stats_parser._getXmlText("monster>spells", creatureXml);
			if(spells){
				creature.spells = [];
				spells.split(",").forEach(function(spell){
					creature.spells.push(spell.trim());
				});
			}

			var spaceLessExp = hpExp.replace(/\s/g, '');
			var lowerName = creature.name.toLowerCase();
			mhp.M.premades[lowerName] = {
				name : creature.name,
				hpExp : spaceLessExp,
				stats: creature
			}
		},
		_getXmlText : function(cssExpression, xmlEl){
			return $(cssExpression, xmlEl).text().trim();
		},
		_parseTraits : function(traitName, creature, creatureXml){
			creature[traitName] = [];
			$("monster>" + traitName, creatureXml).each(function(index, node){
				mhp_stats_parser._parseTrait(index, node, traitName, creature);
			});
		},
		_parseTrait : function(index, node, traitName, creature){
			var stat = {text: []};
			stat.name = mhp_stats_parser._getXmlText(traitName + ">name", node);
			stat.text = "";
			$(traitName + ">text", node).each(function(textIndex, textNode){
				stat.text = stat.text + textNode.textContent.trim() + "<br/>";
			});
			
			stat.attacks = [];
			$(traitName + ">attack", node).each(function(attackIndex, attackNode){
				mhp_stats_parser._parseAttack(attackNode, stat.attacks);
			});			
			
			if(stat.text.length > 0){
				stat.text = stat.text.substring(0, stat.text.length - 5);
			}
			creature[traitName].push(stat);
		},
		_parseAttack : function(attackNode, attacksArray){
			var attack = {};
			var tokens = attackNode.textContent.trim().split("|");
			attack.name = tokens[0];
			
			var bonus = tokens[1];
			if(bonus && bonus !== ""){
				attack.attackRoll = "1d20";
				if(!bonus.startsWith("+") && !bonus.startsWith("-")){
					attack.attackRoll += "+";
				}				
				attack.attackRoll += bonus;
			}
			
			attack.damageRoll = tokens[2];
			attacksArray.push(attack);
		}
	}
} ());