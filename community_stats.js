
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

function get_all_community_stats(csv_data, comm_properties){
	var all_comm_stats = {}; //= comm_properties;

	comm_columns = ['part_all_','part_hidden_','part_recipr_'];
	comm_columns.forEach(function(comm_column, i){
		
		var data = d3.nest()
		  .key(function(d) { return d[comm_column];})
		  .rollup(function(d) { 
		  	    return {
			        population: d3.sum(d, function(g) {return g.population; }),
			        tracts: d.length
			    	};
		  }).entries(csv_data);


		  data.forEach(function(d,i){
		  	var result = comm_properties[comm_column].filter(function(dd) {
        		return dd.key == d.key;});

		  	// d.value = Object.assign(d.value, result[0])
		  	cols = ["communityUsers","communityOutConnections",
            		"communityInConnections", "communityInternalConnections"]
            for (var i = 0; i < cols.length; i++){
            		col = cols[i];
    				d.value[col] = (result[0] !== undefined) ? result[0][col] : null;
    			}
		  })

		  all_comm_stats[comm_column] = data
	 })


	return all_comm_stats;
}



function get_community_datas(i, comm_stats){
	return comm_stats.filter(function(d){ return d.key == i })[0]
}