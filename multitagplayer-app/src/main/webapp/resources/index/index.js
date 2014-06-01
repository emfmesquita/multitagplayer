var player = null;
var currentPath = null;

$("#tagsList, body").mCustomScrollbar({
    theme: "minimal"
});

var init = function(){
	$('#player').mediaelementplayer({
		success: function(mediaElement, originalNode) {
    		player = mediaElement;
			player.setSrc("");
		},
		audioWidth : 500,
		features: ['playpause','current','progress','duration','volume']
	});
};

var clearAutoComplete = function(button){
	$(button).parentsUntil('div').parent().children('input').val('');
}

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
}

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

