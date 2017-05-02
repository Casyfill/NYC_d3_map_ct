
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

function get_all_community_stats(csv_data){
	var all_comm_stats = {}
	comm_columns = ['part_all_','part_hidden_','part_recipr_'];
	
	for (var i = 0; i < 3; i++){
		comm_column = comm_columns[i];

		var data = d3.nest()
		  .key(function(d) { return d[comm_column];})
		  .rollup(function(d) { 
		  	    return {
			        population: d3.sum(d, function(g) {return g.population; }),
			        tracts: d.length
			    	};
		  }).entries(csv_data);

		  all_comm_stats[comm_column] = data
	 }
	return all_comm_stats;
}



function get_community_population(i, comm_stats){
	return comm_stats.filter(function(d){ return d.key == i })[0]
}