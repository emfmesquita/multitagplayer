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
			mtp.file._innerUpdateFile();
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
					mtp.file._innerUpdateFile();
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
		addMusic : function(id, tags){
			if(!id) return false;
			var music = mtp.file._getMusic(id);
			if(music) return false;

			music = {};
			music.id = id;
			music.tags = [];
			if(tags && tags.length > 0){
				jQuery.each(tags, function(index, tag){
					mtp.file._addFileTag(tag);
					mtp.file._innerAddMusicTag(music, tag);
				});
			}

			mtp.file.loadedFile.musics[id] = music;
			return true;
		},
		removeMusic : function(id){
			if(!id) return false;
			var music = mtp.file._getMusic(id);
			if(!music) return false;

			var musicTags = music.tags;
			delete mtp.file.loadedFile.musics[id];
			mtp.file._cleanFileTags(musicTags);
			return true;
		},
		addMusicTag : function(id, tag){
			if(!id) return;
			var music = mtp.file._getMusic(id);
			if(!music) return;
			mtp.file._innerAddMusicTag(music, tag);
		},
		removeMusicTag : function(id, tag){
			if(!id) return;
			var music = mtp.file._getMusic(id);
			if(!music) return;
			var index = mtp.file._getMusicTagIndex(music, tag);
			if(index == -1){
				return;
			}
			music.tags.splice(index, 1);
			mtp.file._cleanFileTags([tag]);
		},
		getFileTags : function(){
			return mtp.file.loadedFile.tags;
		},
		getMusicTags : function(id){
			if(!id){
				return [];
			}
			var music = mtp.file._getMusic(id);
			if(!music){
				return [];
			}
			return music.tags;
		},
		searchMusics : function(hasTags, hasNotTags){
			var nullHas = !hasTags || hasTags.length <= 0;
			var nullHasNot = !hasNotTags || hasNotTags.length <= 0;
			if(nullHas && nullHasNot){
				return mtp.file.loadedFile.musics;
			}

			var result = {};
			var musics = mtp.file.loadedFile.musics;
			jQuery.each(musics, function(index, music){
				var hasFailure = false;
				var hasNotFailure = false;

				if(!nullHas){
					jQuery.each(hasTags, function(index, tag){
						if(!mtp.file._hasMusicTag(music, tag)){
							hasFailure = true;
							return false;
						}
					});
				}
				if(hasFailure){
					return;
				}

				if(!nullHasNot){
					jQuery.each(hasNotTags, function(index, tag){
						if(mtp.file._hasMusicTag(music, tag)){
							hasNotFailure = true;
							return false;
						}
					});
				}
				if(hasNotFailure){
					return;
				}

				result[music.id] = music;
			});
			return result;
		},
		// verifica se as tags fornecidas estao sendo usadas
		// caso n estejam sao removidas das tags do arquivo
		_cleanFileTags : function(tags){
			if(!tags || tags.length <= 0){
				return;
			}

			var musics = mtp.file.loadedFile.musics;
			var toVerifyTags = {};

			jQuery.each(tags, function(index, tag){
				toVerifyTags[tag] = tag;
			});

			jQuery.each(musics, function(index, music){
				jQuery.each(Object.keys(toVerifyTags), function(index, tag){
					if(mtp.file._hasMusicTag(music, tag)){
						delete toVerifyTags[tag];
						return false;
					}
				});
				if(Object.keys(toVerifyTags).length <= 0){
					return false;
				}
			});

			jQuery.each(Object.keys(toVerifyTags), function(index, tag){
				mtp.file._removeFileTag(tag);
			});
		},
		_removeFileTag : function(tag){
			var index = mtp.file._getFileTagIndex(tag);
			if(index == -1){
				return;
			}
			mtp.file.loadedFile.tags.splice(index, 1);
		},
		_hasFileTag : function(tag){
			var index = mtp.file._getFileTagIndex(tag);
			return index != -1;
		},
		_getFileTagIndex : function(tag){
			if(!tag) return -1;
			var cleanTag = tag.toLowerCase().trim();
			return jQuery.inArray(cleanTag, mtp.file.loadedFile.tags);
		},
		_getMusic : function(id){
			return mtp.file.loadedFile.musics[id];
		},
		_addFileTag : function(tag){
			if(!tag) return;
			var cleanTag = tag.toLowerCase().trim();
			if(mtp.file._hasFileTag(cleanTag)) return;
			mtp.file.loadedFile.tags.push(cleanTag);
		},
		_innerAddMusicTag : function(music, tag){
			if(!tag) return;
			var cleanTag = tag.toLowerCase().trim();
			if(mtp.file._hasMusicTag(music, cleanTag)) return;
			music.tags.push(cleanTag);
		},
		_hasMusicTag : function(music, tag){
			var index = mtp.file._getMusicTagIndex(music, tag);
			return index != -1;
		},
		_getMusicTagIndex : function(music, tag){
			if(!tag) return -1;
			var cleanTag = tag.toLowerCase().trim();
			return jQuery.inArray(cleanTag, music.tags);
		},
		_innerUpdateFile : function(){
			refreshTagList(mtp.file.getFileTags());
			enableSaveButton();
			enableAddMusicButton();
			updateFileName(mtp.file.loadedFileName);
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

