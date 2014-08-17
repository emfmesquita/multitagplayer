if(typeof mtp == 'undefined') mtp = {};
(function() {
	mtp.file = {
		C : {
			NEW_CONFIG_FILE : "New Config File"
		},
		loadedFile : null,
		loadedFileName : null,
		loadedFileID : null,
		newFile : function(){
			mtp.file.loadedFile = {};
			mtp.file.loadedFile.tags = [];
			mtp.file.loadedFile.musics = {};
			mtp.file.loadedFileName = mtp.file.C.NEW_CONFIG_FILE;
		},
		isFileLoaded : function(){
			return mtp.file.loadedFile != null;
		},
		loadFile : function(id){
			var request = gapi.client.drive.files.get({
				fileId: id
			});
			request.execute(function(file){
				mtp.file.loadedFileName = file.title;
				mtp.file.loadedFileID = id;

				var xhr = new XMLHttpRequest();
				var accessToken = gapi.auth.getToken().access_token;
				xhr.open('GET', file.downloadUrl);
				xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
				xhr.onload = function() {
					mtp.file.loadedFile = JSON.parse(xhr.responseText);
				};
				xhr.send();
			});
		},
		saveFile : function(callback){
			var name = mtp.file.loadedFileName;
			var content = JSON.stringify(mtp.file.loadedFile);
			var id = mtp.file.loadedFileID;
			var idCallback = function(file){
				mtp.file.loadedFileID = file.id;
			}
			mtp.file._innerInserFile(name, content, id, idCallback);
		},
		hasFileTag : function(tag){
			if(!tag) return false;
			var cleanTag = tag.toLowerCase().trim();
			var index = jQuery.inArray(cleanTag, mtp.file.loadedFile.tags);
			return index != -1;
		},
		addFileTag : function(tag){
			if(!tag) return;
			var cleanTag = tag.toLowerCase().trim();
			if(mtp.file.hasFileTag(cleanTag)) return;
			mtp.file.loadedFile.tags.push(cleanTag);
		},
		getMusic : function(id){
			return mtp.file.loadedFile.musics[id];
		},
		hasMusicTag : function(music, tag){
			if(!tag) return false;
			var cleanTag = tag.toLowerCase().trim();
			var index = jQuery.inArray(cleanTag, music.tags);
			return index != -1;
		},
		addMusic : function(id, name, tags){
			if(!id) return false;
			var music = mtp.file.getMusic(id);
			if(music) return false;

			music = {};
			music.id = id;
			music.name = name;
			music.tags = [];
			if(tags && tags.length > 0){
				jQuery.each(tags, function(index, tag){
					mtp.file.addFileTag(cleanTag);
					mtp.file._innerAddMusicTag(music, cleanTag);
				});
			}

			mtp.file.loadedFile.musics[id] = music;
			return true;
		},
		addMusicTag : function(id, tag){
			if(!id) return;
			var music = mtp.file.getMusic(id);
			if(music) return;
			mtp.file._innerAddMusicTag(music, tag);
		},
		_innerAddMusicTag : function(music, tag){
			if(!tag) return;
			var cleanTag = tag.toLowerCase().trim();
			if(mtp.file.hasMusicTag(music, cleanTag)) return;
			music.tags.push(cleanTag);
		},
		_innerInserFile : function(name, content, id, callback){
			const boundary = '-------314159265358979323846';
			const delimiter = "\r\n--" + boundary + "\r\n";
			const close_delim = "\r\n--" + boundary + "--";

			var contentType = "application/json";
			var metadata = {
				title: name,
				mimeType: contentType,
				description: "Config file for MultiTag Player"
			};
			var base64Data = btoa(content);
			var multipartRequestBody =
					delimiter +
					'Content-Type: application/json\r\n\r\n' +
					JSON.stringify(metadata) +
					delimiter +
					'Content-Type: ' + contentType + '\r\n' +
					'Content-Transfer-Encoding: base64\r\n' +
					'\r\n' +
					base64Data +
					close_delim;

			var reqBody = {
				'params': {'uploadType': 'multipart'},
				'headers': {
					'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
				},
				'body': multipartRequestBody
			};

			if(id){
				reqBody.method = "PUT";
				reqBody.path = '/upload/drive/v2/files/' + id;
			}else{
				reqBody.method = "POST";
				reqBody.path = '/upload/drive/v2/files'
			}

			var request = gapi.client.request(reqBody);
			request.execute(callback);
		}
	}
} ());

