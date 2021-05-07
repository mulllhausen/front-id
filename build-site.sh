#!/bin/bash

# a minimalistic php site builder.
# 1) files are copied from the source dir to the specified processing dir
# 2) files are processed and overwritten
# 3) the processing dir is renamed to the production dir
# this way production is only updated if everything is successful

processing_dir="processing"
production_dir="production"
process_file_extensions="html|css"
tmp_err_log="build-site-err.txt"

php=$(which php)
if [[ $? != 0 ]]; then
    echo "php is not installed"
    exit 1
fi

if [[ $($php -i | grep short_open_tag | grep On) == "" ]]; then
    ini_file=$($php --ini | grep "Loaded Configuration File" | cut -d' ' -f12)
    echo "php does not have the short_open_tag option"
    echo "turn it on in $ini_file"
    exit 1
fi

echo -n "start copying source/ files to processing dir ($processing_dir/)... "
cp -r source/* $processing_dir/ 2>"$tmp_err_log"
if [[ $? == 0 ]]; then
    echo "done"
else
    echo "fail"
    echo
    cat "$tmp_err_log"
    rm "$tmp_err_log"
    exit 1
fi

x=$(which find)
if [[ $? != 0 ]]; then
    echo "find command is not installed"
    exit 1
fi

process_files=$(find $processing_dir \
    -type f \
    -regextype posix-extended \
    -regex ".*\.($process_file_extensions)"
)
for f in $process_files; do
    echo -n "processing file $f... "
    $php "$f" > "$f.tmp" 2>"$tmp_err_log"
    if [[ $? == 0 ]]; then
        mv "$f.tmp" "$f"
        echo "done"
    else
        echo "fail"
        echo "stopped processing files now"
        echo "production is unchanged"
        echo
        cat "$tmp_err_log"
        rm "$tmp_err_log"
        exit 1
    fi
done
 
echo -n "renaming processing dir ($processing_dir/) to production dir ($production_dir/)... "
mv "$processing_dir" "$production_dir" 2>"$tmp_err_log"
if [[ $? == 0 ]]; then
    echo "done"
else
    echo "fail"
    echo
    cat "$tmp_err_log"
    rm "$tmp_err_log"
    exit 1
fi
