if(typeof mtp == 'undefined') mtp = {};
(function() {
	mtp.file = {
		C : {
			NEW_CONFIG_FILE : "New Config File"
		},
		// o arquivo de config carregado atualmente
		loadedFile : null,
		// o nome do arquivo de config carregado atualmente
		loadedFileName : null,
		// o id do gdrive do arquivo de config carregado atualmente
		loadedFileID : null,
		_fileAPILoaded : false,
		init : function(){
			if(mtp.file._fileAPILoaded){
				mtp.view.endLoading();
				return;
			}

			mtp.file._fileAPILoaded = true;
			var configID = mtp.cookies.getConfigID();
			if(!configID){
				mtp.view.endLoading();
				return;
			}
			mtp.file.loadFile(configID, true);
		},
		// cria um arquivo de config novo
		newFile : function(){
			mtp.file.loadedFile = {};
			mtp.file.loadedFile.tags = [];
			mtp.file.loadedFile.musics = {};
			mtp.file.loadedFileName = mtp.file.C.NEW_CONFIG_FILE;
			mtp.file.loadedFileID = null;
			mtp.cookies.eraseUsedTags();
			mtp.cookies.eraseConfigID();
			mtp.file._innerUpdateFile();
		},
		// true se tiver um arquivo de config carregado
		isFileLoaded : function(){
			return mtp.file.loadedFile != null;
		},
		// carrega um arquivo de gonfig dado o id do google
		loadFile : function(id, eraseCookieInFail){
			mtp.view.startLoading();
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
					try{
						var parsedFile = JSON.parse(xhr.responseText);
						mtp.file.loadedFile = parsedFile;
						mtp.file._innerUpdateFile();
						mtp.cookies.storeConfigID(id);
					}catch(err) {
						mtp.file._loadConfigError(eraseCookieInFail);
					}
				};
				xhr.onError = function(){
					mtp.file._loadConfigError(eraseCookieInFail);
				};
				xhr.send();
			});
		},
		// salva no gdrive o arquivo de config carregado atualmente
		saveFile : function(callback){
			mtp.view.startLoading();
			var name = mtp.file.loadedFileName;
			var content = JSON.stringify(mtp.file.loadedFile);
			var id = mtp.file.loadedFileID;
			var idCallback = function(file){
				mtp.file.loadedFileID = file.id;
				mtp.cookies.storeConfigID(file.id);
				mtp.view.endLoading();
			}
			mtp.file._innerInserFile(name, content, id, idCallback);
		},
		// se o arquivo de config possui a tag fornecida
		hasFileTag : function(tag){
			var index = mtp.file._getFileTagIndex(tag);
			return index != -1;
		},
		// callback do picker de musicas
		addMusic : function(id){
			if(mtp.view.isMusicVisible(id)){
				return;
			}
			
			mtp.view.startLoading();
			mtp.file.getMusic(id, function(music){
				mtp.file._addMusicToConfig(id);
				mtp.view.addMusic(id, music.name, music.link, music.tags);
				mtp.view.endLoading();
			});
		},
		// remove uma musica dado o id do google
		removeMusic : function(id){
			if(!id) return false;
			var music = mtp.file._getMusicFromConfig(id);
			if(!music) return false;

			var musicTags = music.tags;
			delete mtp.file.loadedFile.musics[id];
			mtp.file._cleanFileTags(musicTags);
			return true;
		},
		// adiciona uma tag a uma musica
		addMusicTag : function(id, tag){
			if(!id) return false;
			var music = mtp.file._getMusicFromConfig(id);
			if(!music) return false;
			return mtp.file._innerAddMusicTag(music, tag);
		},
		// retorna os dados de uma musica
		getMusic : function(id, callback){
			if(!id){
				callback(null);
				return;
			}

			var music = {};
			music.id = id;

			var existingMusic = mtp.file._getMusicFromConfig(id);
			if(existingMusic){
				music.tags = existingMusic.tags.slice(0);
			}

			var request = gapi.client.drive.files.get({
				fileId: id
			});

			request.execute(function(file){
				music.name = file.title;
				music.link = file.webContentLink;

				if(callback){
					callback(music);
				}
			});
		},
		// remove uma tag de uma musica
		// retorna true se a tag foi removida do arquivo
		removeMusicTag : function(id, tag){
			if(!id) return false;
			var music = mtp.file._getMusicFromConfig(id);
			if(!music) return false;
			var index = mtp.file._getMusicTagIndex(music, tag);
			if(index == -1){
				return false;
			}
			music.tags.splice(index, 1);
			var removedTags = mtp.file._cleanFileTags([tag]);
			return removedTags.indexOf(tag) != -1;
		},
		// retorna a lista de tags do arquivo de config
		getFileTags : function(){
			var tags = mtp.file.loadedFile.tags;
			if(!tags || tags.length <= 0){
				return [];
			}
			mtp.file.loadedFile.tags = tags.sort();
			return mtp.file.loadedFile.tags.slice(0);
		},
		// recupera as tags de uma music
		getMusicTags : function(id){
			if(!id) return [];
			var music = mtp.file._getMusicFromConfig(id);
			if(!music) return [];
			return music.tags.slice(0);
		},
		// busca musicas com as tags fornecidas
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
		// caso n estejam sao removidas das tags do arquivo de config
		// retorna um array com as tags que foram removidas
		_cleanFileTags : function(tags){
			if(!tags || tags.length <= 0){
				return [];
			}

			var musics = mtp.file.loadedFile.musics;
			var toVerifyTags = {};
			var removedTags = [];

			$.each(tags, function(index, tag){
				toVerifyTags[tag] = tag;
			});

			$.each(musics, function(index, music){
				$.each(Object.keys(toVerifyTags), function(index, tag){
					if(mtp.file._hasMusicTag(music, tag)){
						delete toVerifyTags[tag];
						return false;
					}
				});
				if(Object.keys(toVerifyTags).length <= 0){
					return false;
				}
			});

			$.each(Object.keys(toVerifyTags), function(index, tag){
				removedTags.push(tag);
				mtp.file._removeFileTag(tag);
			});

			return removedTags;
		},
		// remove uma tag do arquivo de config
		_removeFileTag : function(tag){
			var index = mtp.file._getFileTagIndex(tag);
			if(index == -1){
				return;
			}
			mtp.file.loadedFile.tags.splice(index, 1);
		},
		// o indice da tag no array de tags de arquivo
		_getFileTagIndex : function(tag){
			if(!tag) return -1;
			var cleanTag = tag.toLowerCase().trim();
			return jQuery.inArray(cleanTag, mtp.file.loadedFile.tags);
		},
		// retorna uma musica do arquivo
		_getMusicFromConfig : function(id){
			return mtp.file.loadedFile.musics[id];
		},
		// adiciona uma tag de arquivo
		_addFileTag : function(tag){
			if(!tag) return;
			var cleanTag = tag.toLowerCase().trim();
			if(mtp.file.hasFileTag(cleanTag)) return;
			mtp.file.loadedFile.tags.push(cleanTag);
		},
		_innerAddMusicTag : function(music, tag){
			if(!tag) return false;
			var cleanTag = tag.toLowerCase().trim();
			if(mtp.file._hasMusicTag(music, cleanTag)) return false;
			mtp.file._addFileTag(cleanTag);
			music.tags.push(cleanTag);
			return true;
		},
		// se uma musica possui uma tag
		_hasMusicTag : function(music, tag){
			var index = mtp.file._getMusicTagIndex(music, tag);
			return index != -1;
		},
		// o indice da tag no array de tags de uma musica
		_getMusicTagIndex : function(music, tag){
			if(!tag) return -1;
			var cleanTag = tag.toLowerCase().trim();
			return jQuery.inArray(cleanTag, music.tags);
		},
		// metodo chamado quando o arquivo de config eh atualizado
		_innerUpdateFile : function(){
			mtp.view.removeAllUsedTags();
			mtp.view.refreshTagList(mtp.file.getFileTags(), mtp.cookies.restoreUsedTags);
			mtp.view.enableSaveButton();
			mtp.view.enableAddMusicButton();
			mtp.view.updateFileName(mtp.file.loadedFileName);
		},
		// metodo que envia para o gdrive um arquivo de config
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
				reqBody.path = '/upload/drive/v2/files';
			}

			var request = gapi.client.request(reqBody);
			request.execute(callback);
		},
		// adiciona uma musica dado o id do google
		_addMusicToConfig : function(id, tags){
			if(!id) return false;
			var music = mtp.file._getMusicFromConfig(id);
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
		// caso aconteca erro ao carregar arquivo
		_loadConfigError : function(eraseCookie){
			if(eraseCookie){
				mtp.cookies.eraseConfigID();
			}
			mtp.view.endLoading();
		}
	}
} ());

