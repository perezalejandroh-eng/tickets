package com.soporte.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ComentarioRequest {
    @NotBlank(message = "El comentario no puede estar vacío")
    private String comentario;
    private boolean esInterno = false;
}
