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


var dashHeaders = ["","Armed","Name","Group","Action"]
updateData(); // execute function
updateMissionList();


function createTable(){
  dashDiv = document.getElementById('table-div')
  //while (dashDiv.firstChild) dashDiv.removeChild(dashDiv.firstChild)

  let dashboardTable = document.getElementById('table-obj')
  dashboardTable.setAttribute('id','table-obj')
  dashboardTable.className = 'w3-table-all'

  let dashboardTableHead = document.createElement('thead')
  dashboardTableHead.setAttribute('id','table-header')

  let dashboardTableHeaderRow = document.createElement('tr')

  var selAll = document.createElement('input');
      selAll.setAttribute('type', 'checkbox');
      selAll.setAttribute('id','sel_box');
      selAll.setAttribute('label','Select All')

  let cbHeader = document.createElement('th')

  dashHeaders.forEach(header =>{
    let myHeader = document.createElement('th')
    myHeader.innerText = header
    myHeader.className='w3-center'
    dashboardTableHeaderRow.append(myHeader)
  })

  dashboardTableHead.append(dashboardTableHeaderRow)
  dashboardTable.append(dashboardTableHead)

  let dashboardTableBody = document.createElement('tbody')
  dashboardTableBody.setAttribute('id','table-body')
  dashboardTableBody.className = "dashboardTable_Body"
  dashboardTable.append(dashboardTableBody)

  let dashboardTableRow = document.createElement('tr')
  dashboardTableRow.className = 'dashboardTableRow'

  let n = dashHeaders.length;
   for (i = 0;i<n;i++){
     let cell = document.createElement('td');
     cell.innerHTML='';
     dashboardTableRow.append(cell);
   }
  dashDiv.append(dashboardTable);

}

function updateTable(data){

 let name_col = dashHeaders.indexOf('Name');
 var hdr = document.getElementById('table-header');
 var tbl = document.getElementById('table-body');

 let n_rows = tbl.rows.length;
 var i=0;
 var loc = -1;
   for (i = 0;i<n_rows;i++){
     let el = tbl.rows[i].getElementsByTagName('td')[name_col].innerHTML;

     if(!el.localeCompare(data.name)){
         loc = i;
       }

   }
    //console.log(data)
   if(loc == -1){ // New Entry
       let new_row = document.createElement('tr');
       let n = dashHeaders.length;

       let dC = document.createElement('td');
       dC.className='w3-center'

       var chkBox = document.createElement('input');
           chkBox.setAttribute('type', 'checkbox');
           chkBox.setAttribute('id','chk_box');
           chkBox.style='text-align:right'
           dC.append(chkBox)


        let d0 = document.createElement('td');
        d0.className = 'w3-center'
        icon = document.createElement('i');
        icon.className ='fa fa-circle '
        icon.style='color:red'
        icon.id = data.name+'_icon'
        d0.append(icon)
        //d0.innerHTML=data.armed;
        //d0.style = 'text-align:center'
        let d1 = document.createElement('td');
        d1.innerHTML=data.name;
        d1.style = 'text-align:center'
        let d2 = document.createElement('td');
        d2.innerHTML=data.group;
        d2.style = 'text-align:center'
        let d3 = document.createElement('td');
        d3.innerHTML=data.behavior;
        d3.style = 'text-align:center'


        new_row.append(dC);
        new_row.append(d0);
        new_row.append(d1);
        new_row.append(d2);
        new_row.append(d3);

        tbl.append(new_row);

   }else{

       ic = document.getElementById(data.name+'_icon')
       tbl.rows[loc].getElementsByTagName('td')[2].innerHTML = data.name;
       tbl.rows[loc].getElementsByTagName('td')[3].innerHTML = data.group;
       tbl.rows[loc].getElementsByTagName('td')[4].innerHTML = data.behavior;
       let ab = document.getElementById(data.name);
       if(data.armed){
         ic.className ='fa fa-circle w3-large'
         ic.style= 'color:green'
       }else{
         ic.className ='fa fa-circle w3-large'
         ic.style ='color:red'
       }
   }

}

