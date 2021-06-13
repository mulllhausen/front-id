#!/bin/bash

# a minimalistic php site builder.
# 1) files are copied from the source dir to the specified production dir
# 2) files are processed and overwritten

die() {
    echo -e "$*" 1>&2
    if [[ -f "$tmp_err_log" ]]; then
        cat "$tmp_err_log"
        rm "$tmp_err_log"
    fi
    exit 1
}

# check we have all the programs used in this script
for program in "php" "readlink" "find" "dirname" "pwd" "grep" "cut" "rsync" "sed"; do
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

if [[ "$1" != "" ]]; then
    # overwrite these config variables
    explain_files_for_processing="$1"
    files_for_processing="$1"
    echo "processing only $files_for_processing file(s)"
fi

# make all path variables absolute
tmp_err_log="$abs_path/$tmp_err_log"
source_dir="$abs_path/$source_dir"
production_dir="$abs_path/$production_dir"

# check path variables exist
[[ ! -d "$source_dir" ]] && die "source dir ($source_dir/) does not exist"
[[ ! -d "$production_dir" ]] && die "production dir ($production_dir/) does" \
"not exist and i'm not going to create it for you"

# check php is properly configured
php_err="" # init
php_err_count=0
it_them="it"
if [[ "$(php -i | grep short_open_tag | grep On)" == "" ]]; then
    php_err=", short_open_tag"
    php_err_count=$((php_err_count+1))
fi
if [[ "$(php -i | grep register_argc_argv | grep On)" == "" ]]; then
    php_err="$php_err, register_argc_argv"
    php_err_count=$((php_err_count+1))
fi
if [[ $php_err != "" ]]; then
    ini_file="$(php --ini | grep "Loaded Configuration File" | cut -d' ' -f12)"
    php_err="${php_err:1}" # chop off first character
    if [[ $php_err_count > 1 ]]; then it_them="them"; fi
    die "php is missing the following tags:$php_err\nturn $it_them on in $ini_file"
fi

# normalize some path variables (purely for pretty logging)
# eg. turn this /home/me/blah/../blah/ into /home/me/blah/
source_dir="$(unset CDPATH && cd "$source_dir" && pwd)"
production_dir="$(unset CDPATH && cd "$production_dir" && pwd)"

echo -n "copying $explain_files_for_processing file(s) from the source dir" \
"($source_dir/) to the production dir ($production_dir/) ... "

rsync -a --prune-empty-dirs --include="*/" --include="$files_for_processing" \
--exclude="*" "$source_dir/"* "$production_dir/" 2>"$tmp_err_log"

if [[ $? == 0 ]]; then
    echo "done"
else
    die "fail"
fi

echo -n "substituting variables in $production_dir/config.sh with their" \
"values ... "
sed "$production_dir/config.sh" > "$production_dir/config.sh.tmp" \
2>"$tmp_err_log" \
-e "s|\(source_dir=\"\).*\(\"$\)|\1$source_dir\2|" \
-e "s|\(production_dir=\"\).*\(\"$\)|\1$production_dir\2|" \
-e "s|\$production_dir|$production_dir|"

if [[ $? == 0 ]]; then
    mv "$production_dir/config.sh.tmp" "$production_dir/config.sh"
    echo "done"
else
    die "fail"
fi

# list and sort files using $process_file_extensions
for extension in $process_file_extensions; do
    files_with_extension="$( \
        find "$production_dir" \
        -type f \
        -name "*.$extension" \
        -name "$files_for_processing" \
        -not -path "$source_dir/*" \
    )"
    process_files="$process_files $files_with_extension"
done
# note: $process_files has a space at the start, but this is ignored by the
# following loop so no need to remove it

# process the specified files using php
for f in $process_files; do
    echo -n "processing file $f ... "
    php "$f" "$production_dir" > "$f.tmp" 2>"$tmp_err_log"
    if [[ $? == 0 ]]; then
        mv "$f.tmp" "$f"
        echo "done"
    else
        just_one=""
        if [[ "$explain_files_for_processing" != "all" ]]; then
            # bash is so cumbersome! use an array to write a multiline string :P
            just_one=(
                "\ndon't forget to build all files first. then you can build"
                "individual files"
            )
        fi
        die "fail\nstopped processing files now${just_one[*]}"
    fi
done
 
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

echo "SUCCESS"
