if(typeof mtp == 'undefined') mtp = {};
(function() {
	mtp.cookies = {
		C : {
			OAUTH_C_KEY : "G_OAUTH_TOKEN",
			CONFIG_C_KEY : "MTP_CONFIG_ID"
		},
		getOauth : function(){
			return mtp.cookies._readCookie(mtp.cookies.C.OAUTH_C_KEY);
		},
		storeOauth : function(token, minutes){
			mtp.cookies._createCookie(mtp.cookies.C.OAUTH_C_KEY, token, minutes);
		},
		getConfigID : function(){
			return mtp.cookies._readCookie(mtp.cookies.C.CONFIG_C_KEY);
		},
		eraseConfigID : function(){
			mtp.cookies._eraseCookie(mtp.cookies.C.CONFIG_C_KEY);
		},
		storeConfigID : function(configID){
			mtp.cookies._createCookie(mtp.cookies.C.CONFIG_C_KEY, configID);
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
			mtp.gapi.createCookie(name,"",-1);
		}
	}
} ());