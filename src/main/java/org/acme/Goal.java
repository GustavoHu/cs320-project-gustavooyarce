package org.acme;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import java.util.List;

@Entity
public class Goal extends PanacheEntity {

    public String title;
    public String description;
    public String color;

    @OneToMany(mappedBy = "goal",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.EAGER) // <-- EAGER para evitar LazyInitializationException
    @JsonManagedReference
    public List<Task> tasks;
}
