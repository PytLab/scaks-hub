#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import json

from flask import render_template, request, jsonify

from . import main
from .files import get_links_paths

@main.route('/running/')
def running():
    locs = {}

    locs['running'] = 'active'

    # Job path.
    path = request.args.get('path', '').strip('/')
    full_path = '{}/{}'.format(os.getcwd(), path)
    locs['full_path'] = full_path
    locs['links_paths'] = get_links_paths(full_path, path)

    return render_template('/job/running.html', **locs)

@main.route('/running/log/', methods=['POST'])
def get_job_log():
    full_path = request.form.get('full_path')
    logfile = '{}/out.log'.format(full_path)
    with open(logfile, 'r') as f:
        log_content = f.readlines()

    log = {'content_lines': log_content}

    return jsonify(log)