var names_list = []
var group_list = []
var marker_list = []
var sub_list = []
var behavior_list = []
var point_list = {};
var path_list = []
var mission_list = []
var mission_mode = []
var edit_mission = false
var point_group = L.layerGroup()
var path_group = L.layerGroup()
var lines_group = L.layerGroup()

function initializeMap(){

  map.fitBounds(bounds);
  map.on('click',function(e){

    if(mission_mode == "point"){

          map.removeLayer(point_group)
          point_group = L.layerGroup()
          var point_marker = new L.marker(e.latlng, {icon:greenIcon, draggable:'true'});

        //  point_marker.setLatLng(e.latlng,{draggable:'true'});
          //updateMissionList()

          point_marker.addTo(point_group)
          point_group.addTo(map)

    }

    if(mission_mode == "path"){
        let next_marker = new L.marker(e.latlng, {icon:blackIcon, draggable:'true'});
      //  next_marker.setLatLng(e.latlng,{draggable:'true'});
        path_group.addLayer(next_marker)
        //console.log(pathLayer)
        path_group.addTo(map)
        connectDots(path_group)
      //  updateMissionList()
        //map.addLayer(next_marker)
    }
  });
  map.on('mouseup',function(e) {updateMissionList()});


}
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
    addOdomSubscriber(msg.name)
    var cur_marker = L.marker([0,0]).addTo(map)

    cur_marker.bindPopup(msg.name);

    cur_marker.on('mouseover',function(ev){
      cur_marker.openPopup();
    })
    cur_marker.on('mouseout',function(ev){
      cur_marker.closePopup();
    })

    marker_list.push(cur_marker)

  }
  var k = group_list.includes(msg.group)
  if(!k){
    group_list.push(msg.group)
  }
  updateTable(msg)
//console.log(names_list)
});


function updateData()
{
    x = 5;  // 5 Seconds
    //console.log("every 5")
    group_list = []
    if(names_list){
      for (const name of names_list) {
          callGetBehaviors(name)
      }
    }
    setTimeout(updateData, x*1000);
}

function addOdomSubscriber(name){
  var odom_sub = new ROSLIB.Topic({
    ros : ros,
    name : '/'+name+'/odom',
    messageType : 'nav_msgs/Odometry'
  });

  // Subscribe a Topic
  odom_sub.subscribe(function(msg) {

  var curr_indx = names_list.indexOf(name)
  marker_list[curr_indx].setLatLng([msg.pose.pose.position.y,msg.pose.pose.position.x])

  });
}


function groupBtnHover(){

var gdd = document.getElementById('group_dropdown')
var al = $(gdd).find('a').remove() // Clear List

  for (const val of group_list)
  {
    let el = document.createElement('a')
    el.id=val
    el.className="w3-bar-item w3-button"
    el.innerHTML = val
    el.onclick= function(val) { selectGroup(val.srcElement.innerHTML)}
    gdd.append(el)
  }

}

function behaviorBtnHover(){
  var gdd = document.getElementById('behavior_dropdown')
  var al = $(gdd).find('a').remove() // Clear List

    for (const val of behavior_list)
    {
      let el = document.createElement('a')
      el.id=val
      el.className="w3-bar-item w3-button"
      el.innerHTML = val
      el.onclick= function(val) { setBehavior(val.srcElement.innerHTML)}
      gdd.append(el)
    }
}

function selectGroup(name){
  var tbl = document.getElementById('table-body');

  var rows = $(tbl).find("td").filter(function() {
      return $(this).text() == name;
  }).closest("tr")
  $(rows).find("input:checkbox").prop('checked',true)
}

function setGroup(){
  var group_name = prompt("Enter desired group name",'WRC')

  var tbl = document.getElementById('table-body');
  let name_col = dashHeaders.indexOf('Name');
  var rows = $(tbl).find(':checkbox').filter(function(){
    return $(this).is(':checked')
  }).closest('tr')
  //let el = $(rows).find('td')
  //var ids =checkboxes.selected()
  let n_rows = rows.length

  for (i = 0;i<n_rows;i++){
    let name = tbl.rows[i].getElementsByTagName('td')[name_col].innerHTML;
    console.log(n_rows, name)

    callGroupService(name,group_name)

  }
}

