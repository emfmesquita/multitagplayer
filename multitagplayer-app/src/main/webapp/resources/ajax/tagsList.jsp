<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<div>${teste}</div>

<ul class="list-group">
	<c:forEach items="${paramValues['tags[]']}" var="tag">
		<li class="list-group-item" onmouseover="$(this).find('div.iconGroup').show()" onmouseout="$(this).find('div.iconGroup').hide()">
			<strong>${tag}</strong>
			<div class="pull-right iconGroup" style="margin-top:3px; display:none;">
				<span class="glyphicon glyphicon-thumbs-down" style="cursor:pointer" onclick="mtp.view.addUsedTag($(this).parentsUntil('li').parent('li'), true)" ></span>
				<span class="glyphicon glyphicon-thumbs-up" style="cursor:pointer" onclick="mtp.view.addUsedTag($(this).parentsUntil('li').parent('li'), false)" ></span>
			</div>
		</li>
	</c:forEach>
</ul>
