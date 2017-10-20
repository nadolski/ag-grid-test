// specify the columns
var columnDefs = [
    {headerName: "Country", field: "FIELD1", rowGroup:true, hide:true},
    {headerName: "Region Name", field: "FIELD2", rowGroup:true, hide:true},
    {headerName: "Borough", field: "FIELD3"},
    {headerName: "Performance", headerGroupComponent: MyHeaderGroupComponent, children: [
        {headerName: "Number of patients setting a quit date", field: "FIELD4"},
        {headerName: "Successful", field: "FIELD5", columnGroupShow: 'open', 
            cellClass: function(params) { return params.value > 2248 ? 'rag-green' : 'rag-amber'; }
        },
        {headerName: "Unsuccessful", field: "FIELD6", columnGroupShow: 'open'},
        {headerName: "Outcome not known", field: "FIELD7", columnGroupShow: 'open'},
        {headerName: "Success rate", valueGetter: 'Math.round(data.FIELD5 / data.FIELD4 * 100) + " %"', volatile: true, cellRenderer: 'animateSlide'}
    ]},

    // {headerName: "Successful outcome, CO validated", field: "FIELD8"}

];



// let the grid know which columns and what data to use
var gridOptions = {
    columnDefs: columnDefs,
    //rowData: null,                  // ???? what does it actually do??
    enableColResize: true,
    defaultColDef: {
        width: 100,
        headerComponent : MyHeaderComponent,
        headerComponentParams : {
            menuIcon: 'fa-bars'
        }
    },
    enableSorting: true,
    enableFilter: true,
    // floatingFilter:true,
    enableRangeSelection: true, 
    pivotMode: false,
    rowSelection: 'multiple',
    animateRows: true,
    groupMultiAutoColumn:true,
    pinnedBottomRowData: [],
    defaultColDef: {
    },
    // disabled as it's clashing with MyHeader Components
    // onGridReady: function () {
    //     gridOptions.api.sizeColumnsToFit();
    // },

};

function MyHeaderComponent() {
}

MyHeaderComponent.prototype.init = function (agParams){
    this.agParams = agParams;
    this.eGui = document.createElement('div');
    this.eGui.innerHTML = ''+
        '<div class="customHeaderMenuButton"><i class="fa ' + this.agParams.menuIcon + '"></i></div>' +
        '<div class="customHeaderLabel">' + this.agParams.displayName + '</div>' +
        '<div class="customSortDownLabel inactive"><i class="fa fa-long-arrow-down"></i></div>' +
        '<div class="customSortUpLabel inactive"><i class="fa fa-long-arrow-up"></i></div>' +
        '<div class="customSortRemoveLabel inactive"><i class="fa fa-times"></i></div>';

    this.eMenuButton = this.eGui.querySelector(".customHeaderMenuButton");
    this.eSortDownButton = this.eGui.querySelector(".customSortDownLabel");
    this.eSortUpButton = this.eGui.querySelector(".customSortUpLabel");
    this.eSortRemoveButton = this.eGui.querySelector(".customSortRemoveLabel");


    if (this.agParams.enableMenu){
        this.onMenuClickListener = this.onMenuClick.bind(this);
        this.eMenuButton.addEventListener('click', this.onMenuClickListener);
    }else{
        this.eGui.removeChild(this.eMenuButton);
    }

    if (this.agParams.enableSorting){
        this.onSortAscRequestedListener = this.onSortRequested.bind(this, 'asc');
        this.eSortDownButton.addEventListener('click', this.onSortAscRequestedListener);
        this.onSortDescRequestedListener = this.onSortRequested.bind(this, 'desc');
        this.eSortUpButton.addEventListener('click', this.onSortDescRequestedListener);
        this.onRemoveSortListener = this.onSortRequested.bind(this, '');
        this.eSortRemoveButton.addEventListener('click', this.onRemoveSortListener);


        this.onSortChangedListener = this.onSortChanged.bind(this);
        this.agParams.column.addEventListener('sortChanged', this.onSortChangedListener);
        this.onSortChanged();
    } else {
        this.eGui.removeChild(this.eSortDownButton);
        this.eGui.removeChild(this.eSortUpButton);
        this.eGui.removeChild(this.eSortRemoveButton);
    }
};

