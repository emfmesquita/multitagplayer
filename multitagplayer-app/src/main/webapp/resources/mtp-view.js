if(typeof mtp == 'undefined') mtp = {};
(function() {
	mtp.view = {
		init : function(tagsListString){
			mtp.view._tags = tagsListString.replace('[', '').replace(']', '').split(/, /g);
			
			$('#player').mediaelementplayer({
				success: function(mediaElement, originalNode) {
					mtp.view._player = mediaElement;
					mtp.view._player.setSrc("");
					mtp.view._player.addEventListener("pause", function(){
						if(!mtp.view._player.ended){
							mtp.view._pauseCurrentRow();
						}
					});
					mtp.view._player.addEventListener("play", function(){mtp.view._playCurrentRow()});
					mtp.view._player.addEventListener("ended", function(){mtp.view._playNext()});
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
			var musicid = item.getAttribute("musicid");
			if(musicid == mtp.view._player.musicid){
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

			mtp.view._player.pause();
			mtp.view._player.setSrc(path);
			mtp.view._player.musicid = musicid;
			mtp.view._player.play();
			mtp.view._selectRow(item);
		},
		refreshTagList : function(tagsList, callback) {
			mtp.view.startLoading();
			mtp.view._beautifyStrArr(tagsList);
			mtp.view._tags = tagsList;
			$('#tagsList').fadeOut("slow", function() {
				$('#tagsList').load('resources/ajax/tagsList.jsp', {'tags[]': tagsList}, function(){
					$('#tagsList').fadeIn("slow");
					if(callback){
						callback();
					}
					mtp.view.endLoading();
				});
			});
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

			mtp.cookies.storeUsedTags(mtp.view._usedUpTags, mtp.view._usedDownTags);
			mtp.view._updateMusics();
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

			mtp.cookies.storeUsedTags(mtp.view._usedUpTags, mtp.view._usedDownTags);
			mtp.view._updateMusics();
		},
		removeAllUsedTags : function(){
			mtp.view._usedUpTags = [];
			mtp.view._usedDownTags = [];
			mtp.view._usedTags = [];

			$("#usedTagsElement").hide();
			$("#usedTagsElement .usedTag").remove();
			$("#tagsList li").removeClass("hidden");
		},
		addUsedTags : function(upTags, downTags){
			var usedTagsElement = $("#usedTagsElement");
			$.each(upTags, function( index, tag ) {
				// remove se for uma tag invalida
				if(!mtp.file.hasFileTag(tag)){
					upTags.splice(index, 1);
					return;
				}
				usedTagsElement.append(mtp.view._fillUsedTagTemplate(tag, false)); //TODO: place in list ordered by name
			});
			$.each(downTags, function( index, tag ) {
				if(!mtp.file.hasFileTag(tag)){
					downTags.splice(index, 1);
					return;
				}
				usedTagsElement.append(mtp.view._fillUsedTagTemplate(tag, true)); //TODO: place in list ordered by name
			});

			mtp.view._usedUpTags = upTags;
			mtp.view._usedDownTags = downTags;
			mtp.view._usedTags = [].concat(upTags, downTags);

			$("#tagsList li strong").each(function(index, element){
				var tag = element.textContent;
				if(mtp.view._usedTags.indexOf(tag) != -1){
					$(element).closest('li').addClass("hidden");
				}
			});
			if(mtp.view._usedTags.length > 0){
				usedTagsElement.show();
			}

			mtp.cookies.storeUsedTags(mtp.view._usedUpTags, mtp.view._usedDownTags);
			mtp.view._updateMusics();
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
		addMusic : function(id, name, path, tags){
			var musicRow = mtp.view.isMusicVisible(id);
			if(!musicRow){
				musicRow = $(mtp.view._buildMusicRow(id, name, path, tags))[0];
				var trs = $(".musicTable tbody tr");
				var tbody = $(".musicTable tbody");
				if(trs.length == 0){
					tbody.append(musicRow);
					mtp.view._musicNames.push(name);
				}
				else{
					var position = mtp.view._locationOf(name, mtp.view._musicNames);
					if(position == -1){
						tbody.prepend(musicRow);
					}
					else{
						trs.eq(position).after(musicRow);
					}
					mtp.view._addMusicName(name, position + 1);
				}
			}
			if(id == mtp.view._player.musicid){
				mtp.view._selectRow(musicRow);
			}
		},
		isMusicVisible : function(id){
			if(!id){
				return null;
			}

			var possibleRows = $("[musicID='" + id + "']");
			if(possibleRows.length > 0){
				return possibleRows[0];
			}

			return null;
		},
		clearMusics : function(){
			jQuery(".musicTable tbody").empty();
			mtp.view._musicNames = [];
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
					mtp.view.addMusic(musicID, music.name, music.link, music.tags);
				});
			});
		},
		initModalTags : function(element){
			var musicID = $(element).closest("tr").attr("musicID");
			var name = $(element).closest("tr").find(".musicName").text();
			var tags = mtp.file.getMusicTags(musicID);
			var tagsString = "";
			if(tags && tags.length > 0){
				tags.sort();
				mtp.view._beautifyStrArr(tags);
				tagsString = tags.join(", ");
			}
			
			$("#modalTags #myModalLabel").text('Tags of "' + name.substring(0, Math.min(40,name.length)) + (name.length > 40 ? '...' : '') + '"');
			$("#modalTags #musicId").val(musicID);
			$("#modalTags #tagsText").val(tagsString);
		},
		endModalTags : function(){
			var musicID = $("#modalTags #musicId").val();
			var tagsString = $("#modalTags #tagsText").val();
			
			mtp.view._updateMusicTags(musicID, tagsString);
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

			if(mtp.view._player.paused){
				$(row).find(".glyphicon.glyphicon-pauses").show();
			}
			else{
				$(row).find(".glyphicon.glyphicon-volume-up").show();
			}
		},
		_pauseRow : function(row){
			$(row).find(".glyphicon.glyphicon-volume-up").hide();
			$(row).find(".glyphicon.glyphicon-pause").show();
		},
		_playRow : function(row){
			$(row).find(".glyphicon.glyphicon-volume-up").show();
			$(row).find(".glyphicon.glyphicon-pause").hide();
		},
		_pauseCurrentRow : function(){
			mtp.view._pauseRow($("tr.active"));
		},
		_playCurrentRow : function(){
			mtp.view._playRow($("tr.active"));
		},
		_playNext : function(){
			var currentRow = $("tr.active");

			var nextRow = [];
			if(currentRow[0]){
				nextRow = currentRow.next("tr");
			}
			if(!nextRow[0]){
				nextRow = $(".musicTable tbody tr").first();
			}
			if(!nextRow[0]){
				return;
			}

			if(currentRow[0] == nextRow[0]){
				mtp.view._player.play();
			}
			else{
				mtp.view.play(nextRow[0]);
			}
		},
		_fillUsedTagTemplate : function(tag, exclusion){
			var filledUsedTagTempl = mtp.view._usedTagTemplate.replace(mtp.view._usedTagTemplVar1, tag);
			return filledUsedTagTempl.replace(mtp.view._usedTagTemplVar2, exclusion? "danger" : "success");
		},
		_buildMusicRow : function(id, name, path, tags){
			var tagsString = "";
			if(tags && tags.length > 0){
				tags.sort();
				mtp.view._beautifyStrArr(tags);
				tagsString = tags.join(", ");
			}
			var musicRow = '<tr musicID="' + id + '" class="row" onclick="mtp.view.play(this);">';
			musicRow += '<td class="col-xs-1"><span class="glyphicon glyphicon-volume-up" style="display:none;"></span><span class="glyphicon glyphicon-pause" style="display:none;"></span></td>';
			musicRow += '<td class="col-xs-4 musicName">';
			musicRow += name;
			musicRow += ' <input type="hidden" class="path" style="display:none" value="' + path + '"/>';
			musicRow += '</td>';
			musicRow += '<td class="col-xs-6 musicTags">' + tagsString + '</td>';
			musicRow += '<td class="col-xs-1"><button class="btn btn-default btn-sm" data-toggle="modal" data-target="#modalTags" onClick="mtp.view.initModalTags(this);"><span class="glyphicon glyphicon-tags"></span></button></td>';
			musicRow += '</tr>';
			return musicRow;
		},
		_updateMusics : function(){
			mtp.view.clearMusics();
			var musics = mtp.file.searchMusics(mtp.view._usedUpTags, mtp.view._usedDownTags);
			mtp.view.addMusics(musics, ++mtp.view._currentFilterExecution);
		},
		_locationOf : function(element, array, start, end) {
			start = start || 0;
			end = end || array.length;
			var pivot = parseInt(start + (end - start) / 2, 10);
			if (array[pivot] === element) return pivot;
			if (end - start <= 1)
				return array[pivot] > element ? pivot - 1 : pivot;
			if (array[pivot] < element) {
				return mtp.view._locationOf(element, array, pivot, end);
			} else {
				return mtp.view._locationOf(element, array, start, pivot);
			}
		},
		_addMusicName : function(element, position){
			var array = mtp.view._musicNames;
			if(array.indexOf(element) != -1){
				return array;
			}
			array.splice(position, 0, element);
			return array;
		},
		_updateMusicTags : function(musicID, tagsStr){
			// atualizar a lista de tags na lateral e o arquivo
			$("#musicsTable").find("tr[musicID=" + musicID + "] .musicTags").text(tagsStr);
		},
		_player : null,
		_tags : null,
		_usedTags : [],
		_usedUpTags : [],
		_usedDownTags : [],
		_musicNames : [],
		_tagTemplate : "<strong>&TAG&</strong><span class='glyphicon glyphicon-thumbs-down' onclick='addTag($(this).parent(), true)'/><span class='glyphicon glyphicon-thumbs-up' onclick='addTag($(this).parent(), false)'/>",
		_tagTemplVar1 : "&TAG&",
		_usedTagTemplate : "<div onclick='mtp.view.removeUsedTag(this);' class='label label-&EXCLUSION& usedTag'>&TAG& &times;</div>",
		_usedTagTemplVar1 : "&TAG&",
		_usedTagTemplVar2 : "&EXCLUSION&",
		_currentFilterExecution : 0
	}
} ());

$("#tagsList").mCustomScrollbar({
	theme: "minimal"
});

$("body").mCustomScrollbar({
	theme: "minimal-dark"
});

mtp.view.startLoading();