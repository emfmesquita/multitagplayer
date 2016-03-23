if(typeof mhp_stats_attack == 'undefined') mhp_stats_attack = {};
(function() {
	mhp_stats_attack = {
		_attackPopoverTemplateCache : null,
		attackRoll : function(element, name, attackRoll, damageRoll){
			var el = $(element);
			
			var hasAR = attackRoll !== "undefined" && attackRoll !== "";
			var hasDR = damageRoll !== "undefined" && damageRoll !== ""
			
			var content = "";
			if(hasAR){
				var ar1 = mhp._calcHP(attackRoll);
				var ar2 = mhp._calcHP(attackRoll);				
				content += "<b>Attack Roll: </b>";
				content += ar1;				
				content += ", ";
				content += ar1 > ar2 ? ar1 : ar2;
				content += "(Adv), ";
				content += ar1 > ar2 ? ar2 : ar1;
				content += "(Dis)";
			}
			
			if(hasAR && hasDR){
				content += "<br/>"
			}
			
			if(hasDR){
				content += "<b>Damage Roll: </b>";
				content += mhp._calcHP(damageRoll);
			}
			
			if(content === ""){
				return;
			}
			
			var popoverEl = el.closest('[data-toggle="popover"]');
			popoverEl.popover("destroy");
			setTimeout(function(){
				$(".popover").css("z-index", 1060);
				popoverEl.attr("data-content", content);
				popoverEl.attr("title", name);
				popoverEl.popover({
					placement : "left",
					trigger : "manual",
					html : true,
					title : name,
					template : mhp_stats_attack._attackPopoverTemplate()
				});				
				setTimeout(function(){
					var popoverId = popoverEl.attr("aria-describedby");
					$("#" + popoverId).css("z-index", 1061);
				}, 0);				
				popoverEl.popover("show");
			}, 200);
		},
		closeAttackPopover : function(element){
			var popoverDiv = $(element).closest(".popover");
			var popoverId = popoverDiv.attr("id");
			$("[aria-describedby='" + popoverId + "']").popover("hide");
		},
		focusAttackPopover : function(popoverDiv){
			$(".popover").css("z-index", 1060);
			$(popoverDiv).css("z-index", 1061);
		},
		_attackPopoverTemplate : function(){
			if(mhp_stats_attack._attackPopoverTemplateCache) return mhp_stats_attack._attackPopoverTemplateCache;
			var template = '<div class="popover" role="tooltip" onclick="mhp_stats_attack.focusAttackPopover(this);"><div class="arrow"></div>';
			template += '<a class="close pull-right close-attack-button" href="javascript:void(0)" onclick="mhp_stats_attack.closeAttackPopover(this);" role="button">';
			template += '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>';
			template += '</a>';
			template += '<h3 class="popover-title"></h3>';
			template += '<div class="popover-content"></div></div>';
			mhp_stats_attack._attackPopoverTemplateCache = template;
			return mhp_stats_attack._attackPopoverTemplateCache;
		}
	}
} ());