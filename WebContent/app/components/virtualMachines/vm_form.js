Vue.component("vm-form", {
    data : function(){
        return {
            modal : "add",
            backup : {
                name : "",
                category : {
                    name : "",    
                    cores : null,
                    ram : null,
                    gpus : null,
                }
            },
            dict : {
                add : {
                    name : "",
                    category : {
                        name : "",    
                        cores : null,
                        ram : null,
                        gpus : null,
                    }
                },
                edit : {
                    name : "",
                    category : {    
                        name : "", 
                        cores : null,
                        ram : null,
                        gpus : null,
                    }
                },

            },
            categories : null,
            drives : null,
            selectedDrives : null,
            orgDrives : null
        }
    },

    template : `
    
    <div class="modal fade" ref="vm-modal" id="vmModal" tabindex="-1" role="dialog" aria-labelledby="vmModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
        <div class="modal-header">
            <h5 class="modal-title" id="vmModalLabel" v-if="modal=='add'">Add a new Virtual Machine</h5>
            <h5 class="modal-title" id="vmModalLabel" v-if="modal=='edit'">Edit a Virtual Machine</h5>
            <button type="button" class="close" v-on:click="clearFields()" v-if="modal=='add'" aria-label="Close">
            <span aria-hidden="true">&times;</span>
            </button>

            <button type="button" class="close" v-on:click="cancelUpdate()" v-if="modal=='edit'" aria-label="Close">
            <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div class="modal-body">
                            
            <form id="vmForm" class="form-signin" role="form">
            <fieldset>  
                <div class="form-group">
                    <label>Name:</label>
                    <input class="form-control" id="vm_name" name="name" type="name" v-model="dict[modal].name   " required><p id="name_err"></p>
                </div>
                <div >
                    <label>Disks:</label>
                    <div>
                    <select class="mdb-select md-form form-control" id="diskSelect" multiple  style="width:450px" v-if="modal=='add'">
                        <option v-for="d in drives">{{d.name}}</option>
                    </select>

                    <select class="mdb-select md-form form-control" id="diskEditSelect" multiple  style="width:450px" v-else>
                        <option :id="sd.name" v-for="sd in selectedDrives" selected>{{sd.name}}</option>
                        <option :id="od.name" v-for="od in orgDrives">{{od.name}}</option>
                    </select>
                    </div>
                </div>

                <div >
                    <label>Category:</label>
                    <div>
                    <select class="mdb-select md-form form-control" id="categorySelect" style="width:450px" v-on:change="setCategoryParams()">
                        <option v-for="c in categories" :value="c.name">{{c.name}}</option>
                    </select>
                    </div>
                </div>

                <form class="form-inline">
                    <div class="form-group" style="margin-top : 10px">
                        <label style="margin-right: 10px;">Cores:</label>
                        <input class="form-control"  id="vm_cores" name="name" v-model="dict[modal].category.cores" style="width:70px; height : 35px; margin-right: 25px;" disabled>
                        <label style="margin-right: 10px;">RAM:</label>
                        <input class="form-control" id="vm_ram" name="name" v-model="dict[modal].category.ram" style="width:70px; height : 35px; margin-right: 25px;" disabled>
                        <label style="margin-right: 10px;">GPUS:</label>
                        <input class="form-control" id="vm_gpus" name="name" v-model="dict[modal].category.gpus" style="width:70px; height : 35px; margin-right: 25px;" disabled>
                    </div>
                </form>              
                
                
            </fieldset>
            </form>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-primary" v-on:click="addVm()" v-if="modal == 'add'">Add Virtual Machine</button>
            <button type="button" class="btn btn-secondary" v-if=" modal == 'add'" v-on:click="clearFields()" > Cancel </button>
            <button type="button" class="btn btn-primary" v-on:click="updateVm()" v-if="modal == 'edit'">Save changes</button>
            <button type="button" class="btn btn-secondary" v-on:click="cancelUpdate()" v-if="modal =='edit'">Cancel</button>
        </div>
        </div>
    </div>
    </div>`
    ,
    methods : {

        setEditedMachine : function(selectedMachine){
            this.backup = {...selectedMachine};
            this.dict.edit = selectedMachine;
            var e = document.getElementById("categorySelect");
            e.value = selectedMachine.category.name;
            this.setCategoryParams();
            if('organization' in selectedMachine){
                this.getDrivesWithoutVM(selectedMachine.organization.name);
            }
            this.getSelectedDrives(selectedMachine.name);
            
        },

        getSelectedDrives : function(machineName){
            axios
            .get("/getSelectedDisks/" + machineName)
            .then(response => {
                this.selectedDrives = response.data;
            })
        },

        getDrivesWithoutVM : function(orgName){
            axios
            .get("/getDrivesWithoutVM/" + orgName)
            .then(response =>{
                this.orgDrives = response.data;
            })
        },

        setCategoryParams : function(){
            var e = document.getElementById("categorySelect");
            var newCatName = e.options[e.selectedIndex].text;
            this.categories.forEach(element => {
                if(element.name == newCatName){
                    this.dict[this.modal].category = element;
                }
            });
        },

        resetNameField : function(){
            document.getElementById('vm_name').style.borderColor = "";
            document.getElementById('name_err').innerHTML = ""; 
        },

        clearFields : function(){
            this.dict.add.name = "";
            var e = document.getElementById("diskSelect");
            e.selectedIndex = -1;
            $("#vmModal").modal('hide');
            this.resetNameField();
        
        },

        cancelUpdate : function(){
            this.dict.edit.name = this.backup.name;
            this.dict.edit.category = this.backup.category;
            this.selectedDrives.forEach(element => {
                document.getElementById(element.name).selected = true;
            })

            $("#vmModal").modal('hide');
            this.resetNameField();
            this.$parent.selectedMachine = null;
        },

        highlightNameField : function(){
            document.getElementById('vm_name').style.borderColor = "red";
            document.getElementById('name_err').innerHTML = "Virtual machine with that name already exsists.Please enter another."; 
        },
        addVm : function(){
            var self = this;
            var $vmForm = $("#vmForm");
            if(!$vmForm[0].checkValidity()){
                $('<input type="submit">').hide().appendTo($vmForm).click().remove();
            }
            else{
                var e = $("#diskSelect");
                var disks = e.val();
                axios
                .post("/addVM", {"name" : ''+ self.dict.add.name, "categoryName" : '' + self.dict.add.category.name, "disks" :  disks})
                .then(response => {
                    $("#vmModal").modal('hide');
                    self.$parent.getMachines();
                    self.clearFields();
                })
                .catch(error => {
                    self.highlightNameField();
                })
            }
        },

        updateVm : function(){
            var self = this;
            var $vmForm = $("#vmForm");
            if(!$vmForm[0].checkValidity()){
                $('<input type="submit">').hide().appendTo($vmForm).click().remove();
            }
            else{
                var e = $("#diskEditSelect");
                var selectedDisks = e.val();
                if(selectedDisks == null){
                    selectedDisks = [];
                }

                axios
                .post("/updateMachine", {"oldName" : '' + self.backup.name, "newName" : '' + self.dict.edit.name, "categoryName" : '' + self.dict.edit.category.name, "disks" : selectedDisks})
                .then(response => {
                    $("#vmModal").modal('hide');
                    self.resetNameField();
                    toast("Successfully updated virtual machine");
                })
                .catch(error => {
                    self.highlightNameField();
                })
            }
        },  

        getCategories : function(){
            axios
            .get("/getCategories")
            .then(response => {
                this.categories = response.data;
            });
        },

        getDrives : function(){
            axios
            .get("/getDrives/" + localStorage.getItem("email"))
            .then(response =>{
                this.drives = response.data;
            })
        },

        setUpForAdding : function(){            
            this.setCategoryParams();
        }
    },

    mounted(){
        this.getCategories();
        this.getDrives();
    }
})