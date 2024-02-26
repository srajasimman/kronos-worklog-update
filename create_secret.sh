#!/bin/bash

# write a bash script to read user input for the credentials KRONOS_EMAIL and KRONOS_password
# and create a kube secret for the cronjob

# read KRONOS_DOMAIN
read -p "Enter KRONOS_DOMAIN: " KRONOS_DOMAIN

# read KRONOS_EMAIL
read -p "Enter KRONOS_EMAIL: " KRONOS_EMAIL

# read KRONOS_PASSWORD
read -s -p "Enter KRONOS_PASSWORD: " KRONOS_PASSWORD

kubectl create secret generic kronos-secret \
    --from-literal=KRONOS_DOMAIN="$KRONOS_DOMAIN" \
    --from-literal=KRONOS_EMAIL="$KRONOS_EMAIL" \
    --from-literal=KRONOS_PASSWORD="$KRONOS_PASSWORD" \
    --namespace default -o yaml \
    --dry-run=client | kubectl apply -f -

kubectl apply -f kube_cronjob.yaml