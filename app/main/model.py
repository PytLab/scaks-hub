#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os

from flask import request, render_template

from . import main
from .files import get_links_paths

@main.route('/model/')
def model():
    locs = {}
    # Activate navigation tab.
    locs['model'] = 'active'

    # Model path.
    path = request.args.get('path', '').strip('/')
    full_path = '{}/{}'.format(os.getcwd(), path)
    locs['full_path'] = full_path
    locs['links_paths'] = get_links_paths(full_path, path)
    return render_template('model/model.html', **locs)

