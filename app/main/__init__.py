#!/usr/bin/env python
# -*- coding: utf-8 -*-

''' Blueprint
'''

from flask import Blueprint

main = Blueprint('main', __name__)

from .files import *
from .model import *

