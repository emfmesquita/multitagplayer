<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<html>
	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>MultiTagPlayer</title>

		<!-- Bootstrap -->
		<link href="resources/bootstrap/css/bootstrap.min.css" rel="stylesheet" />

		<!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
		<!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
		<!--[if lt IE 9]>
		  <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
		  <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
		<![endif]-->

		<!-- Mediaelement -->
		<link href="resources/mediaelement/mediaelementplayer.css" rel="stylesheet" />

		<link href="resources/index/index.css" rel="stylesheet">
	</head>
	<body onload="init();">
		<h2>${message}</h2>

		
		<div class="container theme-showcase" role="main">
			<p>
				<div class="form-inline">
					<div class="form-group">
						<input id="newMusicName" type="text" class="form-control" placeholder="Name">
						<input id="newMusicPath" type="text" class="form-control" placeholder="Path" style="width:450px">
					</div>
					<button class="btn btn-default" onclick="save();">Save</button>
				</div>
			</p>
			<p>
				<ul class="list-group">
					<c:forEach items="${musics}" var="music">
						<li class="list-group-item music-item" onclick="play(this);">
							${music.name} (${music.path})
							<input type="hidden" class="path" style="display:none" value="${music.path}"/>
						</li>
					</c:forEach>
				</ul>
			</p>

			<audio src="resources/blank.mp3" id="player"/>
		</div>

		<!-- jQuery -->
		<script src="resources/jquery.min.js"></script>
		<!-- Bootstrap -->
		<script src="resources/bootstrap/js/bootstrap.min.js"></script>
		<!-- Mediaelement -->
		<script src="resources/mediaelement/mediaelement-and-player.min.js"></script>

		<script src="resources/index/index.js"></script>
	</body>
</html>