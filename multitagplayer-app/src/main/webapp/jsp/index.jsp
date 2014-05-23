<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<html>
	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>MultiTagPlayer</title>

		<!-- Bootstrap -->
		<link href="resources/bootstrap/css/bootstrap.min.css" rel="stylesheet">

		<!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
		<!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
		<!--[if lt IE 9]>
		  <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
		  <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
		<![endif]-->
	</head>
	<body>
		<h2>${message}</h2>

		

		<div>
			<ul class="list-group">
				<c:forEach items="${musics}" var="music">
					<li class="list-group-item music-item" onclick="play(this);">
						${music.name} (${music.path})
						<input type="hidden" class="path" style="display:none" value="${music.path}"/>
					</li>
				</c:forEach>
			</ul>
		</div>

		<div>
			<div class="form-inline navbar-left">
				<div class="form-group">
					<input id="newMusicName" type="text" class="form-control" placeholder="Name">
					<input id="newMusicPath" type="text" class="form-control" placeholder="Path" style="width:450px">
				</div>
				<button class="btn btn-default" onclick="save();">Save</button>
			</div>
		</div>

		<!-- jQuery -->
		<script src="resources/jquery.min.js"></script>
		<!-- Bootstrap -->
		<script src="resources/bootstrap/js/bootstrap.min.js"></script>
		<!-- Buzz -->
		<script src="resources/buzz.min.js"></script>

		<script>
			var multyTagSound = null;
			var play = function(item){
				var path = $(item).find(".path").val();
				if(!path){
					return;
				}
				if(multyTagSound){
					multyTagSound.stop();
				}
				console.log(path);
				multyTagSound = new buzz.sound(path);
				multyTagSound.play();
			}

			var save = function(){
				var name = $('#newMusicName').val();
				var path = $('#newMusicPath').val();
				$.post('music/save', 
					{ name : name , path : path},
					function(response) {
						console.log('saved');
					}
				);
			}
		</script>
	</body>
</html>