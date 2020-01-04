package controllers;

import main.App;
import model.User;
import services.UserService;
import spark.Request;
import spark.Route;
import spark.Response;

public class UserController {
	
	private class UserToUpdate{
		private String oldEmail;
		private String surname;
		private String name;
		private String pass;
	}
	
    public static boolean verify(String email, String password){
        //korisnik ne moze da prosledi null.Ovo pokriva 1. slucaj ucitavanja stranice
        // if(email == null){
        //     return true;
        // }
        User user = UserService.getUser(email, password);
        return user == null ? false : true;
    }
    public static Route getUsers = (Request req, Response res) ->{
    	 res.type("aplication/json");
    	 return App.g.toJson(App.userService.getUsers());
    };

    public static Route addUser = (Request req, Response res) ->{
        User user = App.g.fromJson(req.body(), User.class);
        res.type("aplication/json");

        if(App.userService.addUser(user)){
            res.status(200);
            return "OK";
        }
        res.status(400);
        return false;
    };
    public static Route updateUser = (Request req, Response res) ->{
    	UserToUpdate user = App.g.fromJson(req.body(),UserToUpdate.class);
    	res.type("aplication/json");
    	User newUser = new User();
    	newUser.setEmail(user.oldEmail);
    	newUser.setName(user.name);
    	newUser.setSurname(user.surname);
    	newUser.setPassword(user.pass);
    	
    	if(App.userService.updateUser(newUser)) {
    		res.status(200);
    		return "OK";
    	}
    	res.status(400);
        return false;
    };
}
