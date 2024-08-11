#!/bin/sh

app=$1

if [ "$app" != "snutt-webclient" ] && [ "$app" != "friends-react-native" ] && [ "$app" != "theme-market" ]; then
  echo
  echo "\033[31mInvalid app name.\033[0m"
  echo
  exit 1
fi

today=$(date +%y.%m.%d)
tagFormat="${app}-dev-${today}-"

git fetch --all --tags
tagCount=$(git tag -l | grep -c $tagFormat)

newTagNumber=$(($tagCount + 1))
newTagName="${tagFormat}${newTagNumber}"

echo
echo "=================================="
echo
echo "   Created tag: \033[1m${newTagName}\033[0m   "
echo
echo "=================================="
echo
read -p "Are you sure to push this tag? (Y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
  git tag -a $newTagName -m $newTagName
  git push origin $newTagName
else
  echo
  echo "\033[31mCanceled.\033[0m"
  echo
  exit 1
fi
