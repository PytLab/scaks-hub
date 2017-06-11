#!/usr/bin/env python
# -*- coding: utf-8 -*-

# View functions for microkinetics model building.

import os

from flask import render_template, url_for, redirect, abort

from . import main
from .errors import PathError

@main.route('/')
def index():
    return redirect(url_for('main.filetree'))

@main.route('/tree/', defaults={'path': ''})
@main.route('/tree/<path:path>', methods=['GET', 'POST'])
def filetree(path):
    base_path = os.getcwd()
    full_path = '{}/{}'.format(base_path, path)

    # Path information.
    if path:
        if not os.path.exists(full_path):
            raise PathError('No such file or directory: {}'.format(full_path))
        path = [subdir for subdir in path.split('/') if subdir]

        # Directory backward.
        prev_path = '/'.join(path[: -1])

    # File list.
    dirs_files  = os.listdir(full_path)
    dirs = [i for i in dirs_files if os.path.isdir('{}/{}'.format(full_path, i))]
    files = [i for i in dirs_files if os.path.isfile('{}/{}'.format(full_path, i))]

    return render_template('filetree.html',
                           path=path,
                           dirs=sorted(dirs),
                           files=sorted(files))

