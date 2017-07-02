#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import json

from flask import render_template, request, jsonify

from . import main
from .files import get_links_paths

@main.route('/report/')
def report():
    locs = {}
    locs['report'] = 'active'

    # Job path.
    path = request.args.get('path', '').strip('/')
    full_path = '{}/{}'.format(os.getcwd(), path)
    locs['full_path'] = full_path
    locs['links_paths'] = get_links_paths(full_path, path)

    model_info_file = '{}/model_info.json'.format(full_path)
    traj_file = '{}/auto_ode_coverages.py'.format(full_path)
    if not (os.path.exists(model_info_file) and os.path.exists(traj_file)):
        return render_template('/report/no_report.html', **locs)

    return render_template('/report/report.html', **locs)

@main.route('/report/odetraj/', methods=['POST'])
def ode_traj():
    full_path = request.form.get('full_path')
    if full_path.endswith('/'):
        full_path = full_path[: -1]
    model_info_file = '{}/model_info.json'.format(full_path)
    traj_file = '{}/auto_ode_coverages.py'.format(full_path)

    with open(model_info_file, 'r') as f:
        model_info = json.load(f)

    ode_info = {}
    ode_data = {}

    if not os.path.exists(traj_file):
        ode_data['adsorbate_names'] = []
        ode_data['coverages'] = []
        ode_data['times'] = []
    else:
        exec(open(traj_file, 'r').read(), {}, ode_info)
        adsorbate_names = model_info['adsorbate_names']
        times = ode_info['times']
        coverages = list(zip(*ode_info['coverages']))

        # Get empty site coverage.
        empty_coverages = [1.0 - sum(cvg) for cvg in ode_info['coverages']]
        coverages.append(empty_coverages)
        # Add to ode_info.
        ode_data['adsorbate_names'] = adsorbate_names + ['*_s']
        ode_data['coverages'] = coverages
        ode_data['times'] = times

    return jsonify(ode_data)

