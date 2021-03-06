#!/bin/bash

# global config file
# used by the static site builder (build-site.sh) and by php

author="mulllhausen"
sitename="frontID"
site_description="the frontend id system"
source_dir="."
production_dir="../"
tmp_err_log="build-site-err.txt"

build_for="production"
schema="https://"
domain="frontid.null.place"

#build_for="dev"
#schema="file://"
#domain="$production_dir"

# the files that will be copied from source to production - all files, by default
explain_files_for_processing="all"
files_for_processing="*"

# files to proces with php. left first, right last
process_file_extensions="svg css js html"
