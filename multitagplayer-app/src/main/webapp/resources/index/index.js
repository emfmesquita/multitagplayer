var player = null;
var currentPath = null;

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

var tagMatcher = function(strs) {
	return function findMatches(q, cb) {
		var matches, substringRegex;
	 
	    // an array that will be populated with substring matches
	    matches = [];
	 
	    // regex used to determine if a string contains the substring `q`
	    substrRegex = new RegExp(q, 'i');
	 
	    // iterate through the pool of strings and for any string that
	    // contains the substring `q`, add it to the `matches` array
	    $.each(strs, function(i, str) {
	    	if (substrRegex.test(str)) {
	    		// the typeahead jQuery plugin expects suggestions to a
	    		// JavaScript object, refer to typeahead docs for more info
	    		matches.push({ value: str });
	    	}
	    });
	 
	    cb(matches);
	};
};
	 
$('#tag-autocomplete .typeahead').typeahead({
	hint: true,
	highlight: true,
	minLength: 1
},
{
	name: 'tags',
	displayKey: 'value',
	source: tagMatcher(states)
});