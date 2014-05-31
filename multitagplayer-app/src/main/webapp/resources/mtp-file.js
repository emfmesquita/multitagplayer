if(typeof mtp == 'undefined') mtp = {};
(function() {
	mtp.file = {
		C : {
			NEW_CONFIG_FILE : "New Config File"
		},
		loadedFile : null,
		loadedFileName : null,
		newFile : function(){
			mtp.file.loadedFile = {};
			mtp.file.loadedFile.tags = [];
			mtp.file.loadedFile.musics = {};
			mtp.file.loadedFileName = mtp.file.C.NEW_CONFIG_FILE;
		},
		isFileLoaded : function(){
			return mtp.file.loadedFile != null;
		},
		loadFile : function(file, fileName){
			mtp.file.loadedFileName = fileName;
			// TODO
		},
		hasFileTag : function(tag){
			var index = jQuery.inArray(tag, mtp.file.loadedFile.tags);
			return index != -1;
		},
		addFileTag : function(tag){
			if(!tag) return;
			if(mtp.file.hasFileTag(tag)) return;
			mtp.file.loadedFile.tags.push(tag);
		},
		getMusic : function(id){
			return mtp.file.loadedFile.musics[id];
		},
		hasMusicTag : function(music, tag){
			var index = jQuery.inArray(tag, music.tags);
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
					mtp.file.addFileTag(tag);
					mtp.file._innerAddMusicTag(music, tag);
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
			if(mtp.file.hasMusicTag(music, tag)) return;
			music.tags.push(tag);
		}
	}
} ());

