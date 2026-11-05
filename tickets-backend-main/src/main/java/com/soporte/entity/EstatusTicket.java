package com.soporte.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "estatus_ticket")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EstatusTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String nombre;

    @Column(length = 300)
    private String descripcion;

    @Column(nullable = false)
    private Integer orden;

    @Column(length = 20)
    private String color;

    @Column(name = "es_final", nullable = false)
    @Builder.Default
    private Boolean esFinal = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
