//const dashDiv = document.querySelector("div.w3-col")
var dashHeaders = ["","Armed","Name","Group", "Type","Arm/Disarm","Mode","Battery"]


function createDashTable(){
  dashDiv = document.getElementById('table-div')
  //while (dashDiv.firstChild) dashDiv.removeChild(dashDiv.firstChild)

  let dashboardTable = document.getElementById('table-obj')
  dashboardTable.setAttribute('id','table-obj')
  //dashboardTable.style.width = '100%'
  //dashboardTable.style.color = 'black'; // Text Color

//  dashboardTable.setAttribute('boarder','1')
  dashboardTable.className = 'w3-table-all'
  //dashboardTable.width = 100

  let dashboardTableHead = document.createElement('thead')
  dashboardTableHead.setAttribute('id','table-header')
  //dashboardTableHead.style.width='100%'

  let dashboardTableHeaderRow = document.createElement('tr')

  var selAll = document.createElement('input');
      selAll.setAttribute('type', 'checkbox');
      selAll.setAttribute('id','sel_box');
      selAll.setAttribute('label','Select All')

  let cbHeader = document.createElement('th')
  //cbHeader.append(selAll)
  //dashboardTableHeaderRow.append(cbHeader)
  //dashboardTableRow.append(selAll);
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

//  dashboardTableBody.append(dashboardTableRow);
  dashDiv.append(dashboardTable);

}

