if(typeof mtp == 'undefined') mtp = {};
(function() {
	mtp.view = {
		init : function(tagsListString){
			mtp.view._tags = tagsListString.replace('[', '').replace(']', '').split(/, /g);
			mtp.view._usedTags = [];
			mtp.view._usedUpTags = [];
			mtp.view._usedDownTags = [];
			
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
		},
		endLoading : function(){
			$("#wait").css("display","none");
		},
		clearAutoComplete : function(button){
			$(button).parentsUntil('div').parent().children('input').val('');
			$("#tagsList").find("li").show();
		},
		play : function(item){
			var path = $(item).find(".path").val();
			if(!path || mtp.view._currentPath == path){
				if(mtp.view._player.paused){
					mtp.view._player.play();
					mtp.view._playRow(item);
				}
				else{
					mtp.view._player.pause();
					mtp.view._pauseRow(item);
				}
				return;
			}

			mtp.view._selectRow(item);
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
			if(exclusion){
				mtp.view._usedDownTags.push(tagText);
			}
			else{
				mtp.view._usedUpTags.push(tagText);
			}

			if(mtp.view._usedTags.length == 1){
				$("#usedTagsElement").show();
			}
			
			$("#usedTagsElement").append(mtp.view._fillUsedTagTemplate(tagText, exclusion)); //TODO: place in list ordered by name
			$(tagElement).addClass("hidden");

			mtp.view.clearMusics();
			var musics = mtp.file.searchMusics(mtp.view._usedUpTags, mtp.view._usedDownTags);
			mtp.view.addMusics(musics, ++mtp.view._currentFilterExecution);
		},
		removeUsedTag : function(usedtagElement){
			var tagText = $(usedtagElement).text().replace(/.$/g, "").trim();
			mtp.view._usedTags.splice(mtp.view._usedTags.indexOf(tagText), 1);

			var upIndex = mtp.view._usedUpTags.indexOf(tagText);
			if(upIndex != -1){
				mtp.view._usedUpTags.splice(upIndex, 1);
			}
			var downIndex = mtp.view._usedDownTags.indexOf(tagText);
			if(downIndex != -1){
				mtp.view._usedDownTags.splice(downIndex, 1);
			}

			if(mtp.view._usedTags.length == 0){
				$("#usedTagsElement").hide();
			}
			
			var tagsLi = $("#tagsList").find("li.hidden");
			for (var i = 0; i < tagsLi.length; ++i) {
				var tagEl = $(tagsLi[i]);
				if(tagEl.text().toLowerCase().trim() == tagText.toLowerCase()){
					$(tagEl).removeClass("hidden");
					break;
				}
			}
			$(usedtagElement).remove();

			mtp.view.clearMusics();
			if(mtp.view._usedTags.length == 0){
				return;
			}
			var musics = mtp.file.searchMusics(mtp.view._usedUpTags, mtp.view._usedDownTags);
			mtp.view.addMusics(musics, ++mtp.view._currentFilterExecution);
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
		addMusic : function(id, name, path){
			if(mtp.view.isMusicVisible(id)){
				return;
			}
			var musicRow = mtp.view._buildMusicRow(id, name, path);
			jQuery(".musicTable tbody").append(musicRow);
		},
		isMusicVisible : function(id){
			if(!id){
				return true;
			}

			return jQuery("[musicID='" + id + "']").length > 0;
		},
		clearMusics : function(){
			jQuery(".musicTable tbody").empty();
		},
		addMusics : function(musics, execution){
			if(!musics || Object.keys(musics).length == 0){
				return;
			}

			var startedExecution = execution;

			jQuery.each(Object.keys(musics), function(index, musicID){
				if(startedExecution != mtp.view._currentFilterExecution){
					return false;
				}

				mtp.file.getMusic(musicID, function(music){
					if(startedExecution != mtp.view._currentFilterExecution){
						return;
					}
					if(mtp.view._usedTags.length == 0){
						return;
					}
					mtp.view.addMusic(musicID, music.name, music.link);
				});
			});
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
			activeRows.find(".glyphicon.glyphicon-pause").hide();
			activeRows.removeClass("active");
			
			$(row).addClass("active");
			$(row).find(".glyphicon.glyphicon-volume-up").show();
		},
		_pauseRow : function(row){
			$(row).find(".glyphicon.glyphicon-volume-up").hide();
			$(row).find(".glyphicon.glyphicon-pause").show();
		},
		_playRow : function(row){
			$(row).find(".glyphicon.glyphicon-volume-up").show();
			$(row).find(".glyphicon.glyphicon-pause").hide();
		},
		_fillUsedTagTemplate : function(tag, exclusion){
			var filledUsedTagTempl = mtp.view._usedTagTemplate.replace(mtp.view._usedTagTemplVar1, tag);
			return filledUsedTagTempl.replace(mtp.view._usedTagTemplVar2, exclusion? "danger" : "success");
		},
		_buildMusicRow : function(id, name, path){
			var musicRow = '<tr musicID="' + id + '" class="row" onclick="mtp.view.play(this);">';
			musicRow += '<td class="col-xs-1"><span class="glyphicon glyphicon-volume-up" style="display:none;"></span><span class="glyphicon glyphicon-pause" style="display:none;"></span></td>';
			musicRow += '<td class="col-xs-5">';
			musicRow += name;
			musicRow += ' <input type="hidden" class="path" style="display:none" value="' + path + '"/>';
			musicRow += '</td>';
			musicRow += '<td class="col-xs-6"></td>'
			musicRow += '</tr>';
			return musicRow;
		},
		_player : null,
		_currentPath : null,
		_tags : null,
		_usedTags : null,
		_usedUpTags : null,
		_usedDownTags : null,
		_tagTemplate : "<strong>&TAG&</strong><span class='glyphicon glyphicon-thumbs-down' onclick='addTag($(this).parent(), true)'/><span class='glyphicon glyphicon-thumbs-up' onclick='addTag($(this).parent(), false)'/>",
		_tagTemplVar1 : "&TAG&",
		_usedTagTemplate : "<div onclick='mtp.view.removeUsedTag(this);' class='label label-&EXCLUSION& usedTag'>&TAG& &times;</div>",
		_usedTagTemplVar1 : "&TAG&",
		_usedTagTemplVar2 : "&EXCLUSION&",
		_currentFilterExecution : 0
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