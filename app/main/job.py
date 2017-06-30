#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import json
import logging
import multiprocessing

from flask import render_template, request, jsonify
from kynetix.models.micro_kinetic_model import MicroKineticModel

from . import main
from .files import get_links_paths

def run_mkm(path):
    ''' Run the microkinetic model in path.

    :param path: the absolute path where the job inputs are stored.
    '''
    # Change current directory
    os.chdir(path)

    # Set logger.
    # Get setup dict.
    setup_dict = {}
    rxns_filename = '{}/rxns.py'.format(path)
    energies_filename = '{}/rel_energy.py'.format(path)
    model_filename = '{}/model.py'.format(path)
    for filename in [rxns_filename, model_filename]:
        exec(open(filename, 'r').read(), {}, setup_dict)

    # Create model.
    model = MicroKineticModel(setup_dict=setup_dict)
    parser = model.parser
    solver = model.solver

    parser.parse_data(energies_filename)
    solver.get_data()

    # Run ODE and get initial coverages guess.
    trajectory = solver.solve_ode(time_span=0.001,
                                  time_end=1,
                                  traj_output=True)
    init_guess = trajectory[-1]

    # Run the model.
    model.run(init_cvgs=init_guess)

job_proc = None

@main.route('/running/')
def running():
    locs = {}

    locs['running'] = 'active'

    # Job path.
    path = request.args.get('path', '').strip('/')
    full_path = '{}/{}'.format(os.getcwd(), path)
    locs['full_path'] = full_path
    locs['links_paths'] = get_links_paths(full_path, path)

    global job_proc
    job_proc = multiprocessing.Process(target=run_mkm,
                                       args=(full_path,),
                                       daemon=True)
    print('start new proc')
    job_proc.start()

    return render_template('/job/running.html', **locs)

@main.route('/running/log/', methods=['POST'])
def get_job_log():
    full_path = request.form.get('full_path')
    logfile = '{}/out.log'.format(full_path)
    with open(logfile, 'r') as f:
        log_content = f.readlines()

    log = {'content_lines': log_content}

    return jsonify(log)

