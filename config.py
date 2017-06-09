#!/usr/bin/env python
# -*- coding: utf-8 -*-

''' Configure for different apps.
'''

import os
basedir = os.path.abspath(os.path.dirname(__file__))

class Config(object):
    ''' Base configure class.
    '''
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'default secret key'
    SQLALCHEMY_COMMINT_ON_TEARDOWN = True

    @staticmethod
    def init_app(app):
        pass


class DevConfig(Config):
    ''' Configure class for development.
    '''
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'data-dev.sqlite')


class TestConfig(Config):
    ''' Configure class for test.
    '''
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('TEST_DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'data-test.sqlite')


# All configure 
config = {
    'development': DevConfig,
    'testing': TestConfig,
    'default': DevConfig,
}

