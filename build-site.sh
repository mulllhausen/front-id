#!/bin/bash

# a minimalistic php site builder.
# 1) files are copied from the source dir to the specified processing dir
# 2) files are processed and overwritten
# 3) the processing dir is renamed to the production dir
# this way production is only updated if everything is successful

source config.sh

php="$(which php)"
if [[ $? != 0 ]]; then
    echo "php is not installed"
    exit 1
fi

if [[ "$($php -i | grep short_open_tag | grep On)" == "" ]]; then
    ini_file="$($php --ini | grep "Loaded Configuration File" | cut -d' ' -f12)"
    echo "php does not have the short_open_tag option"
    echo "turn it on in $ini_file"
    exit 1
fi

# if the processing dir exists ...
if [[ -d "$processing_dir" ]]; then
    echo -n "deleting the contents of the processing dir ($processing_dir/) ... "
    rm -rf "$processing_dir/*" 2>"$tmp_err_log"
    if [[ $? == 0 ]]; then
        echo "done"
    else
        echo "fail"
        echo
        cat "$tmp_err_log"
        rm "$tmp_err_log"
        exit 1
    fi
else
    echo -n "processing dir ($processing_dir/) does not exit. creating it now ... "
    mkdir "$processing_dir" 2>"$tmp_err_log"
    if [[ $? == 0 ]]; then
        echo "done"
    else
        echo "fail"
        echo
        cat "$tmp_err_log"
        rm "$tmp_err_log"
        exit 1
    fi
fi

echo -n "copying source/ files to processing dir ($processing_dir/) ... "
cp -r source/* "$processing_dir/" 2>"$tmp_err_log"
if [[ $? == 0 ]]; then
    echo "done"
else
    echo "fail"
    echo
    cat "$tmp_err_log"
    rm "$tmp_err_log"
    exit 1
fi

x="$(which find)"
if [[ $? != 0 ]]; then
    echo "find command is not installed"
    exit 1
fi

# sort files using $process_file_extensions
for extension in $process_file_extensions; do
    files_with_extension="$(find "$processing_dir" -type f -name "*.$extension")"
    process_files="$process_files $files_with_extension"
done

# note: $process_files has a space on the front, but this is ignored by the
# following loop so no need to remove it

for f in $process_files; do
    echo -n "processing file $f ... "
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
 
echo -n "deleting the production dir ($production_dir/) ... "
rm -rf "$production_dir" 2>"$tmp_err_log"
if [[ $? == 0 ]]; then
    echo "done"
else
    echo "fail"
    echo
    cat "$tmp_err_log"
    rm "$tmp_err_log"
    exit 1
fi

echo -n "renaming processing dir ($processing_dir/) to production dir ($production_dir/) ... "
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
