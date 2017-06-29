#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import json

from flask import request, render_template, jsonify
from kynetix.parsers.rxn_parser import RxnEquation

from . import main
from . import FILE_HEADER
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

    # Open existing rxns and energies.
    rxns_filename = '{}/rxns.py'.format(full_path)
    energies_filename = '{}/rel_energy.py'.format(full_path)

    if (os.path.exists(rxns_filename) and
            os.path.exists(energies_filename)):
        data = {}
        exec(open(rxns_filename, 'r').read(), {}, data)
        exec(open(energies_filename, 'r').read(), {}, data)
        locs['rxn_infos'] = []
        for i, expr in enumerate(data['rxn_expressions']):
            r = RxnEquation(expr)
            states = r.tolist()
            if len(states) == 3:
                IS, TS, FS = [s.chem_state() for s in states]
                rxn_type = 'with-barrier'
                locs['rxn_infos'].append({'rxn_expression': expr,
                                         'Ga': data['Ga'][i],
                                         'dG': data['dG'][i],
                                         'IS': IS,
                                         'TS': TS,
                                         'FS': FS,
                                         'rxn_type': rxn_type})
            elif len(states) == 2:
                IS, FS = [s.chem_state() for s in states]
                rxn_type = 'no-barrier'
                locs['rxn_infos'].append({'rxn_expression': expr,
                                         'Ga': data['Ga'][i],
                                         'dG': data['dG'][i],
                                         'IS': IS,
                                         'FS': FS,
                                         'rxn_type': rxn_type})
            else:
                raise ValueError('Invalid reaction expression: {}'.format(expr))
    else:
        locs['rxn_infos'] = []

    # Open existing model.
    model_filename = '{}/model.py'.format(full_path)
    if os.path.exists(model_filename):
        data = {}
        exec(open(model_filename, 'r').read(), {}, data)
        model_info = {}

        model_info.setdefault('temperature', data.get('temperature'))
        model_info.setdefault('rate_algo', data.get('rate_algo'))
        model_info.setdefault('rootfinding', data.get('rootfinding'))
        model_info.setdefault('tolerance', data.get('tolerance'))
        model_info.setdefault('max_iteration', data.get('max_rootfinding_iterations'))

        if data.get('rate_algo') == 'CT':
            model_info.setdefault('unitcell_area', data.get('unitcell_area', ''))
            model_info.setdefault('active_ratio', data.get('active_ratio', ''))

        # Species information
        species_definitions = data.get('species_definitions')
        site_total_cvgs = []
        gas_pressures = []
        for sp, definition in species_definitions.items():
            if definition.get('type') == 'site':
                site_total_cvgs.append([sp, definition['total']])
            else:
                gas_pressures.append([sp, definition['pressure']])
        model_info['gas_pressures'] = gas_pressures
        model_info['site_total_cvgs'] = site_total_cvgs

        locs['model_info'] = model_info
    else:
        locs['model_info'] = {}

    return render_template('model/model.html', **locs)

@main.route('/model/save_rxns/', methods=['POST'])
def save_rxns():
    # All rxn-related data posted are python string.
    rxn_expressions = request.form.get('rxn_expressions')
    if ',' in rxn_expressions:
        rxn_expressions = rxn_expressions.split(',')
    else:
        rxn_expressions = [rxn_expressions]

    Gas = request.form.get('Gas')
    if ',' in Gas:
        Gas = [float(e) for e in Gas.split(',')]
    else:
        Gas = [float(Gas)]

    dGs = request.form.get('dGs')
    if ',' in dGs:
        dGs = [float(e) for e in dGs.split(',')]
    else:
        dGs = [float(dGs)]

    # Path where the files are saved.
    full_path = request.form.get('full_path')

    # Write to files.
    # Elementary reactions.
    rxn_content = FILE_HEADER + 'rxn_expressions = [\n'
    for expr in rxn_expressions:
        rxn_content += "    '{}',\n".format(expr)
    rxn_content += ']\n\n'
    rxn_filename = '{}/rxns.py'.format(full_path)
    with open(rxn_filename, 'w') as f:
        f.write(rxn_content)

    # Energies.
    energies_content = FILE_HEADER + 'Ga, dG = [], []\n'
    for rxn, Ga, dG in zip(rxn_expressions, Gas, dGs):
        energies_content += ('\n# {}\n' +
                             'Ga.append({})\n' +
                             'dG.append({})\n').format(rxn, Ga, dG)
    energies_filename = '{}/rel_energy.py'.format(full_path)
    with open(energies_filename, 'w') as f:
        f.write(energies_content)

    return 'Saved', 200

@main.route('/model/save_model/', methods=['POST'])
def save_model():
    model_data = json.loads(request.get_data().decode('utf-8'))

    pressures = {}
    for p in model_data.get('pressures'):
        pressures.setdefault(p['name'], float(p['pressure']))

    total_cvgs = {}
    for c in model_data.get('total_cvgs'):
        total_cvgs.setdefault(c['name'], float(c['coverage']))

    temperature = float(model_data.get('temperature'))
    tolerance = float(model_data.get('tolerance'))
    max_rootfinding_iterations = int(model_data.get('max_iteration'))
    rate_algo = model_data.get('rate_algo')
    rootfinding = model_data.get('root_finding')
    full_path = model_data.get('full_path')

    # Write to file.
    model_content = (FILE_HEADER + '# Gas pressure.\nspecies_definitions = {}\n')
    for gas, pressure in pressures.items():
        template = "species_definitions['{}'] = {{'pressure': {}}}\n"
        model_content += template.format(gas, pressure)

    model_content += '\n# Site info.\n'
    for site, cvg in total_cvgs.items():
        template = "species_definitions['{}'] = {{'type': 'site', 'total': {}}}\n"
        model_content += template.format(site, cvg)

    model_content += '\n#Temperature.\ntemperature = {}  # K\n'.format(temperature)
    model_content += ("\nparser = 'RelativeEnergyParser'\n" +
                      "solver = 'SteadyStateSolver'\n" +
                      "corrector = 'ThermodynamicCorrector'\n" +
                      "plotter = 'EnergyProfilePlotter'\n")

    if rate_algo == 'CT':
        unitcell_area = float(model_data.get('unitcell_area'))
        model_content += '\nunitcell_area = {}\n'.format(unitcell_area)
        active_ratio = float(model_data.get('active_ratio'))
        model_content += 'active_ratio = {}\n'.format(active_ratio)

    model_content += "\nrate_algo = '{}'\n".format(rate_algo)
    model_content += "rootfinding = '{}'\n".format(rootfinding)
    model_content += "tolerance = {:e}\n".format(tolerance)
    model_content += "max_rootfinding_iterations = {}\n".format(max_rootfinding_iterations)

    filename = "{}/model.py".format(full_path)
    with open(filename, 'w') as f:
        f.write(model_content)

    return 'Saved', 200

