var arrCitiesId = [];
function getWeather(curCityName) {
	appendCitiesToUrl()
	$.getJSON(url, function (data, status, xhr) {
		var recData = data;
		var recStatus = status;
		var jqXHR = xhr;
		displayWeather(recData,curCityName)
	});
	function appendCitiesToUrl() {
		var arrUrl = arrCitiesId.map((urls) => { return urls[0] })
		return url = 'https://api.openweathermap.org/data/2.5/group?id=' + arrUrl.join(',') + '&units=metric&APPID=8fa947eed508ef56ffe0312285799e9d';
	}
	function displayWeather(objJson,curCityName) {
		var weatherHtml = '';
		objJson['list'].map(function(items,obs){
			var citySlNum = 1 + parseInt(obs);
			var objList = objJson['list'][obs];
			arrCitiesId.find(function (item) {
				if (objList['name'] === curCityName) {
					item.push(objList['main'].temp)
				}
			});
	weatherHtml += `<tr id='${citySlNum}'>
      <th scope="row"> ${citySlNum} </th>
      <td>${objList['name']}</td>
      <td>${objList.sys.country}</td>
      <td>${objList['main'].temp } &degC </td>
	  <td>${objList['weather'][0]['main']} - ${objList['weather'][0]['description'] }</td>
	  </tr>`
	  var button =$('<td><button name="'+objList['name']+'" type="button" class="btn btn-dark">X</button></td></tr>').click(function (e) {
		var cityToRemove = $(e.currentTarget).closest('tr').remove();
		
		removeCityArray =arrCitiesId;
		removeCityArray.splice(e.currentTarget.name,1);
		 });
		
		$('#weatherData').html(weatherHtml);
		$('tr:not(.none)').append(button);

		});
	}
}

//city.list.json source link http://bulk.openweathermap.org/sample/
function matchCity(cityName) {
	var cityNameLength = cityName.length;
	$.get('city.list.json', function (data, status) {
		var found = data.find((item, i) => { return cityName.toUpperCase() === item.name.substring(0, cityNameLength).toUpperCase() })
		if (found !== undefined) {
			$('#cities').val(found.name);
			arrCitiesId.push([found.id, found.name, found.country]);
			getWeather(found.name);		
			$('#cities').focus();
			$('#cities').val('');
		} else { alert('No such city, Try again') }

	});
}

$('#cities').change(function () {
	matchCity($('#cities').val());
});

$('#showWeather').click(function () {
	alert();
	if (arrCitiesId.length !== 0) {
		getWeather();
	} else { alert('Please enter city names and then generate weather report!!!') }
});
$('#btnChart').click(function () {
	if (arrCitiesId.length !== 0) {
		drawChart();
	} else { alert('Please enter city names and then generate weather report!!!') }
});

function drawChart() {

	const w = 1100;
	const h = 500;
	const height = 500 - 120;
	const padding = 60;
	
	const svg = d3.select('#chart')
		.append('svg')
		.attr('width', w)
		.attr('height', h)
		.style("background-color", "#bad986");
	var barColors =d3.schemeCategory10;
	const xScale = d3.scaleBand()
		.domain(arrCitiesId.map(function(d,i){return d[1]}))
		.range([padding, w - padding])
		.padding(.2);
		const xAxis = svg.append("g")
		.classed('xAxis',true)
		.attr("transform", "translate(0," + (height + padding) + ")")
		.call(d3.axisBottom(xScale));

	const yScale = d3.scaleLinear()
		.domain([0, d3.max(arrCitiesId, (d, i) => d[3])])
		.range([h - padding, padding]);
		const yAxis = d3.axisLeft(yScale);
		svg.append('g')
		.attr('transform', 'translate(' + padding + ',0)')
		.call(yAxis);
	
		var rectGrp= svg.append('g').attr(
			'transform','translate('+padding+','+padding+')'
		);
		rectGrp.selectAll('rect').data(arrCitiesId).enter()
		.append('rect')
		.attr('width', xScale.bandwidth())
		.attr('height', function(d, i,j) 
		{return height - yScale(d[3]);})
		.attr('x', function(d, i,j) 
		{return xScale(d[1]);})
		.attr('y', function(d, i,j) 
		{return yScale(d[3]);})
		.attr('fill',function(d,i){
			return barColors[i];
		});

	svg.selectAll("text")
		.data(arrCitiesId)
		.enter()
		.append("text")
		.text((d, i, j) => d[1])
		.attr('x', (d, i, j) => padding + (i * 60))
		.attr('y', (d, i, j) => { return (h - d[3] * 5) })
}

//  dynamic search
$('#search').keyup(function () {
	$('#result').html('');
	$('#state').val('');
	var searchField = $('#search').val();
	$.getJSON('city.list.json', function (data) {
		liCount = 0;
		$.each(data, function (key, value) {

			if (value.name.substring(0, 3) === searchField && liCount < 5) {
				liCount++;
				$('#result').append('<li class="list-group-item link-class" id=' + value.id + '>' + value.name + ' | <span class="text-muted">' + value.country + '</span></li>');
			}
		});
	});
});

$('#result').on('click', 'li', function () {
	alert(this.id);
	var click_text = $(this).text().split('|');
	$('#search').val($.trim(click_text[0]));
	arrCitiesId.push([this.id, $.trim(click_text[0]), $.trim(click_text[1])]);
	$("#result").html('');
});


