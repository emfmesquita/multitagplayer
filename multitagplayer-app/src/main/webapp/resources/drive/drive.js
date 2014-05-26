// The API developer key obtained from the Google Developers Console.
var developerKey = 'AIzaSyB4OD8l3nKAOUlYX6mz8sisQTFKxLJfr0U';

// The Client ID obtained from the Google Developers Console.
var clientId = '1005266131738-tdv38pudoj50a5jgmbr6khoo3f9fj6pv.apps.googleusercontent.com';

// Scope to use to access user's photos.
var scopes = ['https://www.googleapis.com/auth/photos', 'https://www.googleapis.com/auth/drive'].join(' ');

var pickerApiLoaded = false;
var clientAPILoaded = false;
var clientAPIAuthed = false;

var filePicker = null;
var player = null;
var currentId = null;
var oauthToken = null;

var onApiLoad = function() {
	gapi.load('picker', {'callback': onPickerApiLoad});
}

var onClientApiLoad = function() {
	clientAPILoaded = true;
	gapi.client.load('drive', 'v2');
	if(oauthToken){
		authClientAPI();
	}
}

var getAuthURL = function(){
	var redirect = encodeURIComponent(location.protocol + '//' + location.host + location.pathname)

	return "https://accounts.google.com/o/oauth2/auth?"
			+ "redirect_uri=" + redirect
			+ "&response_type=token"
			+ "&client_id=" + encodeURIComponent(clientId)
			+ "&scope=" + encodeURIComponent(scopes);
}

function onPickerApiLoad() {
	pickerApiLoaded = true;
	if(oauthToken){
		createPicker();
	}
}

var authClientAPI = function(){
	clientAPIAuthed = true;
	var oauthTokenObject = new Object();
    oauthTokenObject.access_token = oauthToken;
    oauthTokenObject.token_type = "Bearer";
    oauthTokenObject.expires_in = "3600";
    gapi.auth.setToken(oauthTokenObject);
}

// List of supported MIME Types.
var supportedMimeType = "audio/mpeg3,audio/x-mpeg-3,video/x-mpeg,audio/mp3,audio/mpeg,audio/mp4,audio/mpg,audio/mp4a-latm,audio/ogg,audio/webm,audio/wav,audio/x-wav,audio/wave";

// Create and render a Picker object for picking user Photos.
function createPicker() {
	if (pickerApiLoaded && oauthToken) {
		// Search Songs in Drive View.
		var view = new google.picker.DocsView();
		view.setMimeTypes(supportedMimeType);

		filePicker = new google.picker.PickerBuilder().
			addView(view).
			setOAuthToken(oauthToken).
			setDeveloperKey(developerKey).
			setCallback(pickerCallback).
			build();
	}
}

function openPicker(){
	filePicker.setVisible(true);
}

var play = function(id){
	if(!id || currentId == id){
		return;
	}
	var request = gapi.client.drive.files.get({
		'fileId': id
	});
	request.execute(function(resp) {
		var path = resp["webContentLink"];
		if(path){
			currentId = id;
		}
		player.pause();
		player.setSrc(path);
		player.play();
	});
}

// A simple callback implementation.
function pickerCallback(data) {
	var id = null;
	if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
		var doc = data[google.picker.Response.DOCUMENTS][0];
		id = doc[google.picker.Document.ID];
	}
	play(id);
}

var initMediaElement = function(){
	$('#player').mediaelementplayer({
		success: function(mediaElement, originalNode) {
				player = mediaElement;
			player.setSrc("");
		},
		audioWidth : 500,
		features: ['playpause','current','progress','duration','volume']
	});
};


var init = function(){
	if(!oauthToken){
 		auth();
 	}

 	if(oauthToken){
 		initMediaElement();
 	}

 	if(oauthToken && pickerApiLoaded && !filePicker){
 		createPicker();
 	}

 	if(oauthToken && clientAPILoaded && !clientAPIAuthed){
 		authClientAPI();
 	}
}

var auth = function(){
	var params = {};
	var queryString = location.hash.substring(1);
	var regex = /([^&=]+)=([^&]*)/g;
	var m;
	while (m = regex.exec(queryString)) {
		params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
	}
	oauthToken = params['access_token'];

	if(!oauthToken){
		window.location.href = getAuthURL();
	}
	else{
		window.location.hash = "";
	}
}