if(typeof mtp == 'undefined') mtp = {};
(function() {
	mtp.gapi = {
		C : {
			OAUTH_C_KEY : "G_OAUTH_TOKEN"
		},
		// The API developer key obtained from the Google Developers Console.
		developerKey : 'AIzaSyB4OD8l3nKAOUlYX6mz8sisQTFKxLJfr0U',
		clientId : '1005266131738-tdv38pudoj50a5jgmbr6khoo3f9fj6pv.apps.googleusercontent.com', // heroko
		clientIdLocal : '1005266131738-3hcds8n24ubv16rmls7vlktd9q1hjj98.apps.googleusercontent.com', // local
		// Scope to use to access user's files.
		scopes : ['https://www.googleapis.com/auth/drive'].join(' '),
		oauthToken : null,
		_pickerApiLoaded : false,
		_clientAPILoaded : false,
		_clientAPIAuthed : false,
		init : function(){
			mtp.gapi.oauthToken = mtp.gapi._readCookie(mtp.gapi.C.OAUTH_C_KEY);

			if(!mtp.gapi.oauthToken){
				mtp.gapi._auth();
			}
			mtp.picker.init();
			if(mtp.gapi.oauthToken && mtp.gapi._clientAPILoaded && !mtp.gapi._clientAPIAuthed){
				mtp.gapi._authClientAPI();
			}
		},
		_auth : function(){
			var params = {};
			var queryString = location.hash.substring(1);
			var regex = /([^&=]+)=([^&]*)/g;
			var m;
			while (m = regex.exec(queryString)) {
				params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
			}
			mtp.gapi.oauthToken = params['access_token'];

			if(!mtp.gapi.oauthToken){
				window.location.href = mtp.gapi._getAuthURL();
			}
			else{
				mtp.gapi._createCookie(mtp.gapi.C.OAUTH_C_KEY, mtp.gapi.oauthToken, 59);
				window.location.hash = "";
			}
		},
		_getAuthURL : function(){
			var redirect = encodeURIComponent(location.protocol + '//' + location.host + location.pathname);
			var rightId = null;
			if(location.hostname == "localhost"){
				rightId = mtp.gapi.clientIdLocal;
			}
			else{
				rightId = mtp.gapi.clientId;
			}

			return "https://accounts.google.com/o/oauth2/auth?"
					+ "redirect_uri=" + redirect
					+ "&response_type=token"
					+ "&client_id=" + encodeURIComponent(rightId)
					+ "&scope=" + encodeURIComponent(mtp.gapi.scopes);
		},
		_authClientAPI : function(){
			mtp.gapi._clientAPIAuthed = true;
			var oauthTokenObject = new Object();
			oauthTokenObject.access_token = mtp.gapi.oauthToken;
			oauthTokenObject.token_type = "Bearer";
			oauthTokenObject.expires_in = "3600";
			gapi.auth.setToken(oauthTokenObject);
		},
		_createCookie : function(name,value,minutes) {
			if (minutes){
				var date = new Date();
				date.setTime(date.getTime()+(minutes*60*1000));
				var expires = "; expires="+date.toGMTString();
			}
			else{
				var expires = "";
			}
			document.cookie = name+"="+value+expires+"; path=/";
		},
		_readCookie : function(name) {
			var nameEQ = name + "=";
			var ca = document.cookie.split(';');
			for(var i=0;i < ca.length;i++) {
				var c = ca[i];
				while (c.charAt(0)==' ') c = c.substring(1,c.length);
				if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
			}
			return null;
		},
		_eraseCookie : function(name) {
			mtp.gapi._createCookie(name,"",-1);
		}
	}
} ());

var mtpGapiOnApiLoad = function(){
	gapi.load('picker', {'callback': mtp.picker.onPickerApiLoad});
}
var mtpGapiOnClientApiLoad = function() {
	mtp.gapi._clientAPILoaded = true;
	gapi.client.load('drive', 'v2');
	if(mtp.gapi.oauthToken){
		mtp.gapi._authClientAPI();
	}
}