#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
from datetime import datetime
from functools import wraps

from .errors import PathError

# Utility functions.

def convert_bytes(size):
    ''' Convert size in bytes to KB, MB... GB... etc.
    '''
    for unit in ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB']:
        if size < 1024.0:
            return '{:3.1f} {}'.format(size, unit)
        size /= 1024.0


def check_file_exists(func):
    ''' Decorator for file existance checking.
    '''
    @wraps(func)
    def wrapper(file_path):
        if not os.path.exists(file_path):
            raise PathError('No such file: {}'.format(file_path))
        return func(file_path)
    return wrapper


@check_file_exists
def file_size(file_path):
    ''' Get the file size in proper size unit.
    '''
    if os.path.isfile(file_path):
        size_in_bytes = os.path.getsize(file_path)
        return convert_bytes(size_in_bytes)


@check_file_exists
def file_ctime(file_path):
    ''' Get the creation time of a file.
    '''
    ctime = os.path.getctime(file_path)
    return datetime.fromtimestamp(ctime)


@check_file_exists
def file_mtime(file_path):
    ''' Get the modification time of a file.
    '''
    ctime = os.path.getmtime(file_path)
    return datetime.fromtimestamp(ctime)

