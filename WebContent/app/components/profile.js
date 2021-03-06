Vue.component("profile", {
    data : function(){
        return {
            user : {
                email : "",
                name : "",
                surname : "",
                password : "",
                organization : {
                    name : ""
                }
            },
            backup : {
                email : "",
                name : "",
                surname : "",
                password : "",
                organization : {
                    name : ""
                }
            },
            oldpassword : "",
            newpassword : ""

        }
    },
    template : `
    <div>
        <div class="col-md-8 col-sm-6 col-xs-12 personal-info">
            <form class="form-horizontal" id="userForm" role="form">
                <div class="form-group">
                    <label class="col-lg-3 control-label">Email:</label>
                    <div class="col-lg-8">
                    <input class="form-control" id="user_email" placeholder="Email" name="email" type="email" v-model="user.email" required><p id="name_err" style="margin-left: 4rem;">                                                       </p>
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-lg-3 control-label">Name:</label>
                    <div class="col-lg-8">
                    <input class="form-control" id="user_name" placeholder="Name" name="name" type="text" v-model="user.name" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-lg-3 control-label">Surname:</label>
                    <div class="col-lg-8">
                    <input class="form-control" id="user_surname" placeholder="Surname" name="surname" type="text" v-model="user.surname" required>
                    </div>
                </div>
                
                <div class="form-group  form-inline">
                    <label class="col-lg-2 control-label">Password:</label>
                    <div class="col-lg-8">
                    <button type="button" class="btn btn-outline-success" data-toggle="modal" data-target="#passModal"> Change password</button>
                    </div>
                </div>

                <div class="form-group  form-inline">
                    <label class="col-lg-2 control-label">Organization:</label>
                    <div class="col-lg-8">
                    <input class="form-control" id="user_organization" placeholder="No organization" name="organization" type="text" v-model="user.organization.name" disabled>
                    </div>
                </div>
          
            </form>
        
            <div class="form-group  form-inline">
                <div class="col-lg-8">
                    <button type="button" class="btn btn-secondary" v-bind:disabled="JSON.stringify(backup) === JSON.stringify(user)" v-on:click="cancel()" >Cancel</button>
                    <button type="button" class="btn btn-success" v-bind:disabled="JSON.stringify(backup) === JSON.stringify(user)" v-on:click="editProfile()" >Save changes</button>
                </div>
            </div>
        </div>

        <div class="modal fade" ref="pass-modal" id="passModal" tabindex="-1" role="dialog" aria-labelledby="passModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="passModalLabel">Change your password</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
                </button>
            </div>
            
            <div class="modal-body">
                                
            <form id="passwordForm" class="form-signin" role="form">
            <fieldset>  
                <div class="form-group">
                    <input class="form-control" id="old_password" placeholder="Enter old password" name="oldpassword" type="password" v-model="oldpassword" required><p id="pass_err"></p>
                </div>
                <div class="form-group">
                    <input class="form-control" id="new_password" placeholder="Enter new password" name="newpassword" type="password" v-model="newpassword" required>
                </div>

            </fieldset>
            </form>
             </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" v-on:click="cancelPassword()" >Cancel</button>
                <button type="button" class="btn btn-success" v-on:click="changePassword()" >Change password</button>
            </div>
            </div>
        </div>
        </div>



    </div>
    `,

    methods : {
        changePassword : function(){
            var $passwordForm = $("#passwordForm");
            if( !$passwordForm[0].checkValidity()){
                $('<input type="submit">').hide().appendTo($passwordForm).click().remove();
            }
            else{
                if(this.backup.password == this.oldpassword){
                    this.user.password = this.newpassword;
                    $("#passModal").modal('hide');
                    this.oldpassword = "";
                    this.newpassword = "";
                    document.getElementById("old_password").style.borderColor = "";
                    document.getElementById("pass_err").innerHTML = ""
                    toast("Save changes to update password");
                }
                else{
                    document.getElementById("old_password").style.borderColor = "red";
                    document.getElementById("pass_err").innerHTML = "Incorrect password.Please try again."
                }
            }
            

        },

        cancelPassword : function(){
            $("#passModal").modal('hide');
            this.oldpassword = "";
            this.newpassword = "";
            document.getElementById("old_password").style.borderColor = "";
            document.getElementById("pass_err").innerHTML = ""
        },

        editProfile : function(){
            var self = this;

          
            var $userForm = $("#userForm");

            if( !$userForm[0].checkValidity()){
                $('<input type="submit">').hide().appendTo($userForm).click().remove();
            }
            else{

                axios
                .post("/updateUser", {"oldEmail" : '' +this.backup.email, "newEmail" : '' + this.user.email,
                  "name" : '' + this.user.name, "surname" : '' + this.user.surname,
                   "pass" : '' + this.user.password, "role" : this.backup.role})
                .then(response => {

                    if(self.backup.email != self.user.email){
                        axios
                        .post("/updateLoggedUser", self.user.email);
                    }

                    document.getElementById("user_email").style.borderColor = "";
                    document.getElementById("name_err").innerHTML = "";
                    self.backup = {...this.user};
                    toast("Successfully updated your profile.");

                })
                .catch( error => {
                    document.getElementById("user_email").style.borderColor = "red";
                    document.getElementById("name_err").innerHTML = "Email taken.Try again."

                })
            }
        },

        cancel : function(){
            this.user =  {...this.backup};
            document.getElementById("user_email").style.borderColor = "";
            document.getElementById("name_err").innerHTML = ""
        }
    },

    mounted(){
        axios
        .get("/getUser/" + localStorage.getItem("email"))
        .then(response => {
          this.user = {...response.data};
          this.backup = {...response.data};
        })
    }

})