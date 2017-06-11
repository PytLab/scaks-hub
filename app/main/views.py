#!/usr/bin/env python
# -*- coding: utf-8 -*-

# View functions for microkinetics model building.

from flask import render_template, url_for, redirect
from . import main

@main.route('/')
def index():
    return redirect(url_for('main.filetree'))

@main.route('/tree/', defaults={'path': ''})
@main.route('/tree/<path:path>', methods=['GET', 'POST'])
def filetree(path):
    if path:
        path = path.split('/')
    return render_template('filesystem.html', path=path)

