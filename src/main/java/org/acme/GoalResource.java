package org.acme;

import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/goals")
public class GoalResource {

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Transactional
    public Response createGoal(Goal goal) {
        // Validar que el título no esté vacío
        if (goal.title == null || goal.title.trim().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Title cannot be empty.")
                    .build();
        }

        // Validar longitud mínima, etc.
        if (goal.title.length() < 3) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Title must be at least 3 characters.")
                    .build();
        }

        // Persistir en DB (si tu Goal extiende PanacheEntity)
        goal.persist();

        return Response.ok("Goal created successfully: " + goal.title).build();
    }

    // GET, PUT, DELETE, etc. si lo deseas
}
