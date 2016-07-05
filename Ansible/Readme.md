# HowTo Ansible playbook to deploy Node-Red,InfluxDb and Grafana on Raspberry Pi

## First (SSH exchange with RPI)
`ansible-playbook -c paramiko -i hosts setup.yml --ask-pass --sudo`

## Second (upgrade RPI)
`ansible-playbook -c paramiko -i hosts 02-update.yml --ask-pass --sudo`

## Third (deploy application)
`ansible-playbook -c paramiko -i hosts 03-deploy.yml --ask-pass --sudo`
