package org.acme;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.util.List;

@Path("/user")
public class UserNameResource {
    //Create
    @POST
    @Path("/{name}")
    @Produces(MediaType.TEXT_PLAIN)
    @Transactional
    public String createUser(@PathParam("name") String name) {
        UserName userName = new UserName(name);
        userName.persist();
        return "Hello " + name + "! Your name has been stored in the database.";
    }

    // Read (version 2) - returns names and ids
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<PanacheEntityBase> getNames() {
        // Retrieve & list all UserName entities from the database
        return UserName.listAll();
    }


    // Update
    @PATCH
    @Path("/{id}")
    @Produces(MediaType.TEXT_PLAIN)
    @Transactional
    public String updateName(@PathParam("id") String id, String newName) {
        UserName userName = UserName.findById(id); // Find the UserName entity with the given id
        String oldName = userName.name; // Get the old name so we can use it in the return statement
        userName.name = newName; // Update the name of the UserName entity
        return "'" + oldName + "' has been updated to '" + newName + "' in the database.";
    }

    // Delete
    @DELETE
    @Path("/{id}")
    @Produces(MediaType.TEXT_PLAIN)
    @Transactional
    public String deleteName(@PathParam("id") String id) {
        UserName userName = UserName.findById(id); // Find the UserName entity with the given id
        userName.delete(); // Delete the UserName entity from the database
        return userName.name + " has been deleted from the database.";
    }


}
