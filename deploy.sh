aws s3 cp ./dist/ s3://devon.church/ --recursive \
--exclude '*.png' \
--exclude 'manifest.json' \
--acl 'public-read' \
--content-encoding 'gzip' \
&& \
aws s3 cp ./dist/ s3://devon.church/ --recursive \
--exclude '*' \
--include '*.png' \
--include 'manifest.json' \
--acl 'public-read'