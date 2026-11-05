package com.soporte.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "urgencias")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Urgencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Column(nullable = false)
    private Integer valor;

    @Column(length = 200)
    private String descripcion;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
