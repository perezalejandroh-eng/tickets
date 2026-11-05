package com.soporte.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "prioridades")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Prioridad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Column(nullable = false)
    private Integer nivel;

    @Column(length = 200)
    private String descripcion;

    @Column(length = 20)
    private String color;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
