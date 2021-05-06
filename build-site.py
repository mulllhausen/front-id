#!/usr/bin/python3

"""
a minimalistic static site builder tailored to front-id

files and their structure under source are copied to the specified production
directory

"""

import os
import shutil
import json
import pudb

def main():
    pu.db
    import_config()
    copy_files_to_production_dir()

def import_config():
    global config
    with open("config.json", "r") as f:
        config = json.load(f)

def copy_files_to_production_dir():
    for (path, subdirs, files) in os.walk("source"):
        subdir = "" # init to an empty subdir - ignored in a path join
        if "source/" in path:
            subdir = path.replace("source/", "")

        for f in files:
            file_extension = f.split(".")[-1]
            if file_extension not in config["processFileTypes"]:
                continue

            newfile_and_path = os.path.join(config["productionDir"], subdir, f)
            os.makedirs(os.path.dirname(newfile_and_path), exist_ok = True)
            shutil.copy2(os.path.join(path, f), newfile_and_path)

if __name__ == "__main__":
    main()
