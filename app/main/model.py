#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os

from flask import request, render_template

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
    return render_template('model/model.html', **locs)

@main.route('/model/save/', methods=['POST'])
def save_model():
    if request.method == 'POST':
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

