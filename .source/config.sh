#!/bin/bash

# global config file
# used by the static site builder (build-site.sh) and by php

author="mulllhausen"
site_description="the frontend id system"
source_dir="."
processing_dir="../processing"
production_dir="../"
tmp_err_log="build-site-err.txt"

#build_for="production"
#schema="https://"
#domain="frontid.null.place"

#build_for="dev"
schema="file://"
domain="$production_dir"

# the files that will be copied from source to processing - all files, by default
explain_files_for_processing="all"
files_for_processing="*"
explain_mandatory_files_for_processing="php files and config.sh"
mandatory_files_for_processing="*php config.sh"

# files to proces with php. left first, right last (must be a subset of
# site_file_extensions)
process_file_extensions="svg css html"

# the files that will be copied from processing to production - no special order
production_file_extensions="html css js svg ico png"