function updateTable(data){
  //console.log(data)

 let name_col = dashHeaders.indexOf('Name');
 var hdr = document.getElementById('table-header');
 var tbl = document.getElementById('table-body');
 //console.log(data.type)

 let n_rows = tbl.rows.length;
 var i=0;
 var loc = -1;
   for (i = 0;i<n_rows;i++){
     let el = tbl.rows[i].getElementsByTagName('td')[name_col].innerHTML;
    // console.log(name_col,el)

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
        d3.innerHTML=data.type;
        d3.style = 'text-align:center'
        let d4 = document.createElement('td');
        let arm = document.createElement('button')
        arm.className = 'w3-button w3-dark-gray'
        arm.setAttribute('id',data.name+'_btn')
        arm.textContent = 'Arm/Disarm'
        arm.onclick = armBtnCallBack;

        d4.append(arm)
        d4.style = 'text-align:center'
        let d5 = document.createElement('td');
        d5.innerHTML=data.mode;
        d5.style = 'text-align:center';

        let d6 = document.createElement('td');
        d6.className='w3-center'
        let ib = document.createElement('i');
        ib.className = 'fa fa-battery-full'
        d6.append(ib)

        new_row.append(dC);
        new_row.append(d0);
        new_row.append(d1);
        new_row.append(d2);
        new_row.append(d3);
        new_row.append(d4);
        new_row.append(d5);
        new_row.append(d6);

        tbl.append(new_row);

   }else{

       ic = document.getElementById(data.name+'_icon')
       tbl.rows[loc].getElementsByTagName('td')[2].innerHTML = data.name;
       tbl.rows[loc].getElementsByTagName('td')[3].innerHTML = data.group;
       tbl.rows[loc].getElementsByTagName('td')[4].innerHTML = data.type;
       let ab = document.getElementById(data.name+'_btn');
       if(data.armed){
         ic.className ='fa fa-circle w3-large'
         ic.style= 'color:green'
         ab.textContent = 'Disarm';
       }else{
         ic.className ='fa fa-circle w3-large'
         ic.style ='color:red'
         ab.textContent = 'Arm';
       }

       //tbl.rows[loc].getElementsByTagName('td')[5]
       tbl.rows[loc].getElementsByTagName('td')[6].innerHTML = data.mode;
   }

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

function setMode(cmd_mode){
//  var caller = e.target || e.srcElement;
  var tbl = document.getElementById('table-body');
//  var checkboxes = $(tbl).find(':checkbox').prop("checked").closest("tr");
  let name_col = dashHeaders.indexOf('Name');
  var trs = $(tbl).find("input:checked").closest("tr"); //get tr elements of checked inputs
  var ind = $.map(trs, function(tr) { return $(tr).index(); }); //make an array containing the indexes of these tr elements

  for (i = 0;i<ind.length;i++){
    let name = tbl.rows[ind[i]].getElementsByTagName('td')[name_col].innerHTML;

    let mode_client = new ROSLIB.Service({
      ros : ros,
      name : '/'+name+'/set_mode',
      serviceType : 'surfer_msgs/srv/SetMode'
    });

    let mode_request = new ROSLIB.ServiceRequest({
      mode : cmd_mode // Toggle the State
    });

    mode_client.callService(mode_request, function(result) {
    console.log('Result for service call on '
      + mode_client.name
      + ': '
      + result.res);
    });

  }

}
function modeDropdownClicked() {

  var x = document.getElementById("mode_dropdown");
  if (x.className.indexOf("w3-show") == -1) {
    x.className += " w3-show";
  } else {
    x.className = x.className.replace(" w3-show", "");
  }

  //document.getElementById("myDropdown").classList.toggle("show");
  //console.log("My function")
}

function armAll(){
  var tbl = document.getElementById('table-body')
  let name_col = dashHeaders.indexOf('Name');

  let n_rows = tbl.rows.length;
  // Find the Row associated with the caller's name
  for (i = 0;i<n_rows;i++){
    let name = tbl.rows[i].getElementsByTagName('td')[name_col].innerHTML;
    callArmingService(name,true)

  }
}

function disarmAll(){
  var tbl = document.getElementById('table-body')
  let name_col = dashHeaders.indexOf('Name');

  let n_rows = tbl.rows.length;
  // Find the Row associated with the caller's name
  for (i = 0;i<n_rows;i++){
    let name = tbl.rows[i].getElementsByTagName('td')[name_col].innerHTML;
    callArmingService(name,false)

  }
}

function armBtnCallBack(e){
  var caller = e.target || e.srcElement;
  caller_name = caller.id;

  var tbl = document.getElementById('table-body')
  let name_col = dashHeaders.indexOf('Name');
  let armed_col = dashHeaders.indexOf('Armed')
  var loc = -1;
  let n_rows = tbl.rows.length;
  // Find the Row associated with the caller's name
  for (i = 0;i<n_rows;i++){
    let el = tbl.rows[i].getElementsByTagName('td')[name_col].innerHTML;
    if(!el.localeCompare(caller_name)){
        loc = i;
    }
  }

  let ic = document.getElementById(caller_name+'_icon')

  if(ic.style.color == 'green'){
   var arm_state = false
  }
  if(ic.style.color =='red'){
   var arm_state = true
  }

  callArmingService(caller_name,arm_state)
//  let arm_state = tbl.rows[loc].getElementsByTagName('td')[armed_col].innerHTML == 'true';
}

function callArmingService(name,arm_state){

  let arm_client = new ROSLIB.Service({
    ros : ros,
    name : '/'+name+'/arm',
    serviceType : 'surfer_msgs/srv/Arming'
  });

  let arm_request = new ROSLIB.ServiceRequest({
    arm : arm_state // Toggle the State
  });

  arm_client.callService(arm_request, function(result) {
  console.log('Result for service call on '
    + arm_client.name
    + ': '
    + result.res);
});

}

// Get the Sidebar
var mySidebar = document.getElementById("mySidebar");

// Get the DIV with overlay effect
var overlayBg = document.getElementById("myOverlay");

// Toggle between showing and hiding the sidebar, and add overlay effect
function w3_open() {
  if (mySidebar.style.display === 'block') {
    mySidebar.style.display = 'none';
    overlayBg.style.display = "none";
  } else {
    mySidebar.style.display = 'block';
    overlayBg.style.display = "block";
  }
}

// Close the sidebar with the close button
function w3_close() {
  mySidebar.style.display = "none";
  overlayBg.style.display = "none";
}
