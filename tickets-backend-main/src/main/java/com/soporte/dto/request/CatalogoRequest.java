package com.soporte.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CatalogoRequest {

    @NotBlank(message = "El nombre es requerido")
    private String nombre;

    private String descripcion;

    // Edificio
    private String direccion;

    // CategoriaServicio
    private String icono;

    // SubcategoriaServicio
    private Long categoriaServicioId;

    // EstatusTicket
    private Integer orden;
    private String color;
    private Boolean esFinal;
}
