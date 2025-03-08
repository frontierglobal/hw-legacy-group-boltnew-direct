#!/bin/bash

# Initialize Git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit"

# Set main branch
git branch -M main

# Add remote origin
git remote add origin https://github.com/frontierglobal/hw-legacy-group-boltnew-direct.git

# Push to GitHub
git push -u origin main