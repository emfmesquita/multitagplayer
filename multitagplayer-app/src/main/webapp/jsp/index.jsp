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
	
	<body onload="init('${tags}'.replace('[', '').replace(']', '').split(/, /g));">
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
		
		<div style="margin-top:50px;">
			<div class="col-xs-2 gray sidebar" >
				<div id="tag-autocomplete" class="input-group">
				  	<input type="text" class="form-control typeahead" placeholder="Filter by tag..." onkeyup="filterTagList(this.value, $('#tagsList'))"/>
				  	<span class="input-group-addon">
				  		<button type="button" class="close" aria-hidden="true" onclick="clearAutoComplete(this);">&times;</button>
				  	</span>
				</div>
				<div id="tagsList" style="padding: 10px 8px 0 8px;">
					<ul class="list-group">
						<c:forEach items="${tags}" var="tag">
							<li class="list-group-item" onmouseover="$(this).find('div.iconGroup').show()" onmouseout="$(this).find('div.iconGroup').hide()">
								<strong>${tag}</strong>
								<div class="pull-right iconGroup" style="margin-top:3px; display:none;">
									<span class="glyphicon glyphicon-thumbs-down" style="cursor:pointer" onclick="addUsedTag($(this).parentsUntil('li').parent('li'), true)" ></span>
									<span class="glyphicon glyphicon-thumbs-up" style="cursor:pointer" onclick="addUsedTag($(this).parentsUntil('li').parent('li'), false)" ></span>
								</div>
							</li>
						</c:forEach>
					</ul>
				</div>
			</div>
			<div class="container theme-showcase col-xs-10 col-xs-offset-2" role="main" style="margin-top:20px; margin-bottom:60px;">
				<!-- TODO: Choose better red/green -->
				<!-- TODO: Change color on mouse over -->
				<div id="usedTagsElement" style="display:none;" class="well well-lg">
					<strong>Tags:</strong><br/>
				</div>
				<table class="table table-hover musicTable">
					<thead>
						<tr class="row">
							<th class="col-xs-1"></th>
							<th class="col-xs-5">Name</th>
							<th class="col-xs-6">Tags</th>
						</tr>
					</thead>
					<tbody>
						<c:forEach items="${musics}" var="music">
							<tr class="row" onclick="play(this);">
								<td class="col-xs-1">
									<span class="glyphicon glyphicon-volume-up" style="display:none;"></span>
								</td>
								<td class="col-xs-5">
									${music.name}
									<input type="hidden" class="path" style="display:none" value="${music.path}"/>
								</td>
								<td class="col-xs-6">
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
		<script src="resources/bootstrap/js/transition.js"></script>
		<!-- Scrollbar -->
		<script src="resources/scrollbar/jquery.mCustomScrollbar.concat.min.js"></script>
		<!-- Mediaelement -->
		<script src="resources/mediaelement/mediaelement-and-player.min.js"></script>

		<script src="resources/index/index.js"></script>
	</body>
</html>
