if(typeof mtp == 'undefined') mtp = {};
(function() {
	mtp.view = {
		_player : null,
		_currentPath : null,
		_tags : null,
		_usedTags : null,
		_tagTemplate : "<strong>&TAG&</strong><span class='glyphicon glyphicon-thumbs-down' onclick='addTag($(this).parent(), true)'/><span class='glyphicon glyphicon-thumbs-up' onclick='addTag($(this).parent(), false)'/>",
		_tagTemplVar1 : "&TAG&",
		_usedTagTemplate : "<div onclick='mtp.view.removeUsedTag(this);' class='label label-&EXCLUSION& usedTag'>&TAG& &times;</div>",
		_usedTagTemplVar1 : "&TAG&",
		_usedTagTemplVar2 : "&EXCLUSION&",
		init : function(tagsListString){
			mtp.view._tags = tagsListString.replace('[', '').replace(']', '').split(/, /g);
			mtp.view._usedTags = [];
			
			$('#player').mediaelementplayer({
				success: function(mediaElement, originalNode) {
					mtp.view._player = mediaElement;
					mtp.view._player.setSrc("");
				},
				features: ['playpause','current','progress','duration','volume']
			});
		},
		startLoading : function(){
			$("#wait").css("display","table-cell");
			console.log('start');
		},
		endLoading : function(){
			$("#wait").css("display","none");
			console.log('end');
		},
		clearAutoComplete : function(button){
			$(button).parentsUntil('div').parent().children('input').val('');
			$("#tagsList").find("li").show();
		},
		play : function(item){
			mtp.view._selectRow(item);
			var path = $(item).find(".path").val();
			if(!path || mtp.view._currentPath == path){
				return;
			}
			mtp.view._currentPath = path;
			mtp.view._player.pause();
			mtp.view._player.setSrc(path);
			mtp.view._player.play();
		},
		refreshTagList : function(tagsList) {
			mtp.view.startLoading();
			mtp.view._beautifyStrArr(tagsList);
			mtp.view._tags = tagsList;
			$('#tagsList').fadeOut("slow", function() {
				$('#tagsList').load('resources/ajax/tagsList.jsp', {'tags[]': tagsList}, function(){
					$('#tagsList').fadeIn("slow");
				});
			});
			mtp.view.endLoading();
		},
		filterTagList : function(str, tagsList){
			var strTrim = str.trim().toLowerCase();
			var tagsLi = $(tagsList).find("li");
			for (var i = 0; i < tagsLi.length; ++i) {
				var tagEl = $(tagsLi[i]);
				if(tagEl.text().toLowerCase().indexOf(strTrim) != -1){
					//TODO: highlight match
					tagEl.show();
				} else {
					tagEl.hide();
				}
			}
		},
		fillTagTemplate : function(tag){
			return mtp.view._tagTemplate.replace(mtp.view._tagTemplVar1, tag);
		},
		addUsedTag : function(tagElement, exclusion){
			var tagText = $(tagElement).text().trim();
			mtp.view._usedTags.push(tagText);
			if(mtp.view._usedTags.length == 1){
				$("#usedTagsElement").show();
			}
			
			//TODO: filter music list
			
			$("#usedTagsElement").append(mtp.view._fillUsedTagTemplate(tagText, exclusion)); //TODO: place in list ordered by name
			$(tagElement).addClass("hidden");
		},
		removeUsedTag : function(usedtagElement){
			var tagText = $(usedtagElement).text().replace(/.$/g, "").trim();
			mtp.view._usedTags.splice(mtp.view._usedTags.indexOf(tagText), 1);
			if(mtp.view._usedTags.length == 0){
				$("#usedTagsElement").hide();
			}
			
			//TODO: filter music list
			
			var tagsLi = $("#tagsList").find("li.hidden");
			for (var i = 0; i < tagsLi.length; ++i) {
				var tagEl = $(tagsLi[i]);
				if(tagEl.text().toLowerCase().trim() == tagText.toLowerCase()){
					$(tagEl).removeClass("hidden");
					break;
				}
			}
			$(usedtagElement).remove();
		},
		enableSaveButton : function(){
			jQuery("#saveButton").attr("disabled", false);
		},
		enableAddMusicButton : function(){
			jQuery("#addMusicButton").attr("disabled", false);
		},
		updateFileName : function(newName){
			jQuery("#fileName").text(newName);
		},
		_beautifyStrArr : function(strArr){
			$.each(strArr, function( index, value ) {
				  strArr[index] = mtp.view._beautifyString(value);
			});
		},
		_beautifyString : function(str) {
			return str.replace(/(?:^|\s)\w/g, function(match) {
				return match.toUpperCase();
			});
		},
		_selectRow : function(row){
			var activeRows = $(row).parentsUntil("table").find("tr.active");
			activeRows.find(".glyphicon.glyphicon-volume-up").hide();
			activeRows.removeClass("active");
			
			$(row).addClass("active");
			$(row).find(".glyphicon.glyphicon-volume-up").show();
		},
		_fillUsedTagTemplate : function(tag, exclusion){
			var filledUsedTagTempl = mtp.view._usedTagTemplate.replace(mtp.view._usedTagTemplVar1, tag);
			return filledUsedTagTempl.replace(mtp.view._usedTagTemplVar2, exclusion? "danger" : "success");
		}
	}
} ());

//$(document).ajaxStart(function(){
//	mtp.view.startLoading();
//});
//$(document).ajaxComplete(function(){
//	mtp.view.endLoading();
//});

$("#tagsList, body").mCustomScrollbar({
	theme: "minimal"
});

mtp.view.startLoading();