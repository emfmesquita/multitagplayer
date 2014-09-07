if(typeof mtp == 'undefined') mtp = {};
(function() {
	mtp.player = {
		init : function(){
			$('#player').mediaelementplayer({
				success: function(mediaElement, originalNode) {
					mtp.player._audioEl = mediaElement;
					mtp.player._player = mtp.player._audioEl.player;
					mtp.player._audioEl.setSrc("");
					mtp.player._audioEl.addEventListener("pause", function(){
						if(!mtp.player._audioEl.ended){
							mtp.view.pauseCurrentRow();
						}
					});
					mtp.player._audioEl.addEventListener("play", function(){mtp.view.playCurrentRow()});
					mtp.player._audioEl.addEventListener("ended", function(){mtp.view.playNext()});
				},
				features: ['playpause','current','progress','duration','volume'],
				keyActions: []
			});
			$("body").keydown(function(event) {
				if(event.altKey || event.ctrlKey || event.metaKey){
					return;
				}
				if(mtp.player._isKeyEventsNotEnabled()){
					return;
				}

				var keyCode = event.keyCode;
				var media = mtp.player._audioEl;
				var player = mtp.player._player;
				var shift = event.shiftKey;

				//console.log(event);
				// SPACE
				if(keyCode == 32){
					if (media.paused || media.ended) {
						media.play();
					} else {
						media.pause();
					}
				}
				// LEFT
				else if(keyCode == 37){
					var duration = media.duration;
					if (!isNaN(duration) && duration > 0) {
						// 5%
						var newTime = Math.max(media.currentTime - player.options.defaultSeekBackwardInterval(media), 0);
						media.setCurrentTime(newTime);
					}
				}
				// RIGHT
				else if(keyCode == 39){
					var duration = media.duration;
					if (!isNaN(duration) && duration > 0) {
						// 5%
						var newTime = Math.min(media.currentTime + player.options.defaultSeekForwardInterval(media), duration);
						media.setCurrentTime(newTime);
					}
				}
				// T open modal tag
				else if(keyCode == 84){
					mtp.view.initModalTagsActiveRow();
				}
				// M mute unmute
				else if(keyCode == 77){
					player.setMuted(!media.muted);
				}
				// S save
				else if(keyCode == 83){
					mtp.file.saveFile();
				}
				// A add music
				else if(keyCode == 65){
					mtp.picker.openMusicPicker();
				}
				// L load config
				else if(keyCode == 76){
					mtp.picker.openConfigPicker();
				}
				// B play before
				else if(keyCode == 66){
					mtp.view.playPrev();
				}
				// N play next
				else if(keyCode == 78){
					mtp.view.playNext();
				}
				// H show shortcuts
				else if(keyCode == 72){
					mtp.view.toogleShortcutsModal();
				}
				// + louder
				else if(keyCode == 107 || (keyCode == 187 && shift)){
					var newVolume = Math.max(media.volume + 0.1, 0);
					media.setVolume(newVolume);
				}
				// - shorter
				else if(keyCode == 109 || (keyCode == 189 && !shift)){
					var newVolume = Math.max(media.volume - 0.1, 0);
					media.setVolume(newVolume);
				}
			});
		},
		// Toca ou pausa uma musica. Retorna true se a musica tocada já era a que estava recarregada.
		play : function(musicid, path){
			if(musicid == mtp.player._audioEl.musicid){
				if(mtp.player._audioEl.paused){
					mtp.player._audioEl.play();
				}
				else{
					mtp.player._audioEl.pause();
				}
				return true;
			}

			mtp.player._audioEl.pause();
			mtp.player._audioEl.setSrc(path);
			mtp.player._audioEl.musicid = musicid;
			mtp.player._audioEl.play();
			return false;
		},
		simplePlay : function(){
			mtp.player._audioEl.play();
		},
		isPaused : function(){
			return mtp.player._audioEl.paused;
		},
		currentMusicId : function(){
			return mtp.player._audioEl.musicid;
		},
		_isKeyEventsNotEnabled : function(){
			if($("#wait").is(":visible")){
				return true;
			}
			var focus = $(':focus');
			if(focus.length <= 0){
				return false;
			}
			return focus.hasClass('ignoreKeyEvents');
		},
		_audioEl : null,
		_player : null
	}
} ());