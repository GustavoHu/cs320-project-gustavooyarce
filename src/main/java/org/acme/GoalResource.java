package org.acme;

import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/goals")
@Produces(MediaType.APPLICATION_JSON)  // <-- Produce JSON
@Consumes(MediaType.APPLICATION_JSON) // <-- Consume JSON
public class GoalResource {

    @POST
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

        // Guardar en DB
        goal.persist();

        // Devuelve la meta recién creada como JSON
        return Response.ok(goal).build();
    }

    // NUEVO: Devuelve todas las metas
    @GET
    public List<Goal> getAllGoals() {
        return Goal.listAll();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response deleteGoal(@PathParam("id") Long id) {
        Goal goal = Goal.findById(id);
        if (goal == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Goal not found with id: " + id)
                    .build();
        }

        goal.delete(); // JPA se encarga de las tareas asociadas

        return Response.ok("Goal deleted with id: " + id).build();
    }


}
