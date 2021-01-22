const Discord = require('discord.js');
const config = require('./config.json');
const client = new Discord.Client();

var current_workout = [];
var current_slot = 0;
var channel = null;
var in_workout = false;

const prefix = '>';
const users = config.users;
var delay_time = 20;
var rest_time = 20;

var name = "";
var time = 0;

client.once('ready', () => {
	console.log('Connected to Discord with JS');
});

client.on('message', message =>  {

    const mesrec = message.content;

    if (!mesrec.startsWith(prefix) || message.author.bot) return;

    const msg = mesrec.slice(prefix.length).toLowerCase();
    if (msg.indexOf("help") === 0) {
        message.channel.send("**Commands: **\n\n **>rest** *time in seconds* \n **>delay** *time in seconds* \n **>help** \n **>start** *list of workouts (for example, >start Push Ups-30/Sit Ups-20/Russian Twists-60)* \n **>end** (terminates the workout)");
    }
    if (msg.indexOf("rest ") === 0) {
        var time = parseInt(msg.slice("rest ".length));
        rest_time = time;
        message.channel.send("**Rest time changed to **" + rest_time.toString());
    }
    if (msg.indexOf("delay ") === 0) {
        var time = parseInt(msg.slice("delay ".length));
        delay_time = time;
        message.channel.send("**Delay time changed to **" + delay_time.toString());
    }
    if (msg.indexOf("start ") === 0 && in_workout === false) {
        current_workout = [];
        current_slot = 0;
        channel = message.channel;
        in_workout = true;
        const args = msg.slice("start ".length).split("/");
        for (i = 0; i < args.length; i++) {
            const command = args[i].split("-");
            name = command[0];
            time = command[1]; 
            current_workout.push(name);
            current_workout.push(time);
        }
        console.log(current_workout);
        if (current_workout.length > 1) {
            message.channel.send("**Initialized Workout**: " + current_workout.toString());
            message.channel.send("Workout starting in **" + delay_time.toString() + "** seconds");
            setTimeout(execute_workout, delay_time * 1000);
        } else {
            message.channel.send("**Error**: no workout parameters given");
        }
    }
    if (msg.indexOf("end") === 0 && users.includes(message.author.tag.toString()) === true) {
        current_workout = [];
        current_slot = 0;
        channel = message.channel;
        in_workout = false;
        message.channel.send("**Workout Terminated**");
    }
});

function execute_workout() {
    if (in_workout === true) {
        if (current_slot < current_workout.length - 1) {
            name = current_workout[current_slot];
            time = parseInt(current_workout[current_slot + 1]);
            if (time !== "NaN") {
                current_slot += 2;
                channel.send("Start " + name + " now for **" + time.toString() + "**");
                setTimeout(function() {channel.send("Rest in **10** seconds")}, (time * 1000) - 10 * 1000);
                setTimeout(execute_rest, time * 1000);
            } else {
                channel.send("**Error**: invalid time given (Workout terminated)");
            }
        } else {
            in_workout = false;
            channel.send("**Congrats**, you finished the workout!");
        }
    }   
}

function execute_rest() {
    if (in_workout === true) {
        channel.send("Rest for **" + rest_time.toString() + "**" + " before doing " + name + " for " + time);
        setTimeout(function() {channel.send("Start " + name + " in **10** seconds")}, (rest_time * 1000) - 10 * 1000);
        setTimeout(execute_workout, rest_time * 1000);
    }
}

client.login(config.token);
