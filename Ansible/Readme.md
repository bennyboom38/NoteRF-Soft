# HowTo Ansible playbook to deploy Node-Red,InfluxDb and Grafana on Raspberry Pi

## Install Ansible on your machine
[Installation procedure](http://docs.ansible.com/ansible/intro_installation.html#installation)

## Add your Raspberry IP address into hosts file
```
[hosts]
<replace by your Raspberry IP>
```

## First (SSH exchange with RPI)
`ansible-playbook -c paramiko -i hosts setup.yml --ask-pass --sudo`

## Second (upgrade RPI)
`ansible-playbook -c paramiko -i hosts 02-update.yml --ask-pass --sudo`

## Third (deploy application)
`ansible-playbook -c paramiko -i hosts 03-deploy.yml --ask-pass --sudo`
