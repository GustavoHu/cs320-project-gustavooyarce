package org.acme;

import com.fasterxml.jackson.annotation.JsonBackReference;
import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Column;

/**
 * Represents a Task that belongs to a Goal, with a status (To Do, In Progress, Done).
 */
@Entity
public class Task extends PanacheEntity {

    /**
     * Title of the task (e.g. "Write report")
     */
    @Column(nullable = false)
    public String title;

    /**
     * Optional description (e.g. "Summary for client")
     */
    public String description;

    /**
     * Status of the task: "todo", "inProgress", or "done"
     */
    @Column(nullable = false)
    public String status; // "todo", "inProgress", "done"

    /**
     * The Goal this task belongs to.
     * If you want a foreign key, you can use @ManyToOne.
     */
    @ManyToOne
    @JoinColumn(name = "goal_id")
    @JsonBackReference
    public Goal goal;
}
