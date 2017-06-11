#!/usr/bin/env python
# -*- coding: utf-8 -*-

# View functions for microkinetics model building.

import os

from flask import render_template, url_for, redirect, abort
from . import main

@main.route('/')
def index():
    return redirect(url_for('main.filetree'))

@main.route('/tree/', defaults={'path': ''})
@main.route('/tree/<path:path>', methods=['GET', 'POST'])
def filetree(path):
    base_path = os.getcwd()
    if path:
        full_path = '{}/{}'.format(base_path, path)
        if not os.path.exists(full_path):
            abort(404)
        path = [subdir for subdir in path.split('/') if subdir]
    return render_template('filetree.html', path=path)

