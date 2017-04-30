
function get_community_stats(csv_data, comm_column){
	var data = d3.nest()
	  .key(function(d) { return d[comm_column];})
	  .rollup(function(d) { 
	  	    return {
		        population: d3.sum(d, function(g) {return g.population; }),
		        tracts: d.length
		    	};
	  }).entries(csv_data);

	return data
}


function get_community_population(i, comm_stats){
	return comm_stats.filter(function(d){ return d.key == i })[0]
}