function callGroupService(name,set_group){

  let group_client = new ROSLIB.Service({
    ros : ros,
    name : '/'+name+'/set_group',
    serviceType : 'surfer_msgs/srv/SetGroup'
  });

  let group_request = new ROSLIB.ServiceRequest({
    group : set_group // Toggle the State
  });

  group_client.callService(group_request, function(result) {
  console.log('Result for service call on '
    + group_client.name
    + ': '
    + result.res);
});

}

function getSelectedNames(){
  var tbl = document.getElementById('table-body');
  let name_col = dashHeaders.indexOf('Name');
  var rows = $(tbl).find(':checkbox').filter(function(){
    return $(this).is(':checked')
  }).closest('tr')

  names=[]
  for (i = 0;i<rows.length;i++){
    let name = tbl.rows[i].getElementsByTagName('td')[name_col].innerHTML;
    names.push(name)
  }
  return names

}

function setBehavior(behavior){

  var tbl = document.getElementById('table-body');
  let name_col = dashHeaders.indexOf('Name');
  var rows = $(tbl).find(':checkbox').filter(function(){
    return $(this).is(':checked')
  }).closest('tr')
  //let el = $(rows).find('td')
  //var ids =checkboxes.selected()
  let n_rows = rows.length

  for (i = 0;i<n_rows;i++){
    let name = tbl.rows[i].getElementsByTagName('td')[name_col].innerHTML;
  //  console.log(n_rows, name,behavior)
    callBehaviorService(name,behavior)
  }
}

function callBehaviorService(name,set_behavior){

  let behavior_client = new ROSLIB.Service({
    ros : ros,
    name : '/'+name+'/set_behavior',
    serviceType : 'surfer_msgs/srv/SetBehavior'
  });

  let behavior_request = new ROSLIB.ServiceRequest({
    behavior : set_behavior // Toggle the State
  });

  behavior_client.callService(behavior_request, function(result) {
  console.log('Result for service call on '
    + behavior_client.name
    + ': '
    + result.res);
});

}

function callGetBehaviors(name){

  let behavior_client = new ROSLIB.Service({
    ros : ros,
    name : '/'+name+'/get_behaviors',
    serviceType : 'surfer_msgs/srv/GetBehaviors'
  });

  let behavior_request = new ROSLIB.ServiceRequest({
    req :''
   });
  // console.log(behavior_request)
  behavior_client.callService(behavior_request, function(result) {
  //console.log('Result for service call on '
  //  + behavior_client.name
  //  + ': '
  //  + result.behaviors);
    var x = result.behaviors+'';
    behavior_list = x.split(',')
    //behaviors = result.behaviors.split(',')

});

}


function selectAll(){
  var tbl = document.getElementById('table-body');
  var checkboxes = $(tbl).find(':checkbox')
  checkboxes.prop('checked', true);
}

function clearAll(){
  var tbl = document.getElementById('table-body');
  var checkboxes = $(tbl).find(':checkbox')
  checkboxes.prop('checked', false);
}

function pointCb(){
  ic = document.getElementById("info_console")
  ic.innerHTML = "Click a point on the map"
  edit_mission = true
  mission_mode = 'point'
  map.removeLayer(point_group)

  point_group = L.layerGroup()
  /*if(mission_mode == 'point'){
    map.on('mouseup',function(e) {updateMissionList()});

    var point_marker = new L.marker([0,0], {id:'vg', icon:greenIcon, draggable:'true'});

    map.on('click',function(e){
        point_marker.setLatLng(e.latlng,{id:'vg',draggable:'true'});
        updateMissionList()
        point_marker.addTo(point_group)
        point_group.addTo(map)
    });
  }*/
}

