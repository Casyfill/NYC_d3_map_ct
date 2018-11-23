server2:
		python -m SimpleHTTPServer 8000

server:
		python -m http.server 8000

# dryrun:
# 	aws s3 sync . s3://streeteasy-research/data_download_prototype/charts  --dryrun --exclude ".git/*" --exclude ".DS_Store" --exclude ".gitignore" --exclude "scripts/*"  --exclude ".py"

# upload:
# 	aws s3 sync . s3://streeteasy-research/data_download_prototype/charts --exclude ".git/*" --exclude ".DS_Store" --exclude ".gitignore" --exclude "scripts/*"  --exclude ".py"