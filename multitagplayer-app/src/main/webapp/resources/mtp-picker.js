if(typeof mtp == 'undefined') mtp = {};
(function() {
	mtp.picker = {
		_pickerApiLoaded : false,
		_musicPicker : null,
		_musicMimeTypes : "audio/mpeg3,audio/x-mpeg-3,video/x-mpeg,audio/mp3,audio/mpeg,audio/mp4,audio/mpg,audio/mp4a-latm,audio/ogg,application/ogg,audio/webm,audio/wav,audio/x-wav,audio/wave",
		_configPicker : null,
		_configMimeTypes : "application/json,application/multitagplayer",
		init : function(){
			if(mtp.gapi.oauthToken && mtp.picker._pickerApiLoaded 
				&& (!mtp.picker._musicPicker || !mtp.picker._configPicker)){
				mtp.picker._createPickers();
			}
		},
		onPickerApiLoad : function() {
			mtp.picker._pickerApiLoaded = true;
			if(mtp.gapi.oauthToken){
				mtp.picker._createPickers();
			}
		},
		openMusicPicker : function(){
			mtp.picker._musicPicker.setVisible(true);
		},
		openConfigPicker : function(){
			mtp.picker._configPicker.setVisible(true);
		},
		_createPickers : function() {
			var views = mtp.picker._getMusicPickerViews();

			mtp.picker._musicPicker = new google.picker.PickerBuilder().
				addView(views[0]).
				addView(views[1]).
				addView(views[2]).
				addView(views[3]).
				setTitle("Select musics").
				setOAuthToken(mtp.gapi.oauthToken).
				setDeveloperKey(mtp.gapi.developerKey).
				setCallback(mtp.picker._musicPickerCallback).
				enableFeature(google.picker.Feature.MULTISELECT_ENABLED).
				build();

			views = mtp.picker._getConfigPickerViews();
			mtp.picker._configPicker = new google.picker.PickerBuilder().
				addView(views[0]).
				addView(views[1]).
				addView(views[2]).
				addView(views[3]).
				setTitle("Select a config file").
				setOAuthToken(mtp.gapi.oauthToken).
				setDeveloperKey(mtp.gapi.developerKey).
				setCallback(mtp.picker._configPickerCallback).
				build();
		},
		_getMusicPickerViews : function(){
			var view1 = new google.picker.DocsView();
			view1.setMimeTypes(mtp.picker._musicMimeTypes);
			view1.setLabel("All Songs");

			var view2 = new google.picker.DocsView();
			view2.setMimeTypes(mtp.picker._musicMimeTypes);
			view2.setIncludeFolders(true);
			view2.setParent("root");
			view2.setLabel("My Drive");

			var view3 = new google.picker.DocsView();
			view3.setMimeTypes(mtp.picker._musicMimeTypes);
			view3.setIncludeFolders(true);
			view3.setOwnedByMe(false);
			view3.setLabel("Shared With Me");

			var view4 = new google.picker.DocsView(google.picker.ViewId.RECENTLY_PICKED);
			view4.setLabel("Recently Picked");

			return [view1, view2, view3, view4];
		},
		_getConfigPickerViews : function(){
			var view1 = new google.picker.DocsView();
			view1.setMimeTypes(mtp.picker._configMimeTypes);
			view1.setLabel("Possible Configs");

			var view2 = new google.picker.DocsView();
			view2.setMimeTypes(mtp.picker._configMimeTypes);
			view2.setIncludeFolders(true);
			view2.setParent("root");
			view2.setLabel("My Drive");

			var view3 = new google.picker.DocsView();
			view3.setMimeTypes(mtp.picker._configMimeTypes);
			view3.setIncludeFolders(true);
			view3.setOwnedByMe(false);
			view3.setLabel("Shared With Me");

			var view4 = new google.picker.DocsView(google.picker.ViewId.RECENTLY_PICKED);
			view4.setLabel("Recently Picked");

			return [view1, view2, view3, view4];
		},
		_musicPickerCallback : function(data) {
			if(data[google.picker.Response.ACTION] != google.picker.Action.PICKED){
				return;
			}

			var docs = data[google.picker.Response.DOCUMENTS];
			if(!docs || docs.length == 0){
				return;
			}

			$.each(docs, function(index, doc){
				var id = doc[google.picker.Document.ID];
				if(!id){
					return;
				}
				mtp.file.addMusic(id);
			});
		},
		_configPickerCallback : function(data) {
			var id = null;
			if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
				var doc = data[google.picker.Response.DOCUMENTS][0];
				id = doc[google.picker.Document.ID];
			}
			if(!id){
				return;
			}
			mtp.cookies.eraseUsedTags();
			mtp.file.loadFile(id);
		}
	}
} ());