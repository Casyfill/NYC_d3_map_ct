# coding: utf-8
import json
import pandas as pd
from glob import glob
files = glob('data/partitions_with_stats/*_stats.csv')
len(files)
import os
def _get_name(p):
    return os.path.basename(p)[:-4]
initial_data = {_get_name(p):pd.read_csv(p, index='communityNumber') for p in files}
initial_data = {_get_name(p):pd.read_csv(p, index_col
='communityNumber') for p in files}
initial_data.keys()
initial_data['part_all__stats']
for v in initial_data.values():
    v.index = v.index.astype(str)
    
new_data = {k:v.to_dict(orient='index') for k,v in initial_data.items()}
new_data
new_data.keys()
with open('data/communities_stats.json', 'w') as f:
    json.dump(new_data, f)
    
