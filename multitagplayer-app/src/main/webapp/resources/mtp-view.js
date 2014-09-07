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
		play : function(item, event){
			// foi clicado em algum botao de acao de musica
			if(event && $(event.target).closest(".musicButtons").length != 0){
				return;
			}

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
			mtp.view._tags = [];

			$('#tagsList').fadeOut("slow", function() {
				$("#tagsList ul").empty();
				$.each(tagsList, function(index, tag){
					mtp.view._innerAddTag(tag);
				});
				$('#tagsList').fadeIn("slow");
				if(callback){
					callback();
				}
				mtp.view.endLoading();
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
			$("#saveButton").attr("disabled", false);
		},
		enableAddMusicButton : function(){
			$("#addMusicButton").attr("disabled", false);
		},
		updateFileName : function(newName){
			$("#fileName").text(newName);
		},
		addMusic : function(id, name, path, tags){
			var musicRow = mtp.view.isMusicVisible(id);
			if(!musicRow){
				var cleanName = name.replace(/\.\w+$/g, "");
				musicRow = $(mtp.view._buildMusicRow(id, cleanName, path, tags))[0];
				var trs = $(".musicTable tbody tr");
				var tbody = $(".musicTable tbody");
				if(trs.length == 0){
					tbody.append(musicRow);
					mtp.view._musicNames.push(cleanName);
				}
				else{
					var position = mtp.view._locationOf(cleanName, mtp.view._musicNames);
					if(position == -1){
						tbody.prepend(musicRow);
					}
					else{
						trs.eq(position).after(musicRow);
					}
					mtp.view._addMusicName(cleanName, position + 1);
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
			$(".musicTable tbody").empty();
			mtp.view._musicNames = [];
		},
		addMusics : function(musics, execution){
			if(!musics || Object.keys(musics).length == 0){
				return;
			}

			var startedExecution = execution;

			$.each(Object.keys(musics), function(index, musicID){
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
			var tagsString = mtp.view._stringifyTagArr(tags);
			
			$("#modalTags #myModalLabel").text('Tags of "' + name.substring(0, Math.min(40,name.length)) + (name.length > 40 ? '...' : '') + '"');
			$("#modalTags #musicId").val(musicID);
			$("#modalTags #tagsText").val(tagsString);
		},
		endModalTags : function(){
			var musicID = $("#modalTags #musicId").val();
			var tagsString = $("#modalTags #tagsText").val();
			
			mtp.view._updateMusicTags(musicID, tagsString);
		},
		enterOnTagArea : function(event){
			if(event.keyCode != 13){
				return;
			}
			event.stopPropagation();
			$("#modalTags #saveModal").click();
		},
		_refreshMusicTags : function(id, tags){
			var configMusicTags = mtp.file.getMusicTags(id);
			mtp.view._beautifyStrArr(configMusicTags);

			$(tags).not(configMusicTags).each(function(index, tag){
				mtp.view._addMusicTag(id, tag);
			});

			var removedTags = $(configMusicTags).not(tags).get();
			$.each(removedTags, function(index, tag){
				mtp.view._removeMusicTag(id, tag);
			});			

			var searchText = $('#tagSearchInput').val();
			mtp.view.filterTagList(searchText, $("#tagsList")[0]);
		},
		_addMusicTag : function(id, tag){
			if(!tag){
				return;
			}
			var tagAdded = mtp.file.addMusicTag(id, tag);
			if(!tagAdded){
				return;
			}
			if(mtp.view._tags.indexOf(tag) != -1){
				return;
			}
			mtp.view._innerAddTag(tag);
		},
		_innerAddTag : function(tag){
			var tagLi = mtp.view._buildTagLI(tag);
			if(mtp.view._tags.length == 0){
				$("#tagsList ul").append(tagLi);
			}
			else{
				mtp.view._tags = mtp.view._tags.sort();
				var position = mtp.view._locationOf(tag, mtp.view._tags);

				if(position == -1){
					$("#tagsList ul").prepend(tagLi);
				}
				else{
					$("#tagsList li").eq(position).after(tagLi);
				}
			}
			mtp.view._tags.push(tag);
		},
		_removeMusicTag : function(id, tag){
			if(!tag){
				return;
			}

			var tagRemovedFromFile = mtp.file.removeMusicTag(id, tag);
			if(!tagRemovedFromFile){
				return;
			}
			if(mtp.view._tags.indexOf(tag) == -1){
				return;
			}

			$("#tagsList li strong").each(function(index, element){		
				if(element.textContent.trim() == tag){
					$(element).closest("li").remove();
					return false;
				}
			});
			mtp.view._tags.splice(mtp.view._tags.indexOf(tag), 1);
		},
		_beautifyStrArr : function(strArr){
			$.each(strArr, function( index, value ) {
				strArr[index] = mtp.view._beautifyString(value);
			});
		},
		_beautifyString : function(str) {
			return str.replace(/(?:^|\s)+\w/g, function(match) {
				return ' ' + match.toUpperCase().trim();
			}).trim();
		},
		_selectRow : function(row){
			var activeRows = $(row).parentsUntil("table").find("tr.active");
			activeRows.find(".glyphicon.glyphicon-volume-up").hide();
			activeRows.find(".glyphicon.glyphicon-pause").hide();
			activeRows.removeClass("active");
			
			$(row).addClass("active");

			if(mtp.view._player.paused){
				$(row).find(".glyphicon.glyphicon-pause").show();
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
			var tagsString = mtp.view._stringifyTagArr(tags);
			
			var musicRow = '<tr musicID="' + id + '" class="row" onclick="mtp.view.play(this, event);">';
			musicRow += '<td class="col-xs-1"><span class="glyphicon glyphicon-volume-up" style="display:none;"></span><span class="glyphicon glyphicon-pause" style="display:none;"></span></td>';
			musicRow += '<td class="col-xs-4 musicName">';
			musicRow += name;
			musicRow += ' <input type="hidden" class="path" style="display:none" value="' + path + '"/>';
			musicRow += '</td>';
			musicRow += '<td class="col-xs-6 musicTags">' + tagsString + '</td>';
			musicRow += '<td class="col-xs-1 musicButtons"><button class="btn btn-default btn-sm" data-toggle="modal" data-target="#modalTags" onClick="mtp.view.initModalTags(this);"><span class="glyphicon glyphicon-tags"></span></button></td>';
			musicRow += '</tr>';
			return musicRow;
		},
		_buildTagLI : function(tag){
			var tagLI = "<li class=\"list-group-item\" onmouseover=\"$(this).find('div.iconGroup').show()\" onmouseout=\"$(this).find('div.iconGroup').hide()\">";
			tagLI += "<strong>" + tag + "</strong>";
			tagLI += '<div class="pull-right iconGroup" style="margin-top: 3px; display: none;">';
			tagLI += "<span class=\"glyphicon glyphicon-thumbs-down\" style=\"cursor:pointer\" onclick=\"mtp.view.addUsedTag($(this).parentsUntil('li').parent('li'), true)\"></span>";
			tagLI += " <span class=\"glyphicon glyphicon-thumbs-up\" style=\"cursor:pointer\" onclick=\"mtp.view.addUsedTag($(this).parentsUntil('li').parent('li'), false)\"></span>";
			tagLI += "</div>";
			tagLI += "</li>";
			return tagLI;
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
			var tagsArr = mtp.view._parseTagsStr(tagsStr);
			var beautyTagsStr = mtp.view._stringifyTagArr(tagsArr);
			
			mtp.view._refreshMusicTags(musicID, tagsArr);
			$("#musicsTable").find("tr[musicID=" + musicID + "] .musicTags").text(beautyTagsStr);
		},
		_parseTagsStr : function(tagsStr){
			var tagsArr = tagsStr.split(/[,\n]/g);
			mtp.view._beautifyStrArr(tagsArr);
			tagsArr.sort();
			return tagsArr;
		},
		_stringifyTagArr : function(tagsArr){
			var tagsString = "";
			if(tagsArr && tagsArr.length > 0){
				mtp.view._beautifyStrArr(tagsArr);
				tagsArr = $.grep(tagsArr,function(n){ return(n) });
				tagsArr = $.unique(tagsArr);
				tagsArr.sort();
				tagsString = tagsArr.join(", ");
			}
			
			return tagsString;
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

$('#modalTags').on('shown.bs.modal', function () {
    $("#modalTags #tagsText").focus(); 
	$("#modalTags #tagsText").select();
});

mtp.view.startLoading();