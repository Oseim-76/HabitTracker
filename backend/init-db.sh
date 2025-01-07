#!/bin/bash

# Create uploads directory
mkdir -p uploads

# Run the schema
psql -U habitflow_user -d habitflow -f schema.sql 