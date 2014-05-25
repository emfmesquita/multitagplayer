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
		<!-- Fixed navbar -->
	    <div class="navbar navbar-default navbar-fixed-top" role="navigation">
	      <div class="container">
	        <div class="navbar-header">
	          <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
	            <span class="sr-only">Toggle navigation</span>
	            <span class="icon-bar"></span>
	            <span class="icon-bar"></span>
	            <span class="icon-bar"></span>
	          </button>
	          <a class="navbar-brand" href="#">MultiTagPlayer</a>
	        </div>
	        <!-- <div class="collapse navbar-collapse">
	          <ul class="nav navbar-nav">
	            <li class="active"><a href="#">Home</a></li>
	            <li><a href="#about">About</a></li>
	          </ul>
	        </div>-->
	        <!--/.nav-collapse -->
	      </div>
	    </div>
		
		<div clas="row">
			<div class="col-xs-2 gray" style="height: 100%;">
			</div>
			<div class="container theme-showcase col-xs-10" role="main">
				<p>
					<div class="form-inline">
						<div class="form-group">
							<input id="newMusicName" type="text" class="form-control" placeholder="Name">
							<input id="newMusicPath" type="text" class="form-control" placeholder="Path" style="width:450px">
						</div>
						<button class="btn btn-default" onclick="save();">Save</button>
					</div>
				</p>
				<table class="table table-hover musicTable">
					<thead>
						<tr class="row">
							<th class="col-xs-1"></th>
							<th class="col-xs-11">Name</th>
						</tr>
					</thead>
					<tbody>
						<c:forEach items="${musics}" var="music">
							<tr onclick="play(this);">
								<td>
									<span class="glyphicon glyphicon-volume-up" style="display:none;"></span>
								</td>
								<td>
									${music.name}
									<input type="hidden" class="path" style="display:none" value="${music.path}"/>
								</td>
							</tr>
						</c:forEach>
					</tbody>
				</table>
	
				<audio src="resources/blank.mp3" id="player"/>
			</div>
		</div>

		<div id="footer">
	    	<div class="container">
	        	<p class="text-muted"><strong>MultiTagPlayer&trade;</strong> <small><em>version ${version}</em></small></p>
	    	</div>
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
