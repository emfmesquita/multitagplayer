<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<html>
	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>MultiTagPlayer</title>

		<!-- Bootstrap -->
		<link href="resources/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
		<link href="resources/bootstrap/css/sticky-footer-navbar.css" rel="stylesheet" />
		<link href="resources/bootstrap/css/sidebar.css" rel="stylesheet" />
		
		<!-- Scrollbar -->
		<link href="resources/scrollbar/jquery.mCustomScrollbar.css" rel="stylesheet" />

		<!-- JQuery UI -->
		<link href="resources/jquery-ui/jquery-ui.min.css" rel="stylesheet" />
		<link href="resources/jquery-ui/jquery-ui.structure.min.css" rel="stylesheet" />
		<link href="resources/jquery-ui/jquery-ui.theme.min.css" rel="stylesheet" />

		<!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
		<!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
		<!--[if lt IE 9]>
			<script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
			<script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
		<![endif]-->

		<!-- Mediaelement -->
		<link href="resources/mediaelement/mediaelementplayer.css" rel="stylesheet" />
		<link href="resources/index/index.css" rel="stylesheet">
		<script src="resources/mtp-cookies.js"></script>
		<script src="resources/mtp-gapi.js"></script>
		<script src="resources/mtp-picker.js"></script>
		<script src="resources/mtp-file.js"></script>
		<script src="resources/mtp-player.js"></script>
	</head>
	
	<body onload="mtp.gapi.init(); mtp.view.init('${tags}');">

		<div id="wait" style="display:none;position:fixed;width:100%;height:100%;background-color:white;opacity:0.6;z-index:1000000;">
			<div style="position:fixed;width:100%;height:100%;background-color:white;opacity:0.6;z-index:1000000;display:table-cell;">
				<img src='resources/images/loading.gif' style="margin-top:-128px;margin-left:-64px;position:absolute;left:50%;top:50%;"/>
			</div>
		</div>

		<!-- Fixed navbar -->
		<div class="navbar navbar-default navbar-fixed-top" role="navigation">
			<div class="container">
				<div class="navbar-header">
					<a class="navbar-brand" href="#">MultiTagPlayer</a>
				</div>
				
				<div class="btn-group navbar-btn navbar-right" style="margin-left:15px;">
					<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
						<span class="glyphicon glyphicon-cog"></span> Settings <span class="caret"></span>
					</button>
					<ul class="dropdown-menu" role="menu">
						<li><a href="#" onclick="mtp.file.newFile();"><span class="glyphicon glyphicon-file"></span> Create Config File</a></li>
						<li><a href="#" onclick="mtp.picker.openConfigPicker();"><span class="glyphicon glyphicon-folder-open"></span> Load Config File</a></li>
						<li><a id="shortcutsButton" href="#" data-toggle="modal" data-target="#modalShortcuts"><span class="glyphicon glyphicon-share-alt"></span> Shortcuts</a></li>
						<li><a href="#" onclick="mtp.gapi.logOut();"><span class="glyphicon glyphicon-log-out"></span> Logout</a></li>
					</ul>
				</div>
				<button id="downloadConfigButton" type="button" class="btn btn-default navbar-btn navbar-right" style="margin-left:15px;" onclick="mtp.file.downloadFile();" disabled="true">
					<span class="glyphicon glyphicon-download-alt"></span>	Download Config File
				</button>
				<button id="saveButton" type="button" class="btn btn-default navbar-btn navbar-right" style="margin-left:15px;" onclick="mtp.file.saveFile()" disabled="true">
					<span class="glyphicon glyphicon-floppy-disk"></span> Save Changes
				</button>
				<button id="addMusicButton" type="button" class="btn btn-default navbar-btn navbar-right" style="margin-left:15px;" onclick="mtp.picker.openMusicPicker()" disabled="true">
					<span class="glyphicon glyphicon-music"></span>	Add song
				</button>
				<!-- <div class="collapse navbar-collapse">
					<ul class="nav navbar-nav">
						<li class="active"><a href="#">Home</a></li>
						<li><a href="#about">About</a></li>
					</ul>
				</div>-->
				<!--/.nav-collapse -->
			</div>
		</div>
		
		<div style="margin-top:50px;">
			<div class="col-xs-2 gray sidebar" >
				<!-- TODO: be able to edit tags -->
				<div id="tag-autocomplete" class="input-group">
					<input id="tagSearchInput" type="text" class="form-control typeahead ignoreKeyEvents" placeholder="Filter by tag..." onkeyup="mtp.view.filterTagList(this.value, $('#tagsList'))"/>
					<span class="input-group-addon">
						<button type="button" class="close" aria-hidden="true" onclick="mtp.view.clearAutoComplete(this);">&times;</button>
					</span>
				</div>
				<div id="tagsList" class="no_selection" style="padding: 10px 8px 0 8px;">
					<ul class="list-group">
					</ul>
				</div>
			</div>
			<div class="container theme-showcase col-xs-10 col-xs-offset-2" role="main" style="margin-top:20px; margin-bottom:60px;">
				<div id="usedTagsElement" style="display:none;" class="well well-lg no_selection">
				<!-- TODO: make collapsible -->
					<strong>Tags:</strong><br/>
				</div>
				
				<div id="playerContainer" style="margin-bottom:15px;">
					<audio src="resources/blank.mp3" style="width: 100%" id="player"/>
				</div>
				<table id="musicsTable" class="table table-hover musicTable">
					<thead>
						<tr class="row">
							<th class="col-xs-1"></th>
							<th class="col-xs-5">Name</th>
							<th class="col-xs-4">Tags</th>
							<th class="col-xs-2"></th>
						</tr>
					</thead>
					<tbody>
						
					</tbody>
				</table>
			</div>
				
			<!-- Modal de Tags-->
			<div class="modal fade" id="modalTags" tabindex="-1" role="dialog" aria-labelledby="tagsModalLabel" aria-hidden="true">
				<div class="modal-dialog">
					<div class="modal-content">
					  	<div class="modal-header">
							<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
							<h4 class="modal-title" id="tagsModalLabel">Tags of...</h4>
						</div>
						<div class="modal-body">
							<input id="musicId" type="hidden" />
							<textarea id="tagsText" class="form-control ignoreKeyEvents" rows="3" onkeypress="mtp.view.enterOnTagArea(event);"></textarea>
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
							<button id="saveModal" type="button" class="btn btn-primary" onClick="mtp.view.endModalTags();" data-dismiss="modal">Save changes</button>
						</div>
					</div>
				</div>
			</div>

			<!-- Modal de Range de Loop-->
			<div class="modal fade" id="modalLoopRange" tabindex="-1" role="dialog" data-backdrop="static" aria-labelledby="loopRangeModalLabel" aria-hidden="true">
				<div class="modal-dialog">
					<div class="modal-content">
					  	<div class="modal-header">
							<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
							<h4 class="modal-title" id="loopRangeModalLabel">Song Loop Range</h4>
						</div>
						<div class="modal-body">
							<input class="musicId" type="hidden" />
							<div id="musicLoopRangeSlider" class="ui-slider-handle ignoreKeyEvents"></div>
							
							<p class="rangeDisplay">
								<button type="button" class="btn btn-default btn-xs" onClick="mtp.view.resetMusicLoopRange()">Reset</button>
								<span id="musicLoopRangeSliderValue"></span>
							</p>
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
							<button id="saveModal" type="button" class="btn btn-primary" onClick="mtp.view.saveMusicLoopRange()" data-dismiss="modal">Save changes</button>
						</div>
					</div>
				</div>
			</div>

			<!-- Modal de Atalhos-->
			<div class="modal fade" id="modalShortcuts" tabindex="-1" role="dialog" aria-labelledby="shortcutsModalLabel" aria-hidden="true">
				<div class="modal-dialog">
					<div class="modal-content">
					  	<div class="modal-header">
							<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
							<h4 class="modal-title" id="shortcutsModalLabel">Shortcuts</h4>
						</div>
						<div class="modal-body">
							<table class="table table-hover">
								<thead>
									<tr class="row">
										<th class="col-xs-4">Button</th>
										<th class="col-xs-8">Effect</th>
									</tr>
								</thead>
								<tbody>
									<tr class="row">
										<td class="col-xs-4">h</td>
										<td class="col-xs-8">Show shortcuts</td>
									</tr>
									<tr class="row">
										<td class="col-xs-4">Espace</td>
										<td class="col-xs-8">Play or pause</td>
									</tr>
									<tr class="row">
										<td class="col-xs-4">Left Arrow</td>
										<td class="col-xs-8">Go back</td>
									</tr>
									<tr class="row">
										<td class="col-xs-4">Right Arrow</td>
										<td class="col-xs-8">Go right</td>
									</tr>
									<tr class="row">
										<td class="col-xs-4">b</td>
										<td class="col-xs-8">Play previous</td>
									</tr>
									<tr class="row">
										<td class="col-xs-4">n</td>
										<td class="col-xs-8">Play next</td>
									</tr>
									<tr class="row">
										<td class="col-xs-4">-</td>
										<td class="col-xs-8">Turn volume down</td>
									</tr>
									<tr class="row">
										<td class="col-xs-4">+</td>
										<td class="col-xs-8">Turn volume up</td>
									</tr>
									<tr class="row">
										<td class="col-xs-4">l</td>
										<td class="col-xs-8">Toogle loop</td>
									</tr>
									<tr class="row">
										<td class="col-xs-4">m</td>
										<td class="col-xs-8">Mute or unmute</td>
									</tr>
									<tr class="row">
										<td class="col-xs-4">t</td>
										<td class="col-xs-8">Add tags to song</td>
									</tr>
									<tr class="row">
										<td class="col-xs-4">r</td>
										<td class="col-xs-8">Change the loop range of a song</td>
									</tr>
									<tr class="row">
										<td class="col-xs-4">s</td>
										<td class="col-xs-8">Save</td>
									</tr>
									<tr class="row">
										<td class="col-xs-4">a</td>
										<td class="col-xs-8">Add song</td>
									</tr>
									<tr class="row">
										<td class="col-xs-4">o</td>
										<td class="col-xs-8">Load config file</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div id="footer">
			<div class="container">
				<p class="text-muted">
					<strong>MultiTagPlayer&trade;</strong> <small><em>version ${version}</em></small>
					<span class="pull-right"><strong id="fileName"></strong></span>
				</p>
			</div>
		</div>

		<div id="hiddenArea" style="display:none"></div>

		<!-- jQuery -->
		<script src="resources/jquery.min.js"></script>
		<!-- jQuery UI-->
		<script src="resources/jquery-ui/jquery-ui.min.js"></script>
		<!-- Bootstrap -->
		<script src="resources/bootstrap/js/bootstrap.min.js"></script>
		<script src="resources/bootstrap/js/transition.js"></script>
		<script src="resources/bootstrap/js/tooltip.js"></script>
		<script src="resources/bootstrap/js/bootstrap-confirmation.js"></script>
		<!-- Scrollbar -->
		<script src="resources/scrollbar/jquery.mCustomScrollbar.concat.min.js"></script>
		<!-- Mediaelement -->
		<script src="resources/mediaelement/mediaelement-and-player.min.js"></script>
		<!-- LZ-String - compactador -->
		<script type="text/javascript" src="resources/lz-string/lz-string.min.js"></script>
		<!-- The Google API Loader script. -->
		<script type="text/javascript" src="https://apis.google.com/js/api.js?onload=mtpGapiOnApiLoad"></script>
		<script type="text/javascript" src="https://apis.google.com/js/client.js?onload=mtpGapiOnClientApiLoad"></script>

		<script src="resources/mtp-view.js"></script>
	</body>
</html>
