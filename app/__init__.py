#!/usr/bin/env python
# -*- coding: utf-8 -*-

from flask import Flask, render_template
from flask_moment import Moment

from config import config

# Initialize plugins.
moment = Moment()

# App factory function.
def create_app(config_name):
    ''' Create an app from a specific configure.
    '''
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)

    # Register blueprint.
    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    moment.init_app(app)

    return app

