#!/usr/bin/env python
# -*- coding: utf-8 -*-

# View functions for microkinetics model building.

import os
from collections import namedtuple
from datetime import datetime

from flask import request
from flask import render_template, url_for
from flask import make_response, send_file, redirect, abort

from . import main
from .errors import PathError

@main.route('/')
def index():
    return redirect(url_for('main.filetree'))

@main.route('/tree/', defaults={'path': ''})
@main.route('/tree/<path:path>', methods=['GET', 'POST'])
def filetree(path):
    locs = {}

    base_path = os.getcwd()
    full_path = '{}/{}'.format(base_path, path)

    # Path information.
    if path:
        if not os.path.exists(full_path):
            raise PathError('No such file or directory: {}'.format(full_path))
        path = [subdir for subdir in path.split('/') if subdir]

        # Directory backward.
        prev_path = '/'.join(path[: -1])

        # Links for each subdir in path information.
        path_links = []
        base_link = url_for('main.filetree')[:-1]
        accumulate_link = base_link
        for subdir in path:
            accumulate_link += ('/' + subdir)
            path_links.append(accumulate_link)
        links_paths = zip(path_links, path)
    else:
        links_paths = []

    locs['links_paths'] = links_paths

    if os.path.isdir(full_path):
        # File list.
        dirs_files  = os.listdir(full_path)
        dirs = [i for i in dirs_files if os.path.isdir('{}/{}'.format(full_path, i))]
        files = [i for i in dirs_files if os.path.isfile('{}/{}'.format(full_path, i))]

        url = request.url.strip('/')

        # Store information for each item in file table.
        FileItem = namedtuple('FileItem', ['name', 'link', 'mtime'])

        dir_items = []
        for dir in sorted(dirs):
            link = '{}/{}'.format(url, dir)
            timestamp = os.path.getmtime('{}/{}'.format(full_path, dir))
            mtime = datetime.fromtimestamp(timestamp)
            dir_item = FileItem._make([dir, link, mtime])
            dir_items.append(dir_item)

        file_items = []
        for file in sorted(files):
            link = '{}/{}'.format(url, file)
            timestamp = os.path.getmtime('{}/{}'.format(full_path, file))
            mtime = datetime.fromtimestamp(timestamp)
            file_item = FileItem._make([file, link, mtime])
            file_items.append(file_item)

        locs['file_items'], locs['dir_items'] = file_items, dir_items

        # File types.
        locs['code_suffixes'] = ['py', 'c', 'cpp', 'html', 'css', 'js', 'h']
        locs['text_suffixes'] = ['txt', 'conf']
        locs['zip_suffixes'] = ['zip', 'rar', 'tar', 'tgz', '7z', 'gz']

        # Previous link.
        if path:
            locs['prev_link'] = '/'.join(url.split('/')[: -1])
        else:
            locs['prev_link'] = None

        return render_template('file_tree.html', **locs)
    else:
        response = make_response(send_file(full_path))
        filename = full_path.split('/')[-1]
        response.headers["Content-Disposition"] = "attachment; filename={};".format(filename)
        return response

