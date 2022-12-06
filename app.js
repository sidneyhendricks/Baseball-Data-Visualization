function finalviz(){
    var filePath="teams1.csv";
    viz1(filePath);
    viz2(filePath);
    viz3(filePath);
    viz4(filePath);
    viz5(filePath);
}

var viz1=function(filePath){
    let rowConverter = function(d) {
        return {
            year: parseInt(d.yearID), 
            avg: parseFloat(d.H)/parseFloat(d.AB),
            name:  d.name
        }
    };
    d3.csv(filePath,rowConverter).then(function(data){
        
    
    let years = d3.map(data, function(d) {return d.year});
    //margins
    var margin = {top: 30, right: 30, bottom: 30, left: 60},
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

    var avg_rollup = d3.rollup(data, v => d3.mean(v, d=> d.avg), d => d.year);
    let avg_data = Array.from(avg_rollup, ([year, avg]) => ({
        year: year, 
        avg: avg
    }));
    

    //svg object
    var svg = d3.select("#v1_plot")
                .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");
    svg.append("text")
            .attr("x", (width / 2))             
            .attr("y", 0 - (margin.top / 2))
            .attr("text-anchor", "middle")  
            .style("font-size", "18px") 
            .text("Team-wide batting average across years");
    var xScale = d3.scaleBand()
                    .domain(years)
                    .range([0, width]);
    var yScale = d3.scaleLinear()
                    .domain([d3.min(data, d => d.avg), d3.max(data, d => d.avg)])
                    .range([height, 0]);
    // add tooltip 
    var tooltip = d3.select('#v1_plot')
                    .append('div')
                    .style('opacity', 0)
                    .style('position', 'absolute')
                    .attr('class', 'tooltip')
                    .style('background-color', 'white');
    const mouseover = function(e,d) {
        tooltip.style('opacity', 1)
    };
    const mouseleave = function(e,d) {
        tooltip.style('opacity', 0);
    };
    const mousemove = function(e,d) {
        tooltip 
            .html(d.name)
            .style('left', (e.pageX + 20) + 'px')
            .style('top', (e.pageY - 20)+ 'px')
    };

    //add x-axis
    svg.append('g')
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale)
            .tickValues(xScale.domain().filter(function(d,i){return !(i%10-4)})));
    svg.append('g')
        .call(d3.axisLeft(yScale));
    
    // add points
    svg.append('g')
        .selectAll('dot')
        .data(data)
        .enter()
        .append('circle')
            .attr('cx', function(d) {
                return xScale(d.year)})
            .attr('cy', function(d) {return yScale(d.avg)})
            .attr('r', 2)
            .style('fill', 'grey')
            .on('mouseover', mouseover)
            .on('mousemove', mousemove)
            .on('mouseleave', mouseleave);
    // add avg line 
    var path = svg.append('path')
        .datum(avg_data)
        .attr('fill', 'none')
        .attr('stroke', 'blue')
        .attr('stroke-width', 2)
        .attr('d', d3.line()
            .x(function(d) {return xScale(d.year)})
            .y(function(d) {return yScale(d.avg)})
    )
   
    //animate path
    const length = path.node().getTotalLength();
    function repeat() {
        path.attr('stroke-dasharray', length + " " + length)
            .attr('stroke-dashoffset', length)
            .transition()
            .ease(d3.easeLinear) 
            .attr('stroke-dashoffset', 0)
            .duration(6000)
            .on('end', () => setTimeout(repeat, 20));
        
    };
    // first animation
    repeat();
    return svg.node();
    });
    

}


