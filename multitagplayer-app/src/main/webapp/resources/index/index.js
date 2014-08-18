var player = null;
var currentPath = null;
var tags= null;
var usedTags = null;

var tagTemplate = "<strong>&TAG&</strong><span class='glyphicon glyphicon-thumbs-down' onclick='addTag($(this).parent(), true)'/><span class='glyphicon glyphicon-thumbs-up' onclick='addTag($(this).parent(), false)'/>";
var tagTemplVar1 = "&TAG&"; 

var usedTagTemplate = "<div onclick='removeUsedTag(this);' class='label label-&EXCLUSION& usedTag'>&TAG& &times;</div>";
var usedTagTemplVar1 = "&TAG&";
var usedTagTemplVar2 = "&EXCLUSION&";


$(document).ajaxStart(function(){
	$("#wait").css("display","table-cell");
});
$(document).ajaxComplete(function(){
	$("#wait").css("display","none");
});


$("#tagsList, body").mCustomScrollbar({
    theme: "minimal"
});

var init = function(tagsList){
	tags = tagsList;
	usedTags = [];
	
	$('#player').mediaelementplayer({
		success: function(mediaElement, originalNode) {
    		player = mediaElement;
			player.setSrc("");
		},
		loop: true,
		features: ['playpause','loop','current','progress','duration','volume']
	});
};

var clearAutoComplete = function(button){
	$(button).parentsUntil('div').parent().children('input').val('');
	$("#tagsList").find("li").show();
};

var play = function(item){
	selectRow(item);
	var path = $(item).find(".path").val();
	if(!path || currentPath == path){
		return;
	}
	currentPath = path;
	player.pause();
	player.setSrc(path);
	player.play();
};

var selectRow = function(row){
	var activeRows = $(row).parentsUntil("table").find("tr.active");
	activeRows.find(".glyphicon.glyphicon-volume-up").hide();
	activeRows.removeClass("active");
	
	$(row).addClass("active");
	$(row).find(".glyphicon.glyphicon-volume-up").show();
};

var save = function(){
	var name = $('#newMusicName').val();
	var path = $('#newMusicPath').val();
	$.post('music/save', 
		{ name : name , path : path},
		function(response) {
			console.log('saved');
		}
	);
};

var refreshTagList = function(tagsList) {
	$('#tagsList').fadeOut("slow");
	$('#tagsList').load('ajax/tagsList.jsp', {tags: tagsList});
	$('#tagsList').fadeIn("slow");
}

//TODO:Atualizar footer com nome do arquivo carregado

var filterTagList = function(str, tagsList){
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
};

var fillUsedTagTemplate = function(tag, exclusion){
	var filledUsedTagTempl = usedTagTemplate.replace(usedTagTemplVar1, tag);
	return filledUsedTagTempl.replace(usedTagTemplVar2, exclusion? "danger" : "success");
};

var fillTagTemplate = function(tag){
	return tagTemplate.replace(tagTemplVar1, tag);
};

var addUsedTag = function(tagElement, exclusion){
	var tagText = $(tagElement).text().trim();
	usedTags.push(tagText);
	if(usedTags.length == 1){
		$("#usedTagsElement").show();
	}
	
	//TODO: filter music list
	
	$("#usedTagsElement").append(fillUsedTagTemplate(tagText, exclusion)); //TODO: place in list ordered by name
	$(tagElement).addClass("hidden");
};


var removeUsedTag = function(usedtagElement){
	var tagText = $(usedtagElement).text().replace(/.$/g, "").trim();
	usedTags.splice(usedTags.indexOf(tagText), 1);
	if(usedTags.length == 0){
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
};

var enableSaveButton = function(){
	jQuery("#saveButton").attr("disabled", false);
}

var enableAddMusicButton = function(){
	jQuery("#addMusicButton").attr("disabled", false);
}