MyHeaderComponent.prototype.onSortChanged = function (){
    function deactivate (toDeactivateItems){
        toDeactivateItems.forEach(function (toDeactivate){toDeactivate.className = toDeactivate.className.split(' ')[0]});
    }

    function activate (toActivate){
        toActivate.className = toActivate.className + " active";
    }

    if (this.agParams.column.isSortAscending()){
        deactivate([this.eSortUpButton, this.eSortRemoveButton]);
        activate (this.eSortDownButton)
    } else if (this.agParams.column.isSortDescending()){
        deactivate([this.eSortDownButton, this.eSortRemoveButton]);
        activate (this.eSortUpButton)
    } else {
        deactivate([this.eSortUpButton, this.eSortDownButton]);
        activate (this.eSortRemoveButton)
    }
};

MyHeaderComponent.prototype.getGui = function (){
    return this.eGui;
};

MyHeaderComponent.prototype.onMenuClick = function () {
    this.agParams.showColumnMenu (this.eMenuButton);
};

MyHeaderComponent.prototype.onSortRequested = function (order, event) {
    this.agParams.setSort (order, event.shiftKey);
};

MyHeaderComponent.prototype.destroy = function () {
    if (this.onMenuClickListener){
        this.eMenuButton.removeEventListener('click', this.onMenuClickListener)
    }
    this.eSortDownButton.removeEventListener('click', this.onSortRequestedListener);
    this.eSortUpButton.removeEventListener('click', this.onSortRequestedListener);
    this.eSortRemoveButton.removeEventListener('click', this.onSortRequestedListener);
    this.agParams.column.removeEventListener('sortChanged', this.onSortChangedListener);
};


function MyHeaderGroupComponent() {
}

MyHeaderGroupComponent.prototype.init = function (params){
    this.params = params;
    this.eGui = document.createElement('div');
    this.eGui.className = 'ag-header-group-cell-label';
    this.eGui.innerHTML = ''+
        '<div class="customHeaderLabel">' + this.params.displayName + '</div>' +
        '<div class="customExpandButton"><i class="fa fa-arrow-right"></i></div>';

    this.onExpandButtonClickedListener = this.expandOrCollapse.bind(this);
    this.eExpandButton = this.eGui.querySelector(".customExpandButton");
    this.eExpandButton.addEventListener('click', this.onExpandButtonClickedListener);

    this.onExpandChangedListener = this.syncExpandButtons.bind(this);
    this.params.columnGroup.getOriginalColumnGroup().addEventListener('expandedChanged', this.onExpandChangedListener);

    this.syncExpandButtons();
};

MyHeaderGroupComponent.prototype.getGui = function (){
    return this.eGui;
};

MyHeaderGroupComponent.prototype.expandOrCollapse = function (){
   var currentState = this.params.columnGroup.getOriginalColumnGroup().isExpanded();
   this.params.setExpanded(!currentState);
};

MyHeaderGroupComponent.prototype.syncExpandButtons = function (){
    function collapsed (toDeactivate){
        toDeactivate.className = toDeactivate.className.split(' ')[0] + ' collapsed';
    }

    function expanded (toActivate){
        toActivate.className = toActivate.className.split(' ')[0] + ' expanded';
    }

    if (this.params.columnGroup.getOriginalColumnGroup().isExpanded()){
        expanded(this.eExpandButton);
    }else{
        collapsed(this.eExpandButton);
    }
};

MyHeaderGroupComponent.prototype.destroy = function () {
    this.eExpandButton.removeEventListener('click', this.onExpandButtonClickedListener);
};


// wait for the document to be loaded, otherwise ag-Grid will not find the div in the document.
document.addEventListener("DOMContentLoaded", function () {
    var eGridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(eGridDiv, gridOptions);

    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'https://raw.githubusercontent.com/nadolski/ag-grid-test/master/stopSmokingServicesData3.json');
    httpRequest.send();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var httpResult = JSON.parse(httpRequest.responseText);
            gridOptions.api.setRowData(httpResult);
        }
    };

});
