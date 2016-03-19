if(typeof mtp == 'undefined') mtp = {};
(function() {
	mtp.file = {
		C : {
			NEW_CONFIG_FILE : "New Config File",
			MTP_MIME : "application/multitagplayer"
		},
		// o arquivo de config carregado atualmente
		loadedFile : null,
		// o nome do arquivo de config carregado atualmente
		loadedFileName : null,
		// o id do gdrive do arquivo de config carregado atualmente
		loadedFileID : null,
		_fileAPILoaded : false,		
		_nextMusicRequest : 0,
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

				var compressed = mtp.file.C.MTP_MIME == file.mimeType;
				mtp.file.loadedFileID = id;

				var xhr = new XMLHttpRequest();
				var accessToken = gapi.auth.getToken().access_token;
				xhr.open('GET', file.downloadUrl);
				if(compressed) xhr.responseType = 'arraybuffer';
				xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
				xhr.onload = function(e) {
					try{
						var content = null;
						if(compressed){
							var contentBase64 = mtp.file._base64ArrayBuffer(e.currentTarget.response);
							content = LZString.decompressFromBase64(contentBase64);
						}
						else{
							content = xhr.responseText;
						}

						var parsedFile = JSON.parse(content);
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
		_base64ArrayBuffer : function(arrayBuffer) {
			var base64		= '';
			var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

			var bytes = new Uint8Array(arrayBuffer);
			var byteLength = bytes.byteLength;
			var byteRemainder = byteLength % 3;
			var mainLength = byteLength - byteRemainder;

			var a, b, c, d;
			var chunk;

			// Main loop deals with bytes in chunks of 3
			for (var i = 0; i < mainLength; i = i + 3) {
				// Combine the three bytes into a single integer
				chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

				// Use bitmasks to extract 6-bit segments from the triplet
				a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
				b = (chunk & 258048)   >> 12; // 258048	 = (2^6 - 1) << 12
				c = (chunk & 4032)     >> 6; // 4032		 = (2^6 - 1) << 6
				d = chunk & 63	;						 // 63			 = 2^6 - 1

				// Convert the raw binary segments to the appropriate ASCII encoding
				base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
			}

			// Deal with the remaining bytes and padding
			if (byteRemainder == 1) {
				chunk = bytes[mainLength];

				a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2

				// Set the 4 least significant bits to zero
				b = (chunk & 3)	 << 4; // 3	 = 2^2 - 1

				base64 += encodings[a] + encodings[b] + '==';
			} else if (byteRemainder == 2) {
				chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

				a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
				b = (chunk & 1008)	>>	4; // 1008	= (2^6 - 1) << 4

				// Set the 2 least significant bits to zero
				c = (chunk & 15) <<	2; // 15		= 2^4 - 1

				base64 += encodings[a] + encodings[b] + encodings[c] + '=';
			}

			return base64
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
		// faz o download do arquivo de configuracao
		downloadFile : function(){
			var b = document.createElement('a');
			b.download = mtp.file.loadedFileName;
			b.href = 'data:application/javascript;charset=utf-8,'+JSON.stringify(mtp.file.loadedFile);
			var hiddenArea = $("#hiddenArea");
			hiddenArea.append(b);
			b.click();
			hiddenArea.empty();
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
			if(!id) return [];
			var music = mtp.file._getMusicFromConfig(id);
			if(!music) return [];

			var musicTags = music.tags;
			delete mtp.file.loadedFile.musics[id];
			var removedTags = mtp.file._cleanFileTags(musicTags);
			return removedTags;
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

			var now = new Date().getTime();
			if(now > mtp.file._nextMusicRequest){
				mtp.file._nextMusicRequest = now + 100;
				mtp.file._makeMusicRequest(music, request, callback);
			}
			else{
				var delta = mtp.file._nextMusicRequest - now;
				mtp.file._nextMusicRequest = mtp.file._nextMusicRequest + 100;
				setTimeout(function(){
					mtp.file._makeMusicRequest(music, request, callback);
				}, delta);
			}
		},
		_makeMusicRequest : function(music, request, callback){
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
			$.each(musics, function(index, music){
				var hasFailure = false;
				var hasNotFailure = false;

				if(!nullHas){
					$.each(hasTags, function(index, tag){
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
					$.each(hasNotTags, function(index, tag){
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
		// marca os ranges de loop de uma musica
		setMusicLoopRange : function(id, minLoop, maxLoop){
			if(!id){
				return;
			}
			var existingMusic = mtp.file._getMusicFromConfig(id);
			if(!existingMusic){
				return;
			}
			existingMusic.minLoop = minLoop ? minLoop : null;
			existingMusic.maxLoop = maxLoop ? maxLoop : null;
		},
		// recupera o range de loop de uma musica
		getMusicLoopRange : function(id){
			if(!id){
				[null, null];
			}
			var existingMusic = mtp.file._getMusicFromConfig(id);
			if(!existingMusic){
				[null, null];
			}
			var loopRange = [];
			loopRange[0] = existingMusic.minLoop ? existingMusic.minLoop : null;
			loopRange[1] = existingMusic.maxLoop ? existingMusic.maxLoop : null;
			return loopRange;
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
			return $.inArray(cleanTag, mtp.file.loadedFile.tags);
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
			return $.inArray(cleanTag, music.tags);
		},
		// metodo chamado quando o arquivo de config eh atualizado
		_innerUpdateFile : function(){
			mtp.view.removeAllUsedTags();
			mtp.view.refreshTagList(mtp.file.getFileTags(), mtp.cookies.restoreUsedTags);
			mtp.view.enableSaveButton();
			mtp.view.enableAddMusicButton();
			mtp.view.enableDownloadButton();
			mtp.view.updateFileName(mtp.file.loadedFileName);
		},
		// metodo que envia para o gdrive um arquivo de config
		_innerInserFile : function(name, content, id, callback){
			const boundary = '-------314159265358979323846';
			const delimiter = "\r\n--" + boundary + "\r\n";
			const close_delim = "\r\n--" + boundary + "--";

			var contentType = mtp.file.C.MTP_MIME;
			var metadata = {
				title: name,
				mimeType: contentType,
				description: "Config file for MultiTag Player"
			};
			var base64Data = LZString.compressToBase64(content);
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
			music.minLoop = null;
			music.maxLoop = null;
			if(tags && tags.length > 0){
				$.each(tags, function(index, tag){
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