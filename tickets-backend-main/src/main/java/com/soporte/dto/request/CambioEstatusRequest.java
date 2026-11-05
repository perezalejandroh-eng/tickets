package com.soporte.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CambioEstatusRequest {
    @NotNull(message = "El nuevo estatus es requerido")
    private Long nuevoEstatusId;
    private String comentario;
    private String solucion;
}
