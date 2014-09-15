if(typeof mtp == 'undefined') mtp = {};
(function() {
	mtp.player = {
		init : function(){
			// loop toggle
			MediaElementPlayer.prototype.buildloop = function(player, controls, layers, media) {
					// create the loop button
				var loop =  
					$('<div id="playerLoopDiv" class="mejs-button mejs-loop-button ' + ((player.options.loop) ? 'mejs-loop-on' : 'mejs-loop-off') + '">' +
						'<button type="button" title="Toogle Loop" aria-label="Loop"></button>' +
					'</div>')
					// append it to the toolbar
					.appendTo(controls)
					// add a click toggle event
					.click(function() {
						mtp.player._innerToogleLoop(player.media, player, loop);
					});
			}

			$('#player').mediaelementplayer({
				success: function(mediaElement, originalNode) {
					mtp.player._audioEl = mediaElement;
					mtp.player._player = mtp.player._audioEl.player;
					mtp.player._audioEl.setSrc("");
					mtp.player._audioEl.addEventListener("pause", function(){
						if(!mtp.player._audioEl.ended){
							mtp.view.statusPauseCurrentRow();
						}
					});
					mtp.player._audioEl.addEventListener("play", function(){mtp.view.playCurrentRow()});
					mtp.player._audioEl.addEventListener("ended", function(){mtp.view.playNext()});
					mtp.player._audioEl.addEventListener("loadedmetadata", function(){mtp.player._loadedMetadata()});
					mtp.player._audioEl.addEventListener("timeupdate", function(event){
						mtp.player._timeUpdate(event.target.currentTime);
					});
				},
				features: ['playpause','loop','current','progress','duration','volume'],
				enableKeyboard: false,
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

				// SPACE
				if(keyCode == 32){
					$(":focus").blur();
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
				// L toogle loop
				else if(keyCode == 76){
					mtp.player.toogleLoop();
				}
				// S save
				else if(keyCode == 83){
					mtp.file.saveFile();
				}
				// A add music
				else if(keyCode == 65){
					mtp.picker.openMusicPicker();
				}
				// O open config
				else if(keyCode == 79){
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
				// R open music loop range modal
				else if(keyCode == 82){
					mtp.view.initModalLoopRangeActiveRow();
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

			mtp.view.disableRangeButton();

			// recupera o loop range
			var loopRange = mtp.file.getMusicLoopRange(musicid);
			mtp.player.setLoopRange(loopRange[0], loopRange[1]);

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
		toogleLoop : function(){
			mtp.player._innerToogleLoop(mtp.player._audioEl, mtp.player._player, $("#playerLoopDiv"));
		},
		isInLoop : function(){
			return mtp.player._audioEl.loop;
		},
		setLoopRange : function(minLoop, maxLoop){
			mtp.player._minLoop = minLoop ? minLoop : null;
			mtp.player._maxLoop = maxLoop ? maxLoop : null;
		},
		getMusicDuration : function(){
			return mtp.player._audioEl.duration;
		},
		_innerToogleLoop : function(media, player, playerLoopDiv){
			player.options.loop = !player.options.loop;
			media.loop = !media.loop;
			if (player.options.loop) {
				playerLoopDiv.removeClass('mejs-loop-off').addClass('mejs-loop-on');
			} else {
				playerLoopDiv.removeClass('mejs-loop-on').addClass('mejs-loop-off');
			}
			mtp.view.statusToogleLoopCurrentRow();
		},
		_isKeyEventsNotEnabled : function(){
			if($("#wait").is(":visible")){
				return true;
			}
			var focus = $(':focus');
			if(focus.length <= 0){
				return false;
			}
			return focus.closest(".ignoreKeyEvents").length != 0;
		},
		_timeUpdate : function(currentTime){
			if(!mtp.player.isInLoop() || (!mtp.player._minLoop && !mtp.player._maxLoop)){
				return;
			}
			if(mtp.player._minLoop && currentTime < mtp.player._minLoop){
				mtp.player._toTime(mtp.player._minLoop);
				return;
			}
			if(mtp.player._maxLoop && currentTime > mtp.player._maxLoop){
				if(mtp.player._minLoop){
					mtp.player._toTime(mtp.player._minLoop);
				}
				else{
					mtp.player._toTime(0);
				}
			}
		},
		_toTime : function(time){
			mtp.player._audioEl.currentTime = time;
		},
		_loadedMetadata : function(){
			mtp.view.enableRangeButton();
		},
		_audioEl : null,
		_player : null,
		_minLoop : null,
		_maxLoop : null
	}
} ());