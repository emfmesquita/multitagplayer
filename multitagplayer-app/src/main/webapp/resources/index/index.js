var multyTagSound = null;

var init = function(){
	$('#musicSlider').slider();
}

var updateSlider = function(percent){
	if(percent) $('#musicSlider').slider('setValue', percent);
}

var resetSlider = function(){
	$('#musicSlider').slider('setValue', 0);
}

var play = function(item){
	var path = $(item).find(".path").val();
	if(!path){
		return;
	}
	if(multyTagSound){
		multyTagSound.stop();
	}
	resetSlider();
	console.log(path);
	multyTagSound = new buzz.sound(path);
	multyTagSound.bind("progress", function(e){
		var percent = buzz.toPercent( this.getTime(), this.getDuration(), true );
		updateSlider(percent);
	});
	multyTagSound.play();
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
}