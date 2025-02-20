package org.acme;

import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

/**
 * TaskResource handles CRUD operations for Task entities,
 * including associating them with a Goal.
 */
@Path("/tasks")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TaskResource {

    /**
     * CREATE a new Task
     */
    @POST
    @Transactional
    public Response createTask(Task task) {
        // Validate minimal fields
        if (task.title == null || task.title.trim().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Task title cannot be empty.")
                    .build();
        }
        if (task.status == null) {
            task.status = "todo"; // default
        }

        // Optionally check if the goal exists
        if (task.goal == null || task.goal.id == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("A valid goalId is required.")
                    .build();
        }
        Goal goal = Goal.findById(task.goal.id);
        if (goal == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Goal not found with id: " + task.goal.id)
                    .build();
        }

        // Persist
        task.goal = goal; // link the existing goal
        task.persist();
        return Response.ok(task).build();
    }

    /**
     * READ all tasks (optionally by goalId).
     * e.g. GET /tasks?goalId=1
     */
    @GET
    public List<Task> getTasks(@QueryParam("goalId") Long goalId) {
        if (goalId == null) {
            // Return all tasks
            return Task.listAll();
        } else {
            // Return tasks for a specific goal
            return Task.list("goal.id", goalId);
        }
    }

    /**
     * UPDATE task status or details
     */
    @PUT
    @Path("/{id}")
    @Transactional
    public Response updateTask(@PathParam("id") Long id, Task updated) {
        Task task = Task.findById(id);
        if (task == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Task not found with id: " + id)
                    .build();
        }
        // Update fields
        if (updated.title != null && !updated.title.trim().isEmpty()) {
            task.title = updated.title;
        }
        if (updated.description != null) {
            task.description = updated.description;
        }
        if (updated.status != null) {
            task.status = updated.status; // "todo", "inProgress", "done"
        }

        return Response.ok(task).build();
    }

    /**
     * DELETE task
     */
    @DELETE
    @Path("/{id}")
    @Transactional
    public Response deleteTask(@PathParam("id") Long id) {
        Task task = Task.findById(id);
        if (task == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Task not found with id: " + id)
                    .build();
        }
        task.delete();
        return Response.ok("Task deleted with id: " + id).build();
    }
}
