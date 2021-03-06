# HowTo Ansible playbook to deploy Node-Red,InfluxDb and Grafana on Raspberry Pi

## Install Ansible on your machine
[Installation procedure](http://docs.ansible.com/ansible/intro_installation.html#installation)

## Add your Raspberry IP address into `hosts` file
```
[hosts]
<alias> ansible_ssh_host=<RaspberryPi IP> ansible_ssh_user=pi
```

## First (SSH exchange with RPI)
`ansible-playbook -c paramiko -i hosts 01-setup.yml --ask-pass --sudo`

###### **After this you should connect by enter `ssh pi@<Raspberry_IP_Address>` without password** 

## Second (upgrade RPI)
`ansible-playbook -c paramiko -i hosts 02-update.yml --ask-pass --sudo`

## Third (deploy application)
`ansible-playbook -c paramiko -i hosts 03-deploy.yml --ask-pass --sudo`
