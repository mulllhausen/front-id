#!/usr/bin/python3

"""
a minimalistic static site builder tailored to front-id

files and their structure under source/ are copied to the production directory
specified in config.json

"""

import os
import shutil
import json
import re
import pudb

data = {
    "files": []
}

def main():
    pu.db
    import_config()
    parse_files()
    #copy_files_to_production_dir()

def import_config():
    global config
    with open("config.json", "r") as f:
        config = json.load(f)

def parse_files():
    global data
    for (path, subdirs, files) in os.walk("source"):
        subdir = "" # init to an empty subdir - ignored in a path join
        if "source/" in path:
            subdir = path.replace("source/", "")

        for f in files:
            filedata = {} # init
            filedata["sourceFile"] = os.path.join(path, f)
            filedata["fileExtension"] = f.split(".")[-1]

            if filedata["fileExtension"] not in config["processFileTypes"]:
                continue # without saving filedata

            filedata["productionDestination"] = os.path.join(
                config["productionDir"], subdir, f
            )

            with open(filedata["sourceFile"], "r") as f:
                filedata["vars"] = parse_file_vars(f)

            data["files"].append(filedata)

def parse_file_vars(f):
    """
    extract variables and their values from a file. variables are defined in the
    format $varname=value and are invoked like so: $varname
    """
    filetext = f.read()
    pattern = re.compile(
        r'\s\$(?P<name>[a-z]*)\s?=\s?"(?P<value>.*)"\s',
        re.IGNORECASE
    )
    vars = {} # init
    for m in re.finditer(pattern, filetext):
        vars[m.group(1)] = m.group(2)

    return vars

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
