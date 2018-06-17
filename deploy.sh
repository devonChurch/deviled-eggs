aws s3 cp ./dist/ s3://devon.church/ --recursive \
--exclude '*.png' \
--exclude 'manifest.json' \
--cache-control max-age=86400,public \
--acl 'public-read' \
--content-encoding 'gzip' \
&& \
aws s3 cp ./dist/ s3://devon.church/ --recursive \
--exclude '*' \
--include '*.png' \
--include 'manifest.json' \
--cache-control max-age=86400,public \
--acl 'public-read'