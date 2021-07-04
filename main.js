function updateBar(data) {
	let shootings = Array(7).fill(0);
	let years = [];
	d3.selectAll('div.bardiv input:checked').each(function(d, i) {
		years.push(d3.select(this).property('value').substr(3));
	});
	for (x of data) {
		if (years.includes(x['date'].substr(0, 4))) {
			if (x['race'] == 'W') {
				shootings[0]++;
			}
			else if (x['race'] == 'B') {
				shootings[1]++;
			}
			else if (x['race'] == 'A') {
				shootings[2]++;
			}
			else if (x['race'] == 'N') {
				shootings[3]++;
			}
			else if (x['race'] == 'H') {
				shootings[4]++;
			}
			else if (x['race'] == 'O') {
				shootings[5]++;
			}
			else if (x['race'] == '') {
				shootings[6]++;
			}
		}
	}
	console.log(years, shootings);
	d3.selectAll('svg.barchart g rect').data(shootings).join('rect').transition().duration(400).attr('height', d => d/10);
}

function updateLine(data) {
	let ifmonth = d3.select('#tweetmonth').property('checked');
	let limit = ifmonth ? 132 : 11;
	let tweets = Array(limit).fill(0);
	for (x of data) {
		let temp = ifmonth ? (parseInt(x['date'].substr(0, 4)) - 2009) * 12 + parseInt(x['date'].substr(5, 2)) : parseInt(x['date'].substr(0, 4)) - 2009;
		if (temp < limit && temp > 0) {
			tweets[temp]++;
		}
	}
	
	let line = d3.selectAll('svg.linechart').selectAll('path');
	let lineFn = d3.line().x((d, i) => ifmonth ? 2.27*i : 30*i).y(d => ifmonth ? d/5 : d/30);
	line.join('path')
		.attr('d', lineFn(tweets));
	
	labels = ['Donald Trump Tweets from 2009 to 2019', 'Tweets', '0', ifmonth ? '1500' : '9000', 'Year', '2009', '2019'];
	d3.selectAll('svg.linechart text').data(labels).join('text').text(d => d);
}

function updateArea(data) {
	let cases = [];
	let ifnew = d3.select('#casenew').property('checked');
	for (x of data) {
		cases.push(ifnew ? x['New cases'] : x['Total cases'] / 100);
	}

	let area = d3.selectAll('svg.areachart').selectAll('path');
	let areaFn = d3.line().x((d, i) => i < 7 ? 50*i : (i == 7 ? 300 : 0)).y(d => d/2);
	area.join('path').transition().duration(600)
		.attr('d', areaFn(cases.concat([0, 0, cases[0]]))); // concat adds path closing points
	
	let labels = ['Utah COVID Cases in Early September 2020', 'Cases', '0', ifnew ? '600' : '60k', 'Date', 'Sep 1', 'Sep 7'];
	d3.selectAll('svg.areachart text').data(labels).join('text').text(d => d);
}

function updateScatter(data) {
	let fires = [];
	let ifmonth = d3.select('#firemonth').property('checked');
	let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	for (n of data) {
		fires.push({x:ifmonth ? months.indexOf(n['month']) : n['year'], y:n['acres'] / 1000});
	}
	
	let area = d3.selectAll('svg.scatterchart circle').data(fires).join('circle').transition().duration(1000)
		.attr('cx', d => ifmonth ? d.x * 25 + 13 : (d.x - 1925) * 3)
		.attr('cy', d => d.y / 2);
	
	let labels = ['California Wildfires Over Time by Acres Burned', 'Acres', '0', '600k', ifmonth ? 'Month' : 'Year', ifmonth ? 'Jan' : '1925', ifmonth ? 'Dec' : '2025'];
	d3.selectAll('svg.scatterchart text').data(labels).join('text').text(d => d);
}

