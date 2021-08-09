// Connecting to ROS
// -----------------
var ros = new ROSLIB.Ros();

// If there is an error on the backend, an 'error' emit will be emitted.
ros.on('error', function(error) {
  document.getElementById('connecting').style.display = 'none';
  document.getElementById('connected').style.display = 'none';
  document.getElementById('closed').style.display = 'none';
  document.getElementById('error').style.display = 'inline';
  console.log(error);
});

// Find out exactly when we made a connection.
ros.on('connection', function() {
  console.log('Connection made!');
//  document.getElementById('connecting').style.display = 'none';
//  document.getElementById('error').style.display = 'none';
//  document.getElementById('closed').style.display = 'none';
//  document.getElementById('connected').style.display = 'inline';
});

ros.on('close', function() {
  console.log('Connection closed.');
//  document.getElementById('connecting').style.display = 'none';
//  document.getElementById('connected').style.display = 'none';
//  document.getElementById('closed').style.display = 'inline';
});

// Create a connection to the rosbridge WebSocket server.
ros.connect('ws://localhost:9090');

var name_sub = new ROSLIB.Topic({
  ros : ros,
  name : '/agent_names',
  messageType : 'std_msgs/String'
});

var names_list = []

var sub_list = []

// Subscribe a Topic
var stat_sub = new ROSLIB.Topic({
  ros : ros,
  name : '/global_status',
  messageType : 'surfer_msgs/Status'
});

// Subscribe a Topic
stat_sub.subscribe(function(msg) {
  var n = names_list.includes(msg.name) // Check if the name is in the list
  if(!n){
    names_list.push(msg.name)
  }
  //console.log(msg)
  updateTable(msg);
});
