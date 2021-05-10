#!/bin/bash

# global config file
# used by the static site builder (build-site.sh) and by php

# production
schema="https://"
domain="frontid.null.place"

# dev (make all paths relative)
#schema=""
#domain=""

author="mulllhausen"
site_description="the frontend id system"
source_dir="."
processing_dir="../processing"
production_dir="../"
tmp_err_log="build-site-err.txt"

# left first, right last
process_file_extensions="css html"

# no special order
site_file_extensions="html css js svg ico png"
