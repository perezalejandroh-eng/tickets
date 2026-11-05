package com.soporte.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketCreateRequest {
    private Long dependenciaId;
    private Long edificioId;
    private Long pisoId;
    private String area;

    @NotNull(message = "El tipo de solicitud es requerido")
    private Long tipoSolicitudId;

    @NotNull(message = "La categoría es requerida")
    private Long categoriaServicioId;

    private Long subcategoriaServicioId;

    @NotBlank(message = "El asunto es requerido")
    private String asunto;

    @NotBlank(message = "La descripción es requerida")
    private String descripcion;

    @NotNull(message = "El impacto es requerido")
    private Long impactoId;

    @NotNull(message = "La urgencia es requerida")
    private Long urgenciaId;

    private String canalOrigen = "PORTAL_WEB";
}
