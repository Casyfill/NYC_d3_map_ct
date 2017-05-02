# coding: utf-8
import json
import pandas as pd
from glob import glob
import os


files = glob('data/partitions_with_stats/*_stats.csv')

def _get_name(p):
    return os.path.basename(p)[:-4]

def main():
	initial_data = {_get_name(p):pd.read_csv(p) for p in files}
	
	new_data = {k:v.to_dict(orient='row') for k,v in initial_data.items()}
	
	with open('data/communities_stats2.json', 'w') as f:
	    json.dump(new_data, f)

if __name__ == '__main__':
	main()
    
