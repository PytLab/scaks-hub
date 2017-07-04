#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import json
import logging
import multiprocessing
import time

from flask import render_template, request, jsonify
from kynetix.models.micro_kinetic_model import MicroKineticModel
from kynetix.utilities.format_utilities import convert_time

from . import main
from .files import get_links_paths

def run_mkm(path):
    ''' Run the microkinetic model in path.

    :param path: the absolute path where the job inputs are stored.
    '''
    # Change current directory
    os.chdir(path)
    current_path = os.getcwd()

    # Remove old log file.
    logfile = '{}/out.log'.format(current_path)
    to_be_removed = [logfile, 'run_success', 'run_failure', 'model_info.json']
    for filename in to_be_removed:
        if os.path.exists(filename):
            os.remove(filename)

    logger = logging.getLogger('model.MkmRun')

    start = time.time()
    try:
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
        trajectory = solver.solve_ode(time_span=0.0001,
                                      time_end=1,
                                      traj_output=True)
        init_guess = trajectory[-1]

        # Run the model.
        model.run(init_cvgs=init_guess)

        end = time.time()
        t = end - start
        h, m, s = convert_time(t)

        # Write success stamp.
        with open('run_success', 'w') as f:
            f.write('duration="{:d} h {:d} min {:.2f} sec"\n'.format(h, m, s))

        # Write model information for report generation
        with open('model_info.json', 'w') as f:
            json.dump(model.model_info, f)

    except Exception as e:
        msg = "{} exception is catched.".format(type(e).__name__)
        logger.exception(msg)

        with open('run_failure', 'w') as f:
            end = time.time()
            t = end - start
            h, m, s = convert_time(t)
            with open('run_success', 'w') as f:
                f.write('duration="{:d} h {:d} min {:.2f} sec"\n'.format(h, m, s))

        raise e

job_proc = None

@main.route('/running/')
def running():
    locs = {}

    locs['running'] = 'active'

    # Job path.
    path = request.args.get('path', '').strip('/')
    full_path = '{}/{}'.format(os.getcwd(), path)
    locs['path'] = path
    locs['full_path'] = full_path
    locs['links_paths'] = get_links_paths(full_path, path)

    global job_proc
    job_proc = multiprocessing.Process(target=run_mkm,
                                       args=(full_path,),
                                       daemon=True)
    job_proc.start()

    return render_template('/job/running.html', **locs)

@main.route('/running/log/', methods=['POST'])
def get_job_log():
    full_path = request.form.get('full_path')
    if full_path.endswith('/'):
        full_path = full_path[: -1]
    logfile = '{}/out.log'.format(full_path)
    with open(logfile, 'r') as f:
        log_content = f.readlines()

    log = {'content_lines': log_content}

    # Check job status stamp file.
    success = '{}/run_success'.format(full_path)
    failure = '{}/run_failure'.format(full_path)

    if os.path.exists(success):
        log['stop'] = True
        log['success'] = True
        job_info = {}
        exec(open(success, 'r').read(), {}, job_info)
        log['duration'] = job_info['duration']
    elif os.path.exists(failure):
        log['stop'] = True
        log['success'] = False
        job_info = {}
        exec(open(failure, 'r').read(), {}, job_info)
        log['duration'] = job_info['duration']
    else:
        log['stop'] = False

    return jsonify(log)

