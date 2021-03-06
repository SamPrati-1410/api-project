var arrCitiesId = [];
var citySlNum = 0;
function getWeather(curCityName) {
	appendCitiesToUrl()
	$.getJSON(url, function (data, status, xhr) {
		var recData = data;
		var recStatus = status;
		var jqXHR = xhr;
		displayWeather(recData, curCityName)
	});
	function appendCitiesToUrl() {
		var arrUrl = arrCitiesId.map((urls) => { return urls[0] })
		return url = 'https://api.openweathermap.org/data/2.5/group?id=' + arrUrl.join(',') + '&units=metric&APPID=8fa947eed508ef56ffe0312285799e9d';
	}
	function displayWeather(objJson, curCityName) {
		var weatherHtml = '';
		var cityNameInApi = objJson['list'].find(function (items) {
			return items.name === curCityName;
		});
		citySlNum++;
		weatherHtml = `<tr id='${cityNameInApi.id}'>
      <th scope="row">${citySlNum}</th>
      <td>${cityNameInApi.name}</td>
      <td>${cityNameInApi.sys.country}</td>
      <td>${cityNameInApi['main'].temp} &degC </td>
	  <td>${cityNameInApi['weather'][0]['main']} - ${cityNameInApi['weather'][0]['description']}</td>`
		var button = $('<td><button name="' + cityNameInApi.name + '" type="button" class="btn btn-dark">X</button></td></tr>').click(function (e) {
			var delCityIndex = arrCitiesId.findIndex(function (items, i) {
				return items[1] === e.target.name
			});
			arrCitiesId.splice(delCityIndex, 1);
			$(e.currentTarget).closest('tr').remove();

		});
		$('#weatherData').append(weatherHtml);
		//$('tr:not(.none)').append(button);
		$('tr#' + cityNameInApi.id).append(button);
		objJson['list'].find(function (items, obs) {
			if (items.name === curCityName) {
				arrCitiesId.find(function (item) {
					if (curCityName === item[1]) {
						item.push(items['main'].temp)
					}
				});
			}

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
	d3.select("svg").remove();
	if ($(document).width() > 1100) { var w = 1100; }
	else { w = $(document).width() - 70; }

	const svg = d3.select('#chart')
		.append('svg')
		.attr('width', w)
		.attr('height', 500)
		.style("background-color", "#bad986");
	var padding = { top: 20, right: 30, bottom: 30, left: 50 };

	var chartArea = {
		"width": parseInt(svg.style("width")) - padding.left - padding.right,
		"height": parseInt(svg.style("height")) - padding.top - padding.bottom
	};
	var barColors = d3.schemeCategory10;
	var yScale = d3.scaleLinear()
		.domain([0, d3.max(arrCitiesId, function (d, i, j) { return d[3] })])
		.range([chartArea.height, 0]).nice();


	var xScale = d3.scaleBand()
		.domain(arrCitiesId.map(function (d, i, j) { return d[1] }))
		.range([0, chartArea.width])
		.padding(.2);

	var xAxis = svg.append('g')
		.classed('xAxis', true)
		.attr(
			'transform', 'translate(' + padding.left + ',' + (chartArea.height + padding.top) + ')'
		)
		.call(d3.axisBottom(xScale));
	var yAxisfn = d3.axisLeft(yScale);
	var yAxis = svg.append('g')
		.classed('yAxis', true)
		.attr(
			'transform', 'translate(' + padding.left + ',' + padding.top + ')'
		);
	yAxisfn(yAxis);
	var rectGrp = svg.append('g').attr(
		'transform', 'translate(' + padding.left + ',' + padding.top + ')'
	);
	rectGrp.selectAll('rect').data(arrCitiesId).enter()
		.append('rect')
		.attr('width', xScale.bandwidth())
		.attr('height', function (d, i, j) { return chartArea.height - yScale(d[3]); })
		.attr('x', function (d, i, j) { return xScale(d[1]); })
		.attr('y', function (d, i, j) { return yScale(d[3]); })
		.attr('fill', function (d, i, j) {
			return barColors[i];
		});
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
	var click_text = $(this).text().split('|');
	$('#search').val($.trim(click_text[0]));
	arrCitiesId.push([this.id, $.trim(click_text[0]), $.trim(click_text[1])]);
	$("#result").html('');
});


