package controllers;

import java.util.ArrayList;
import java.util.Set;

import main.App;
import model.VirtualMachine;
import services.MachineService;
import spark.Request;
import spark.Response;
import spark.Route;

public class MachineController {

	public class MachineToAdd{
		public String name;
		public String categoryName;
		public ArrayList<String> disks;
		public String orgName;
	}

	public class MachineToUpdate{
		public String oldName;
		public String newName;
		public String categoryName;
		public ArrayList<String> disks;
		public ArrayList<String> deletedItems;
	}
	public class Act{
		public String name;
		public boolean activity;
	}
	public class Filter{
		public Set<String> core;
		public Set<String> ram;
		public Set<String> gpu;
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
		String email = req.session(false).attribute("email");
		if(MachineService.addMachine(email, vma)){
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
	
	public static Route changeActivity = (Request req, Response res) ->{
		Act vm = App.g.fromJson(req.body(), Act.class);
		res.type("application/json");
		VirtualMachine virtual_machine = App.machineService.changeActivity(vm);
		res.status(200);
		return App.g.toJson(virtual_machine.getListOfActivities());
	};

	public static Route deleteMachine = (Request req, Response res) -> {
		res.type("application/json");
		if(App.machineService.deleteMachine(req.body())){
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
	
	public static Route filter = (Request req, Response res)->{
		res.type("application/json");
		FilterVM filterVM = App.g.fromJson(req.body(), FilterVM.class);
		String email = req.session(false).attribute("email");
		Set<VirtualMachine> filtered = MachineService.filter(filterVM,email);
		
		if(filtered.size() != 0) {
			res.status(200);
			return App.g.toJson(filtered);
		}
		res.status(400);
		return App.g.toJson(filtered);
	};
	
	public class FilterVM {
		public String searchArg;
		public int coreFrom;
		public int coreTo;
		public int ramFrom;
		public int ramTo;
		public int gpuFrom;
		public int gpuTo;	
	}
}	