function init() {
	let promises = [d3.csv('/data/fatal-police-shootings-data.csv'), d3.csv('/data/realdonaldtrump.csv'), d3.csv('/data/utah-covid.csv'), d3.csv('/data/top_20_CA_wildfires.csv')];
	dataPromises = Promise.all(promises);
	dataPromises.then(function(data) {
		shootings = Array(7).fill(0);
		tweets = Array(11).fill(0);
		cases = [];
		fires = [];

		for (x of data[0]) {
			if (x['race'] == 'W') {
				shootings[0]++;
			}
			else if (x['race'] == 'B') {
				shootings[1]++;
			}
			else if (x['race'] == 'A') {
				shootings[2]++;
			}
			else if (x['race'] == 'N') {
				shootings[3]++;
			}
			else if (x['race'] == 'H') {
				shootings[4]++;
			}
			else if (x['race'] == 'O') {
				shootings[5]++;
			}
			else if (x['race'] == '') {
				shootings[6]++;
			}
		}
		for (x of data[1]) {
			let temp = parseInt(x['date'].substr(0, 4)) - 2009;
			if (temp < 11 && temp > 0) {
				tweets[temp]++;
			}
		}
		data[2].reverse();
		for (x of data[2]) {
			cases.push(x['New cases']);
		}
		for (n of data[3]) {
			fires.push({x:n['year'], y:n['acres'] / 1000});
		}

		let owidth = '50';	// outer width of graphs (margin)
		let iwidth = '300';	// inner width of graphs
		
		// Add graph backgrounds
		let svg = d3.selectAll('svg');
		svg.append('rect').attr('x', owidth).attr('y', owidth).attr('width', iwidth).attr('height', iwidth).style('fill', 'ghostwhite').style('stroke', 'black');
		
		// Add graph data points
		let races = ['White', 'Black', 'Asian', 'Native', 'Hispanic', 'Other', 'Unknown'];
		let bar = d3.selectAll('svg.barchart').append('g').attr('transform', 'translate(70, 700) scale(1, -1)');
		bar.selectAll('rect').data(shootings).join('rect')
			.attr('x', (d, i) => i*40 )
			.attr('y', '350')
			.attr('width', '20')
			.attr('height', d => d/10)
			.style('fill', 'pink')
			.style('stroke', 'black')
			.on('mouseover', function() { d3.select(this).style('cursor', 'pointer').style('fill', 'cyan').style('stroke', 'black'); })
			.on('mouseout', function() { d3.select(this).style('cursor', 'default').style('fill', 'pink'); })
			.append('title').text((d, i) => d + ' shootings of ' + races[i].toLowerCase() + ' people');
		
		let line = d3.selectAll('svg.linechart').append('g').attr('transform', 'translate(50, 350) scale(1, -1)');
		let lineFn = d3.line().x((d, i) => 30*i).y(d => d/30);
		line.append('path')
			.attr('d', lineFn(tweets))
			.style('stroke', 'black')
			.style('fill', 'none')
			.style('stroke-width', '3px');
		
		// The area function below has some inline if statements to close the path. They're a bit convoluted but I couldn't figure out how to use line() without doing this.
		let area = d3.selectAll('svg.areachart').append('g').attr('transform', 'translate(50, 350) scale(1, -1)');
		let areaFn = d3.line().x((d, i) => i < 7 ? 50*i : (i == 7 ? 300 : 0)).y(d => d/2);
		area.append('path')
			.attr('d', areaFn(cases.concat([0, 0, cases[0]]))) // concat adds path closing points
			.style('stroke', 'black')
			.style('fill', 'pink')
		
		let scatter = d3.selectAll('svg.scatterchart').append('g').attr('transform', 'translate(50, 350) scale(1, -1)');
		scatter.selectAll('circle').data(fires).join('circle')
			.attr('cx', d => (d.x - 1925) * 3)
			.attr('cy', d => d.y / 2)
			.attr('r', 5)
			.on('mouseover', function() { d3.select(this).attr('r', '7').style('cursor', 'pointer').style('fill', 'cyan').style('stroke', 'black'); })
			.on('mouseout', function() { d3.select(this).attr('r', '5').style('cursor', 'default').style('fill', 'black'); })
			.append('title').text(d => d.y * 1000 + ' acres burned in ' + d.x);
		
		// Add all text labels
		let xalign = ['50%', '25', '25', '25', '50%', '50', '350'];		// horizontal label coords
		let yalign = ['25', '50%', '350', '50', '375', '375', '375'];	// vertical label coords
		labels = [['barchart', 'Fatal Police Shootings by Race in the US (2015-2019)', 'Cases', '0', '3000'],
			['linechart', 'Donald Trump Tweets from 2009 to 2019', 'Tweets', '0', '9000', 'Year', '2009', '2019'],
			['areachart', 'Utah COVID Cases in Early September 2020', 'Cases', '0', '600', 'Date', 'Sep 1', 'Sep 7'],
			['scatterchart', 'California Wildfires Over Time by Acres Burned', 'Acres', '0', '600k', 'Year', '1925', '2025']];
		for (var i = 0; i < 4; ++i) {
			d3.selectAll('svg.' + labels[i].shift()).selectAll('text').data(labels[i]).join('text')
				.attr('x', (d, i) => xalign[i])
				.attr('y', (d, i) => yalign[i])
				.attr('text-anchor', 'middle')
				.text(d => d);
		}
		// Bar chart labels (special case)
		d3.selectAll('svg.barchart').append('g').attr('transform', 'translate(75, 370)')
			.selectAll('text').data(races).join('text')
			.attr('x', (d, i) => i*40)
			.attr('y', (d, i) => (i%2) * 20)
			.attr('text-anchor', 'middle')
			.text(d => d);
		
		// Events for chart controls
		d3.selectAll('div.bardiv label').on('click', function() {
			let check = d3.selectAll('#' + d3.select(this).attr('for'));
			check.property('checked', !check.property('checked'));
			updateBar(data[0]);
			check.property('checked', !check.property('checked'));
		});
		d3.selectAll('div.linediv label').on('click', function() {
			d3.selectAll('#' + d3.select(this).attr('for')).property('checked', true);
			updateLine(data[1]);
		});
		d3.selectAll('div.areadiv label').on('click', function() {
			d3.selectAll('#' + d3.select(this).attr('for')).property('checked', true);
			updateArea(data[2]);
		});
		d3.selectAll('div.scatterdiv label').on('click', function() {
			d3.selectAll('#' + d3.select(this).attr('for')).property('checked', true);
			updateScatter(data[3]);
		});
	});
}
