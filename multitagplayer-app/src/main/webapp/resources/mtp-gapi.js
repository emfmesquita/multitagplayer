if(typeof mtp == 'undefined') mtp = {};
(function() {
	mtp.gapi = {
		// The API developer key obtained from the Google Developers Console.
		developerKey : 'AIzaSyBdGhwHGGPjudzKOiIlbbWuOsatbYDsOBc',
		clientId : '1005266131738-tdv38pudoj50a5jgmbr6khoo3f9fj6pv.apps.googleusercontent.com', // heroko
		clientIdLocal : '1005266131738-ila30a9vn0camq1k1v2mlvpagn2do5lf.apps.googleusercontent.com', // local
		// Scope to use to access user's files.
		scopes : ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.readonly.metadata'].join(' '),
		oauthToken : null,
		_pickerApiLoaded : false,
		_clientAPILoaded : false,
		_clientAPIAuthed : false,
		_driveAPILoaded : false,
		_fileAPILoaded : false,
		init : function(){
			mtp.gapi.oauthToken = mtp.cookies.getOauth();

			// se n tiver token autentica
			if(!mtp.gapi.oauthToken){
				mtp.gapi._auth();
			}
			
			mtp.picker.init();
			// se tiver inicia as outras apis
			if(mtp.gapi._clientAPILoaded && !mtp.gapi._clientAPIAuthed){
				mtp.gapi._authClientAPI();
				if(mtp.gapi._driveAPILoaded){
					mtp.file.init();
				}
			}
		},
		logOut : function(){
			mtp.cookies.eraseOauth();
			mtp.gapi.oauthToken = null;
			mtp.gapi._auth();
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
				mtp.cookies.storeOauth(mtp.gapi.oauthToken, 59);
				window.location.hash = "";
			}
		},
		_getAuthURL : function(){
			var protocol = "https:";
			var rightId = null;
			if(location.hostname == "localhost"){
				rightId = mtp.gapi.clientIdLocal;
				protocol = location.protocol;
			}
			else{
				rightId = mtp.gapi.clientId;
			}
			var redirect = encodeURIComponent(protocol + '//' + location.host + location.pathname);

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
		}
	}
} ());

var mtpGapiOnApiLoad = function(){
	gapi.load('picker', {'callback': mtp.picker.onPickerApiLoad});
}
var mtpGapiOnClientApiLoad = function() {
	mtp.gapi._clientAPILoaded = true;
	gapi.client.load('drive', 'v2', function(){
		mtp.gapi._driveAPILoaded = true;
		if(!mtp.gapi.oauthToken){
			return;
		}
		if(!mtp.gapi._clientAPIAuthed){
			mtp.gapi._authClientAPI();
		}
		mtp.file.init();
	});
}