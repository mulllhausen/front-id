#!/bin/bash

# a minimalistic php site builder.
# 1) files are copied from the source dir to the specified processing dir
# 2) files are processed and overwritten
# 3) the processing dir is renamed to the production dir
# this way production is only updated if everything is successful

die() {
    echo -e "$*" 1>&2
    if [[ -f "$tmp_err_log" ]]; then
        cat "$tmp_err_log"
        rm "$tmp_err_log"
    fi
    exit 1
}

explain_files="all" # init
specific_files="*"
if [[ "$1" != "" ]]; then
    explain_files="$1"
    specific_files="$1"
    echo "processing only $specific_files file(s)"
fi

# check we have all the programs used in this script
for program in "php" "readlink" "find" "dirname" "pwd" "grep" "cut" "rsync"; do
    x="$(which $program)"
    if [[ $? != 0 ]]; then
        die "$program is not installed"
    fi
done

# reference everything relative to this absolte path. this way we can call this
# script from anywhere without it doing bad things (such as `rm -rf`ing other
# dirs)
abs_path="$(dirname $(readlink -f $0))"

# import shared variables
source "$abs_path/config.sh"

# make all path variables absolute
tmp_err_log="$abs_path/$tmp_err_log"
source_dir="$abs_path/$source_dir"
production_dir="$abs_path/$production_dir"
processing_dir="$abs_path/$processing_dir"

# check path variables exist
[[ ! -d "$source_dir" ]] && die "source dir ($source_dir/) does not exist"
[[ ! -d "$production_dir" ]] && die "production dir ($production_dir/) does" \
"not exist and i'm not going to create it for you"

# check php is properly configured
if [[ "$(php -i | grep short_open_tag | grep On)" == "" ]]; then
    ini_file="$(php --ini | grep "Loaded Configuration File" | cut -d' ' -f12)"
    die "php does not have the short_open_tag option\nturn it on in $ini_file"
fi

# normalize some path variables (purely for pretty echos)
# eg. turn this /home/me/blah/../blah/ into /home/me/blah/
source_dir="$(unset CDPATH && cd "$source_dir" && pwd)"
production_dir="$(unset CDPATH && cd "$production_dir" && pwd)"

# if the processing dir exists ...
ree=""
if [[ -d "$processing_dir" ]]; then
    # normalize this path variable (purely for a pretty echo)
    processing_dir="$(unset CDPATH && cd "$processing_dir" && pwd)"

    echo -n "deleting the processing dir ($processing_dir/) ... "
    rm -rf "$processing_dir" 2>"$tmp_err_log"
    if [[ $? == 0 ]]; then
        echo "done"
        ree="re"
    else
        die "fail"
    fi
fi

echo -n "${ree}creating the processing dir ($processing_dir/) ... "
mkdir "$processing_dir" 2>"$tmp_err_log"
if [[ $? == 0 ]]; then
    echo "done"
else
    die "fail"
fi

# normalize the final path variable (purely for a pretty echo)
processing_dir="$(unset CDPATH && cd "$processing_dir" && pwd)"

echo -n "copying $explain_files files from the source dir ($source_dir/) to" \
"the processing dir ($processing_dir/) ... "

rsync -a --prune-empty-dirs --include="*/" --include="$specific_files" \
--exclude="*" "$source_dir/"* "$processing_dir/" 2>"$tmp_err_log"

if [[ $? == 0 ]]; then
    echo "done"
else
    die "fail"
fi

# list and sort files using $process_file_extensions
for extension in $process_file_extensions; do
    files_with_extension="$(find "$processing_dir" -type f -name "*.$extension")"
    process_files="$process_files $files_with_extension"
done
# note: $process_files has a space at the start, but this is ignored by the
# following loop so no need to remove it

# process the specified files using php
for f in $process_files; do
    echo -n "processing file $f ... "
    php "$f" > "$f.tmp" 2>"$tmp_err_log"
    if [[ $? == 0 ]]; then
        mv "$f.tmp" "$f"
        echo "done"
    else
        die "fail\nstopped processing files now\nproduction is unchanged"
    fi
done
 
# copy the specified files to production
for extension in $site_file_extensions; do
    files_with_extension="$(find "$processing_dir" -type f -name "*.$extension")"
    if [[ "$files_with_extension" == "" ]]; then
        echo "no $extension files for production"
        continue
    fi

    echo -n "copying $extension files from processing dir ($processing_dir/)" \
    "to production dir ($production_dir/) ... "

    rsync -a --include="*/" --include="*.$extension" --exclude="*" \
    "$processing_dir/"* "$production_dir/" 2>"$tmp_err_log"

    if [[ $? == 0 ]]; then
        echo "done"
    else
        die "fail"
    fi
done

# clean up the processing dir
echo -n "deleting the processing dir ($processing_dir/) ... "
rm -rf "$processing_dir" 2>"$tmp_err_log"
if [[ $? == 0 ]]; then
    echo "done"
else
    die "fail"
fi

# clean up the error log file if it exists ...
if [[ -f "$tmp_err_log" ]]; then
    echo -n "deleting the the temporary error log file ($tmp_err_log) ... "
    rm "$tmp_err_log"
    if [[ $? == 0 ]]; then
        echo "done"
    else
        die "\n... fail"
    fi
fi