function pathCb(){
  ic = document.getElementById("info_console")
  ic.innerHTML = "Edit the points on the path"
  edit_mission = true
  mission_mode = 'path'
  /*if(mission_mode == 'path'){
    map.on('mouseup',function(e) {
      updateMissionList();
      map.removeLayer(lines_group)
      lines_group = L.layerGroup()
      connectDots(path_group)
    });

    map.on('click',function(e){

        let next_marker = new L.marker([0,0], {icon:blackIcon, draggable:'true'});

        next_marker.setLatLng(e.latlng,{draggable:'true'});
        path_group.addLayer(next_marker)
        //console.log(pathLayer)
        path_group.addTo(map)
        connectDots(path_group)
        updateMissionList()
        //map.addLayer(next_marker)
      });
  }*/
}
function connectDots(marker_group){
    let i = 0

    var points = []
    marker_group.eachLayer(function(marker){
      points.push(marker._latlng)
      var line = L.polyline(points)
      line.addTo(lines_group)
      lines_group.addTo(map)
      //console.log(line)
    })

}
function polygonCb(){
  ic = document.getElementById("info_console")
  ic.innerHTML = "Click the Points of the Polygon"
}
function rectangleCb(){
  ic = document.getElementById("info_console")
  ic.innerHTML = "Drag the Rectangle"
}

function pushMissionCb(){

var sel_names = getSelectedNames()

if(mission_mode =="point"){

  var pose_msg = new ROSLIB.Message();
  point_group.eachLayer(function(marker){
    let pose = new ROSLIB.Message({
      position:{
        x: marker._latlng.lng.toFixed(2),
        y: marker._latlng.lat.toFixed(2),
        z: 0
      },
      orientation : {
        x : 0.0,
        y : 0.0,
        z : 0.0,
        w : 1.0
      }
    })
    pose_msg = pose;
    console.log(pose_msg)
  });

  for (const name of sel_names){
    publishPose(name,pose_msg);
  }
}

if(mission_mode=="path"){
  path_group.eachLayer(function(layer){
    let pt = document.createElement('p')
    pt.style ="font-size:160% line-height:0.7"
    pt.className = "w3-center"
    pt.innerHTML = "(x: "+layer._latlng.lng.toFixed(2) + ", y: " +layer._latlng.lat.toFixed(2)+")"
    sd.appendChild(pt)
});
}


}
function publishPose(name,pose_msg){

  var pose_topic = new ROSLIB.Topic({
          ros : ros,
          name : '/'+name+'/waypoint',
          messageType : 'geometry_msgs/Pose'
            });
      pose_topic.publish(pose_msg);

}
function publishPoseArray(name,pose_array_msg){

}
function clearMissionCb(){

  map.removeLayer(lines_group)
  lines_group = L.layerGroup()
  if(mission_mode == "point"){
    console.log(mission_mode)
    map.removeLayer(point_group)
    point_group = L.layerGroup()
    point_list = {};
  }
  if(mission_mode == "path"){
    console.log(mission_mode)
    map.removeLayer(path_group)
    path_group = L.layerGroup()
  }

}

function updateMissionList(){

  if(mission_mode == "point"){
      sd = document.getElementById("status-div")
      while (sd.firstChild) {
        sd.removeChild(sd.lastChild);
      }
      title = document.createElement("h4")
      title.className = 'w3-center'
      title.innerHTML ='Mission Type : ' + mission_mode
      sd.append(title)
      point_group.eachLayer(function(layer){
        let pt = document.createElement('p')
        pt.style ="font-size:160% line-heigh:0.7"
        pt.className = "w3-center"
        pt.innerHTML = "(x: "+layer._latlng.lng.toFixed(2) + ", y: " +layer._latlng.lat.toFixed(2)+")"
        sd.appendChild(pt)
    });
  }

  if(mission_mode == "path"){
    sd = document.getElementById("status-div")
    while (sd.firstChild) {
      sd.removeChild(sd.lastChild);
    }
    title = document.createElement("h4")
    title.className = 'w3-center'
    title.innerHTML ='Mission Type : ' + mission_mode
    sd.append(title)
    path_group.eachLayer(function(layer){
      let pt = document.createElement('p')
      pt.style ="font-size:160% line-height:0.7"
      pt.className = "w3-center"
      pt.innerHTML = "(x: "+layer._latlng.lng.toFixed(2) + ", y: " +layer._latlng.lat.toFixed(2)+")"
      sd.appendChild(pt)
  });


  }
  //setTimeout(updateMissionList, 100);
}
