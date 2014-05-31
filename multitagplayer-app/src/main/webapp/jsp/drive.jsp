<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<html xmlns="http://www.w3.org/1999/xhtml">
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

		<link href="resources/drive/drive.css" rel="stylesheet" />
		<script src="resources/drive/drive.js"></script>
	</head>
	<body onload="init();">

		<div class="container theme-showcase" role="main">
			<button type="button" class="btn btn-default" onclick="openPicker()">Load</button>
			<audio src="resources/blank.mp3" id="player"/>
		</div>

		<!-- jQuery -->
		<script src="resources/jquery.min.js"></script>
		<!-- Bootstrap -->
		<script src="resources/bootstrap/js/bootstrap.min.js"></script>
		<!-- Mediaelement -->
		<script src="resources/mediaelement/mediaelement-and-player.min.js"></script>
		<!-- The Google API Loader script. -->
		<script type="text/javascript" src="https://apis.google.com/js/api.js?onload=onApiLoad"></script>
		<script type="text/javascript" src="https://apis.google.com/js/client.js?onload=onClientApiLoad"></script>

		<script src="resources/mtp-file.js"></script>
	</body>
</html>