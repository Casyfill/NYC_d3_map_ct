server:
	python -m http.server 8000;

upload:
	aws s3 sync . s3://qclm-nyc-ct/app/v2/  --delete  --exclude '*.md' --exclude '*.DS_Store' --exclude '.git/*' --acl public-read