package org.acme;

import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/submit-name")
public class SubmitNameResource {

    @POST
    @Transactional
    @Consumes(MediaType.APPLICATION_JSON)
    public Response submitName(UserName user) {

        if (user.name == null || user.name.isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Please enter a name.")
                    .build();
        }


        if (user.name.contains(" ")) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("No spaces allowed in the name.")
                    .build();
        }


        user.persist();

        return Response.ok("Hello, " + user.name + "! Your name has been stored in the database.").build();
    }
}
