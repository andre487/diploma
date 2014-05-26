#!/bin/bash

g++ cpp_functions.cpp -c
gfortran cpp_functions.o linprog.for linprog_cgi.for -o /var/www/wemath.ru/cgi-bin/linprog.cgi -ffree-form -ffree-line-length-none -lstdc++ -llapack

rm cpp_functions.o
