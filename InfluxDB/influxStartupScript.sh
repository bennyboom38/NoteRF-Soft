#! /bin/sh
# Starts and stops influxd
# /etc/init.d/influxd
### BEGIN INIT INFO
# Provides:     influxd
# Required-Start:       $syslog
# Required-Stop:        $syslog
# Default-Start:        2 3 4 5
# Default-Stop:         0 1 6
# Short-Description:    InfluxDB initialisation
### END INIT INFO
# Can be downloaded and installed in one go by using this command
# sudo cp /home/pi/NoteRF-Soft/InfluxDB/influxStartupScript.sh /etc/init.d/influxdb && sudo chmod 755 /etc/init.d/influxdb && sudo update-rc.d influxdb defaults

# This runs as the user called pi - please change as you require
USER=pi

# The log is written to here - please make sure your user has write permissions.
LOG=/var/log/influxd.log

#Load up influx when called
case "$1" in

start)
    if pgrep ^influxd$ > /dev/null
    then
        echo "InfluxDB already running."
    else
        echo "Starting InfluxDB.."
        touch $LOG
        chown $USER:$USER $LOG
        echo "" >> $LOG
        echo "Influxd service start: "$(date) >> $LOG
        su -l $USER -c "influxd --config /home/pi/NoteRF-Soft/InfluxDB/influxConfig.toml >> $LOG &"
        echo "Logging to "$LOG
    fi
;;

stop)
    echo "Stopping InfluxDB..."
    pkill -SIGINT ^influxd$
    sleep 2
    echo "" >> $LOG
    echo "InfluxDB service stop: "$(date) >> $LOG
;;

restart)
        echo "Restarting InfluxDB..."
        $0 stop
        sleep 2
        $0 start
        echo "Restarted."
;;
*)
        echo "Usage: $0 {start|stop|restart}"
        exit 1
esac
