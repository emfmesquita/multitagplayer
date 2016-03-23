if(typeof mhp_stats == 'undefined') mhp_stats = {};
(function() {
	mhp_stats = {
		_grimoireErrorMap : {
			"detect-poison-and-disease" : "detect-poison-or-disease"
		},
		premadeXmlFile : null,
		// chamado pelo botao de submit do form que adiciona um premade xml
		updatePremadesXml : function(){
			if(!mhp_stats.premadeXmlFile) return;
			
			var reader = new FileReader();

			reader.onload = (function() {
				return mhp_stats._onPremateXmlFileLoad;
			})(mhp_stats.premadeXmlFile);			
			reader.readAsText(mhp_stats.premadeXmlFile);			
		},
		// chamado pelo botao de stats de cada criatura
		showMonsterStats : function(button){
			var monsterNameLower = $(button).closest(".hp-column").attr("monster-name-lower");
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
		_onPremateXmlFileLoad : function(event){
			var premadesDoc = $.parseXML(event.target.result);
			$("#add-premade-xml-button span").removeClass("hidden");
			mhp.disableFormButtons();
			
			var creatureXmls = $("monster", premadesDoc).toArray();
			var totalCount = creatureXmls.length;
			var progress = $("#add-premade-xml-progress");
			var process = function(){				
				var percent = Math.floor(((totalCount - creatureXmls.length)/totalCount) * 100) + "%";
				progress.css("width", percent);
				
				if(creatureXmls.length == 0){
					setTimeout(mhp_stats._resetAddPremadeXmlModal, 500);
					return;
				}
				mhp_stats_parser.parseCreature(creatureXmls.shift());
				setTimeout(process, 5);
			}
			process();
		},
		_resetAddPremadeXmlModal : function(){
			$("#add-premade-xml-button span").addClass("hidden");
			$("#premadeXmlFileInput").val(null);
			$('#premade-xml-modal').modal('hide');
			$("#add-premade-xml-progress").css("width", "0%");
			mhp.enableFormButtons();				
			mhp._updatePremades();
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

			mhp_stats._appendTraits(statBlock, stats, "trait", null, stats.spells);
			mhp_stats._appendTraits(statBlock, stats, "action", "Actions");
			mhp_stats._appendTraits(statBlock, stats, "reaction", "Reactions");
			mhp_stats._appendTraits(statBlock, stats, "legendary", "Legendary Actions");
		},
		_appendPropertyLine : function(node, key, value){
			mhp_stats._appendProperty(node, key, value, "property-line");
		},
		_appendPropertyBlock : function(node, trait, spells){
			mhp_stats._appendProperty(node, trait.name, trait.text, "property-block", trait.attacks, spells);
		},
		_appendProperty : function(node, key, value, tag, attacks, spells){
			if(!value || value === "") return;
			
			value = mhp_stats._formatSpells(key, value, spells);
						
			var prop = $($.parseHTML("<" + tag + "></" + tag + ">"));
			prop.append(mhp_stats._formatPropertyHeader(key, attacks));
			prop.append("<p> " + value + "</p>");
			node.append(prop);
		},
		_formatPropertyHeader : function(key, attacks){			
			if(!attacks || attacks.length == 0) return "<h4>" + key + "</h4>";
			
			var header = '<h4 data-toggle="popover" data-content="empty" title="empty">';
			if(attacks.length == 1){
				header += mhp_stats._formatAttack(key, attacks[0]);
			}
			else{
				header += key;
				header += "(";
				attacks.forEach(function(attack, index){
					if(index >= 1) header += ", ";
					header += mhp_stats._formatAttack(attack.name, attack);
				});
				header += ")";
			}
			
			header += "</h4>";
			return header;
		},
		_formatAttack : function(name, attack){
			var attackText = '<a href="#" ';
			attackText += 'onclick="mhp_stats_attack.attackRoll(this, \'' + attack.name + '\', \'' + attack.attackRoll + '\', \'' + attack.damageRoll + '\');">';
			attackText += name;
			attackText += "</a>";
			return attackText;
		},
		_formatSpells : function(key, value, spells){
			var newValue = value;
			if(!spells || !value || spells.length == 0) return newValue;
			if(key.search(/spellcasting/i) == -1) return newValue;
			
			spells.forEach(function(spell){
				var regex = new RegExp("([^ \w][ ]*" + spell +"[ ]*[^ \w])|([^ \w][ ]*" + spell + "[ ]*$)", "i");
				var regexIndex = newValue.search(regex);
				if(regexIndex == -1) return;
				var index = 0;
				while(index < regexIndex || index == -1){
					index = newValue.indexOf(spell, index == 0 ? 0 : index + 1);
				}
				if(index == -1) return;
				
				var init = newValue.substring(0, index);
				var end = newValue.substring(index + spell.length, newValue.length);
				var dashSpell = spell.toLowerCase().replace(/ /g, "-");
				dashSpell = dashSpell.replace(/[^-\w]/g, "");
				dashSpell = mhp_stats._grimoireErrorMap[dashSpell] || dashSpell;
				var anchor = '<a href="http://ephe.github.io/grimoire/spells/' + dashSpell + '" target="_blank">' + spell + '</a>'; 
				newValue = init + anchor + end;
			});
			return newValue;
		},
		_appendTraits : function(node, stats, traitName, header, spells){
			if(stats[traitName].length == 0) return;
			if(header){
				node.append("<h3>" + header + "</h3>");
			}
			stats[traitName].forEach(function(trait){
				mhp_stats._appendPropertyBlock(node, trait, spells);
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
	

	$("#premadeXmlFileInput").on("change", function(event) {
		var files = event.target.files;
		mhp_stats.premadeXmlFile = files.length == 0 ? null : files[0];
	});
} ());