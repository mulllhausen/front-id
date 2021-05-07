#!/bin/bash

production_dir="production"
process_file_extensions="html|php|css"
php="/usr/bin/php"

if [[ $($php -i | grep short_open_tag | grep On) == "" ]]; then
    ini_file=$($php --ini | grep "Loaded Configuration File" | cut -d' ' -f12)
    echo "php does not have the short_open_tag option"
    echo "turn it on in $ini_file"
    exit 1
fi

echo -n "start copying source files to production... "
cp -r source/* $production_dir/
echo "done"

process_files=$(find $production_dir \
    -type f \
    | grep "test.html"
#    -regextype posix-extended \
#    -regex ".*\.($process_file_extensions)"
)
for f in $process_files;do
    echo -n "processing $f... "
    $php "$f" > "$f"
    echo "done"
done
