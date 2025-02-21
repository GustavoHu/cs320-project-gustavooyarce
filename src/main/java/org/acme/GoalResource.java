package org.acme;

import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/goals")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class GoalResource {

    @POST
    @Transactional
    public Response createGoal(Goal goal) {
        if (goal.title == null || goal.title.trim().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Title cannot be empty.")
                    .build();
        }
        if (goal.title.trim().length() < 3) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Title must be at least 3 characters.")
                    .build();
        }
        if (goal.title.trim().length() > 150) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Title cannot exceed 150 characters.")
                    .build();
        }
        if (goal.description != null && goal.description.length() > 150) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Description cannot exceed 150 characters.")
                    .build();
        }

        goal.persist();
        return Response.ok(goal).build();
    }

    @GET
    public List<Goal> getAllGoals() {
        // Con EAGER no necesitas @Transactional ni forzar la carga.
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
        goal.delete();
        return Response.ok("Goal deleted with id: " + id).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response updateGoal(@PathParam("id") Long id, Goal updatedGoal) {
        Goal goal = Goal.findById(id);
        if (goal == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Goal not found with id: " + id)
                    .build();
        }

        // Validar y actualizar el título
        if (updatedGoal.title != null) {
            if (updatedGoal.title.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("Title cannot be empty.")
                        .build();
            }
            if (updatedGoal.title.trim().length() < 3) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("Title must be at least 3 characters.")
                        .build();
            }
            if (updatedGoal.title.trim().length() > 150) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("Title cannot exceed 150 characters.")
                        .build();
            }
            goal.title = updatedGoal.title;
        }

        // Validar y actualizar la descripción
        if (updatedGoal.description != null) {
            if (updatedGoal.description.length() > 150) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("Description cannot exceed 150 characters.")
                        .build();
            }
            goal.description = updatedGoal.description;
        }

        // Actualizar color
        if (updatedGoal.color != null) {
            goal.color = updatedGoal.color;
        }

        return Response.ok(goal).build();
    }
}