var viz2=function(filePath){
    let rowConverter = function(d) {
        return {
            year: parseInt(d.yearID), 
            HR: parseFloat(d.HR),
            name:  d.name
        }
    };
    d3.csv(filePath,rowConverter).then(function(data){
        // filter for data in 2000s
        var year = 2010;
        var filtered = data.filter((d) => {return d.year == year;});
        console.log(filtered);

        let names = d3.map(filtered, function(d) {return d.name})
        var unique_names = [...new Set(names)].sort(d3.ascending);

        // margins
        var margin = {top: 30, right: 200, bottom: 90, left: 50},
            svgwidth = 800 - margin.left - margin.right,
            svgheight = 600 - margin.top - margin.bottom;
        
        var svg = d3.select("#v2_plot").append("svg")
            .attr("height", svgwidth + margin.left + margin.right)
            .attr("width", svgheight + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");  
        
        console.log(svg);
        var xScale = d3.scaleBand()
                        .domain(unique_names)
                        .range([0, svgwidth])
                        .padding(0.2);
        var yScale = d3.scaleLinear()
                        .domain([0, d3.max(filtered, d=>d.HR)])
                        .range([svgheight, 0]);
        

        //add x-axis
        var x_axis = d3.axisBottom(xScale);
        svg.append('g')
                .attr('transform', 'translate(0,'+svgheight + ")")
                .attr("class", "xAxis")
                .call(x_axis)
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("transform", "rotate(-45)");
        // add y-axis
        var y_axis = d3.axisLeft(yScale);
        svg.append('g')
                .attr("class", "yAxis")
                .call(y_axis)

        //add bars 
        svg.selectAll('rect')
            .data(filtered)
            .enter()
            .append('rect')
            .attr('x', function(d) {return xScale(d.name)})
            .attr('y', function(d) {return yScale(d.HR)})
            .attr('width', xScale.bandwidth())
            .attr('height', function(d) {return svgheight - yScale(d.HR);})
            .attr('fill', 'blue');
        svg.append("text")
            .attr("x", (svgwidth / 2))             
            .attr("y", 0 - (margin.top / 2))
            .attr('fill', 'black')
            .attr("text-anchor", "middle")  
            .style("font-size", "18px") 
            .text("Home runs per team in a given year ");

        // function to update the data based on year
        var radio = d3.selectAll("input[name='year']").on('change', function(d) {
            year = d.target.value;
            filtered = data.filter((d) => {return d.year == year;});
            names = d3.map(filtered, function(d) {return d.name})
            unique_names = [...new Set(names)].sort(d3.ascending);

            //update X axis 
            xScale.domain(unique_names);
            x_axis = d3.axisBottom(xScale);

            svg.selectAll('xAxis')
                .transition()
                .duration(1000)
                .call(x_axis)
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("transform", "rotate(-45)");;
            // update y axis
            yScale.domain([0, d3.max(filtered, d=>d.HR)]);
            y_axis = d3.axisLeft(yScale);
            svg.selectAll('yAxis')
                .transition()
                .duration(1000)
                .call(y_axis)
            //create u variable
            svg.selectAll('rect')
                        .data(filtered)
                        .transition()
                        .duration(1000)
                            .attr('x', function(d) {return xScale(d.name)})
                            .attr('y', function(d) {
                                console.log(yScale(d.HR));
                                return yScale(d.HR)})
                            .attr('width', xScale.bandwidth())
                            .attr('height', function(d) {return svgheight - yScale(d.HR);})
                            .attr('fill', 'blue')
            
            
            
            
        });
        // update(year);
        

    });

};

var viz3=function(filePath){
    let rowConverter = function(d) {
        return {
            year: parseInt(d.yearID), 
            attendance: parseFloat(d.attendance),
            name:  d.name
        }
    };
    d3.csv(filePath,rowConverter).then(function(data){
        // attendance wasn't taken at all parks before 1916 so we will filter data
        // to only be 1916 and after
        console.log(data);
        var filtered = data.filter((d) => {
            return d.year > 1915 & d.year <= 2015 
                & (d.name == "Boston Red Sox" | d.name == 'Chicago Cubs' | d.name == '"Cincinnati Reds"'
                | d.name == 'New York Yankees' | d.name == 'Chicago White Sox');
        });
        console.log(filtered);
        var year_group = d3.group(filtered, d => d.year);
        console.log(year_group);
        let year_arr = new Map();
        year_group.forEach(function(vals, year) {
            var curr_arr = {};
            vals.forEach(function(v, y) {
                curr_arr[v.name] = v.attendance;
            });
            year_arr.set(year, curr_arr);
        });
        console.log(year_arr);
        let format = Array.from(year_arr, ([year, vals]) => ({
            year: year, 
            ...vals
        }));
        let years = d3.map(format, function(d) {return d.year});
        let keys = [...new Set(filtered.map(d => d.name))].sort(d3.ascending);
        let rowsums = d3.map(format, function(d) {
            return d3.sum(Object.values(d).slice(1))
        });
        
        var margin = {top: 30, right: 50, bottom: 115, left: 60},
            svgwidth = 1000 - margin.left - margin.right,
            svgheight = 500 - margin.top - margin.bottom;
        
        var xScale = d3.scaleBand()
            .domain(years)
            .range([0, svgwidth]);
        var yScale = d3.scaleLinear()
            .domain([0-d3.max(rowsums), d3.max(rowsums)])
            .range([svgheight, 0]);
        var colors = d3.scaleOrdinal(d3.schemeCategory10)
            .domain(keys);
        let stackgenerator = d3.stack().keys(keys).offset(d3.stackOffsetSilhouette);
        let stacked = stackgenerator(format);
        console.log(stacked);
        let areas = d3.area()
                    .x(function(d){
                        return xScale(d.data.year)
                    })
                    .y0(function(d){
                        return yScale(d[0])
                    })
                    .y1(function(d){
                        return yScale(d[1])
                    });
              
        
        var svg = d3.select('#v3_plot').append('svg')
                    .attr('width', svgwidth + margin.left + margin.right)
                    .attr('height', svgheight + margin.top + margin.bottom)
                    .append('g')
                    .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");
        
        console.log(areas);
        // add x axis
        svg.append('g')
            .attr('transform', 'translate(0,'+svgheight + ")")
            .call(d3.axisBottom(xScale)
                .tickValues(xScale.domain().filter(function(d,i){ return !(i%10)})))
            .attr("class", "xAxis")
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("transform", "rotate(-45)"); 
        
        // add y axis
        svg.append('g')
            .call(d3.axisLeft(yScale))
            .attr("class", "yAxis");
        svg.selectAll(".layers")
            .data(stacked).enter().append("path")
            .attr("d", areas)
            .attr("fill", colors);
        // graph title
        svg.append("text")
            .attr("class", "title")
            .attr("x", (svgwidth / 2))             
            .attr("y", 0 - (margin.top / 2))
            .attr('fill', 'black')
            .attr("text-anchor", "middle")  
            .style("font-size", "18px") 
            .text("Home Team Attendance Over Time");  
        // legend
        svg.selectAll('mydots')
                .data(stacked)
                .enter()
                .append('circle')
                    .attr('cx', 30)
                    .attr('cy', function(d,i){ return 10 + i*25})
                    .attr('r', 5)
                    .style('fill', function(d) {return colors(d)})
        svg.selectAll('mylabels')
                .data(stacked)
                .enter()
                .append('text')
                    .attr('x', 40)
                    .attr('y', function(d,i) {return 10+ i*25})
                    .style('fill', 'black')
                    .text(function(d, i) {return keys[i]})
                    .attr('text-anchor', 'left')
                    .style('alignment-baseline', 'middle')
    });
}

var viz4=function(filePath){
    let rowConverter = function(d) {
        return {
            year: parseInt(d.year),
            state: d.state, 
            longitude: parseFloat(d.longitude), 
            latitude: parseFloat(d.latitude),
            HR: parseInt(d.HR)
        }
    };
    d3.csv(filePath,rowConverter).then(function(data){
        console.log(data);
        //filter out empty state values
        var filtered = data.filter((d) => {
            return d.state != "";
        });
        //get data in right format 
        // var state_roll = d3.rollup(filtered, v => d3.sum(v, d=> d.HR), d=> d.state)
        // console.log(state_roll);
        // let state_arr = Array.from(state_roll, ([state, HR]) => ({
        //     state, HR
        // }));
        // console.log(state_arr);
        var state_gr = d3.group(filtered, d => d.state); 
        var state_obj = {};
        let hr_arr = []
        state_gr.forEach(function(val, state) {
            state_obj[state] = {'HR': d3.sum(val, d => d.HR), 'longitude': val[0].longitude, 'latitude':val[0].latitude};
            hr_arr.push(d3.sum(val, d => d.HR));
        })
       

        let hr_map = new Map();
        for (key in state_obj) {
            hr_map.set(key, state_obj[key])
        }
        let hr_arr2 = Array.from(hr_map, ([state, vals]) => ({
            state: state, 
            ...vals
        }))

        var width = 960;
        var height = 500;
        var svg = d3.select('#v4_plot').append('svg')
            .attr('width', width)
            .attr('height', height);
        svg.append("text")
            .attr("x", (10))             
            .attr("y", 0 - (10))
            .attr('fill', 'black')
            .attr("text-anchor", "middle") 
            .style('position', 'absolute')
            .style("font-size", "18px") 
            .text("Total Number of Home Runs Hit Per State With Zoom Feature");  
        var g = svg.append('g');
            
        const statesmap = d3.json("us-states.json");

        statesmap.then(function(map) {
            console.log(map);
            var projection = d3.geoAlbersUsa();
            var path = d3.geoPath().projection(projection);
         
            g.selectAll('path')
                .data(map.features)
                .enter()
                .append('path')
                .attr('d', path)
                .style('fill', 'white')
                .style('stroke', 'black')
        let rScale = d3.scaleLinear()
                        .domain([d3.min(hr_arr), d3.max(hr_arr)])
                        .range([3, 12])
        //svg.append('g').selectAll('circle')
        g.selectAll('circle')
                        .data(hr_arr2)
                        .enter()
                        .append('a')
                        .append('circle')
                        .attr('cx', function(d) {
                            return projection([d.longitude, d.latitude])[0];
                        })
                        .attr('cy', function(d) {
                            return projection([d.longitude, d.latitude])[1];
                        })
                        .attr('r', function(d) {
                            return rScale(d.HR)
                        })
                        .style('fill', 'blue')
                        .attr('stroke', 'black');
        
        });
        
        var zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on('zoom', function(e) {
                g.selectAll('path')
                    .attr('transform', e.transform)
                g.selectAll("circle")
                    .attr('transform', e.transform);
            });
        svg.call(zoom)
        
    });
};


var viz5=function(filePath){
    let rowConverter = function(d) {
        return {
            year: parseInt(d.yearID), 
            wins: parseInt(d.W),
            name:  d.name
        }
    };
    d3.csv(filePath,rowConverter).then(function(data){
        //filter to only teams of interest  
        var filtered = data.filter((d) => {
            return d.year > 1900 & d.year <= 2015 
                & d.name == "San Francisco Giants";
        });
        
        let wins = d3.map(filtered, function(d) {return d.wins});
        
        //compute summary stats the boxplot
        var wins_sorted = wins.sort(d3.ascending)
        var q1 = d3.quantile(wins_sorted, .25)
        var median = d3.quantile(wins_sorted, .5)
        var q3 = d3.quantile(wins_sorted, .75)
        var interQuantileRange = q3 - q1
        var min = q1 - 1.5 * interQuantileRange
        var max = q1 + 1.5 * interQuantileRange            
        
        //create margins and create svg
        var margin = {top: 10, right: 30, bottom: 30, left: 40},
        width = 400 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

        var svg = d3.select("#v5_plot")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");
        
        //create y-scale
        var yScale = d3.scaleLinear()
                        .domain([0, d3.max(wins)])
                        .range([height, 0])
        svg.call(d3.axisLeft(yScale))
        
        svg.append("text")
            .attr("x", (width / 2))             
            .attr("y", (margin.top / 2) + 50)
            .attr("text-anchor", "middle")  
            .style("font-size", "18px") 
            .text("Distribution of Number of Wins For SF Giants Per Year");
        var center = 200
        var width = 100

        // verical line 
        svg.append('line')
            .attr('x1', center)
            .attr('x2', center)
            .attr('y1', yScale(min))
            .attr('y2', yScale(max))
            .attr('stroke', 'black')
        
        //box 
        svg.append('rect')
            .attr('x', center-width/2)
            .attr('y', yScale(q3))
            .attr('height', (yScale(q1)-yScale(q3)))
            .attr('width', width)
            .attr('stroke', 'black')
            .style('fill', 'teal')
        // other boxplot lines
        svg.selectAll('toto')
            .data([min, median, max])
            .enter()
            .append('line')
                .attr('x1', center-width/2)
                .attr('x2', center+width/2)
                .attr('y1', function(d) {return (yScale(d))})  
                .attr('y2', function(d) {return (yScale(d))})
                .attr('stroke', 'black') 


    });

};