#!/usr/bin/python3

# a minimalistic static site builder tailored to front-id

# files and their structure under .source are copied to the specified production
# directory

import os
import shutil
import json
import pudb

def main():
    pu.db
    import_config()
    copy_files_to_production()

def import_config():
    global config
    with open("config.json", "r") as f:
        config = json.load(f)

def copy_files_to_production():
    all_files = os.listdir("source/")
    for f in all_files:
        file_extension = os.path.splitext(f)
        if f not in config.processFileTypes:
            continue

        shutil.copy2(f, os.path.join(config.productionDir, f)

if __name__ == "__main__":
    main()
