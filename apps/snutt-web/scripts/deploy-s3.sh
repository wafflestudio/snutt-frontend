#!/bin/sh
# next build 로 만든 out/ 을 S3 에 올리고 CloudFront 캐시를 지운다.
# 사용: scripts/deploy-s3.sh <S3 버킷> <CloudFront 배포 ID>   (apps/snutt-web 에서, AWS 자격 증명이 있는 상태로)
# -f: 아래 --exclude 의 * 를 셸이 펼치지 않게 한다
set -euf

bucket=$1
distribution=$2

# CloudFront 는 /friends 에 friends.html 을 찾아 주지 않는다. 페이지마다 확장자 없는 키로 html 을 한 벌 더 올린다
pages=$(cd out && find . -name '*.html' ! -name index.html ! -name 404.html | sed 's|^\./||; s|\.html$||')

# 해시가 붙은 파일은 오래 캐시한다. 지난 배포의 파일은 지우지 않는다 (열려 있던 탭이 옮겨 갈 때 쓴다)
aws s3 sync out/_next/static "s3://$bucket/_next/static" --cache-control 'public, max-age=31536000, immutable'

for page in $pages; do
  aws s3 cp "out/$page.html" "s3://$bucket/$page" --content-type 'text/html; charset=utf-8' --cache-control 'no-cache'
done

# 나머지(html, 화면 전환용 .txt)는 매번 새로 받게 한다. 위에서 올린 것은 지우지 않도록 뺀다
excludes='--exclude _next/static/*'
for page in $pages; do excludes="$excludes --exclude $page"; done
# shellcheck disable=SC2086
aws s3 sync out "s3://$bucket" --delete $excludes --cache-control 'no-cache'

aws cloudfront create-invalidation --distribution-id "$distribution" --paths '/*'
