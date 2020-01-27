package controllers;

import java.util.ArrayList;

import main.App;
import services.MachineService;
import spark.Request;
import spark.Response;
import spark.Route;

public class MachineController {

	public class MachineToAdd{
		public String name;
		public String categoryName;
		public ArrayList<String> disks;
	}

	public class MachineToUpdate{
		public String oldName;
		public String newName;
		public String categoryName;
		public ArrayList<String> disks;
	}

	public static Route getAllMachines = (Request request, Response response) ->{
		response.type("application/json");
		return App.g.toJson(App.machineService.getMachines());
	};

	public static Route getMachines = (Request req, Response res) ->{
		res.type("application/json");
		return App.g.toJson(App.machineService.getMachines(req.params("email")));
	};

	public static Route getSelectedDisks = (Request req, Response res) -> {
		res.type("application/json");
		return App.g.toJson(App.machineService.getSelectedDisks(req.params("machineName")));
	};

	public static Route addMachine = (Request req, Response res) ->{
		MachineToAdd vma = App.g.fromJson(req.body(), MachineToAdd.class);
		res.type("application/json");
		if(MachineService.addMachine(vma)){
			res.status(200);
			return true;
		}
		res.status(400);
		return false;
	};

	public static Route updateMachine = (Request req, Response res) -> {
		MachineToUpdate updateMachine = App.g.fromJson(req.body(), MachineToUpdate.class);
		res.type("application/json");
		if(MachineService.updateMachine(updateMachine)){
			res.status(200);
			return true;
		}
		res.status(400);
		return false;
	};

	public static Route getAvilableMachines = (Request req, Response res) ->{
		res.type("application/json");
		return App.g.toJson(App.machineService.getAvilableMachines());

	};
}